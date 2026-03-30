import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

const GEMINI_REQUEST_TIMEOUT_MS = 12000;
const GEMINI_TARGET_CACHE_TTL_MS = 30 * 60 * 1000;
const GEMINI_ERROR_PREVIEW_LENGTH = 240;

const FALLBACK_INTENTS: ReadonlyArray<{
  keywords: readonly string[];
  response: string;
}> = [
  {
    keywords: ['hi', 'hello', 'hey'],
    response: 'Hi! How can I help you with flights?',
  },
  {
    keywords: ['flight', 'book', 'ticket', 'travel'],
    response: 'Sure! Please tell me source and destination.',
  },
  {
    keywords: ['cancel', 'refund', 'return'],
    response: 'Please provide your booking ID to proceed with cancellation.',
  },
  {
    keywords: ['thanks', 'thank you', 'good service'],
    response: "You're welcome! 😊",
  },
];

type GeminiModelInfo = {
  name?: string;
  supportedGenerationMethods?: string[];
};

type GeminiListModelsResponse = {
  models?: GeminiModelInfo[];
  nextPageToken?: string;
};

type GeminiCandidateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

type GeminiTarget = {
  apiVersion: 'v1' | 'v1beta';
  model: string;
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly geminiApiKey =
    process.env.GEMINI_API_KEY || process.env.GAMINI_API_KEY;
  private readonly preferredModels = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
  ];
  private readonly preferredModelRanks = new Map(
    this.preferredModels.map((model, index) => [model, index]),
  );
  private cachedGeminiTarget: (GeminiTarget & { expiresAt: number }) | null = null;
  private geminiTargetLookupInFlight: Promise<GeminiTarget | null> | null = null;
  private hasLoggedMissingApiKey = false;

  constructor(private prisma: PrismaService) {}

  async saveMessage(
    sessionId: string,
    sender: 'USER' | 'BOT',
    message: string,
    userId?: number,
  ) {
    return this.prisma.$executeRaw`
      INSERT INTO "ChatMessage" ("sessionId", "sender", "message", "userId")
      VALUES (${sessionId}, ${sender}::"ChatSender", ${message}, ${userId ?? null})
    `;
  }

  async getReply(message: string): Promise<string> {
    const normalizedMessage = message.trim();
    if (!normalizedMessage) {
      return "Sorry, I didn't understand. Can you rephrase?";
    }

    const aiReply = await this.getGeminiReply(normalizedMessage);
    if (aiReply) {
      return aiReply;
    }

    // Fallback to deterministic replies if AI is unavailable.
    const loweredMessage = normalizedMessage.toLowerCase();

    for (const intent of FALLBACK_INTENTS) {
      for (const keyword of intent.keywords) {
        if (loweredMessage.includes(keyword)) {
          return intent.response;
        }
      }
    }

    // Default fallback
    return "Sorry, I didn't understand. Can you rephrase?";
  }

  private async getGeminiReply(message: string): Promise<string | null> {
    if (!this.geminiApiKey) {
      if (!this.hasLoggedMissingApiKey) {
        this.hasLoggedMissingApiKey = true;
        this.logger.warn('Gemini API key not configured.');
      }
      return null;
    }

    const target = await this.getBestGeminiTarget();
    if (!target) {
      this.logger.warn('No Gemini model with generateContent support was found for this API key.');
      return null;
    }

    const systemPrompt =
      'You are SkyFly assistant. Give short, helpful answers for flight, booking, cancellation, baggage, and travel-related questions.';
    const endpoint = `https://generativelanguage.googleapis.com/${target.apiVersion}/models/${target.model}:generateContent`;
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\nUser question: ${message}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 250,
      },
    };

    try {
      const response = await this.fetchWithTimeout(
        `${endpoint}?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        },
        GEMINI_REQUEST_TIMEOUT_MS,
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn(
          `Gemini model ${target.model} (${target.apiVersion}) failed (${response.status}): ${errorText.slice(0, GEMINI_ERROR_PREVIEW_LENGTH)}`,
        );

        // If the provider changed availability, clear cache to discover another model next call.
        if (response.status === 404 || response.status === 400) {
          this.cachedGeminiTarget = null;
        }

        return null;
      }

      const data = (await response.json()) as GeminiCandidateResponse;
      const parts = data?.candidates?.[0]?.content?.parts ?? [];
      const reply = parts
        .map((part) => part?.text?.trim() || '')
        .filter(Boolean)
        .join('\n')
        .trim();

      return reply || null;
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Unknown Gemini error';
      this.logger.warn(`Gemini request error (${target.model}, ${target.apiVersion}): ${messageText}`);
      return null;
    }
  }

  private async getBestGeminiTarget(): Promise<GeminiTarget | null> {
    const now = Date.now();
    if (this.cachedGeminiTarget && this.cachedGeminiTarget.expiresAt > now) {
      return {
        apiVersion: this.cachedGeminiTarget.apiVersion,
        model: this.cachedGeminiTarget.model,
      };
    }

    if (!this.geminiTargetLookupInFlight) {
      this.geminiTargetLookupInFlight = this.discoverBestGeminiTarget().finally(() => {
        this.geminiTargetLookupInFlight = null;
      });
    }

    return this.geminiTargetLookupInFlight;
  }

  private async discoverBestGeminiTarget(): Promise<GeminiTarget | null> {
    const versionOrder: Array<'v1' | 'v1beta'> = ['v1', 'v1beta'];

    for (const apiVersion of versionOrder) {
      const availableModels = await this.listGenerateContentModels(apiVersion);
      if (!availableModels.length) {
        continue;
      }

      this.logger.log(
        `Gemini generateContent models (${apiVersion}): ${availableModels.slice(0, 12).join(', ')}${availableModels.length > 12 ? ', ...' : ''}`,
      );

      const selected = this.selectPreferredModel(availableModels);
      this.cachedGeminiTarget = {
        apiVersion,
        model: selected,
        expiresAt: Date.now() + GEMINI_TARGET_CACHE_TTL_MS,
      };

      this.logger.log(`Gemini model selected: ${selected} (${apiVersion})`);
      return { apiVersion, model: selected };
    }

    return null;
  }

  private async listGenerateContentModels(apiVersion: 'v1' | 'v1beta'): Promise<string[]> {
    const allModels = new Set<string>();
    let pageToken: string | undefined;

    // Pagination is supported by ListModels; usually a single page, but this keeps it reliable.
    do {
      const tokenPart = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '';
      const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${this.geminiApiKey}${tokenPart}`;

      try {
        const response = await this.fetchWithTimeout(endpoint, undefined, GEMINI_REQUEST_TIMEOUT_MS);
        if (!response.ok) {
          const errorText = await response.text();
          this.logger.warn(
            `Gemini listModels failed (${apiVersion}, ${response.status}): ${errorText.slice(0, GEMINI_ERROR_PREVIEW_LENGTH)}`,
          );
          return [];
        }

        const data = (await response.json()) as GeminiListModelsResponse;
        for (const item of data.models ?? []) {
          const supportsGenerate = item.supportedGenerationMethods?.includes('generateContent');
          const modelName = item.name?.startsWith('models/')
            ? item.name.slice('models/'.length)
            : item.name;

          if (supportsGenerate && modelName) {
            allModels.add(modelName);
          }
        }

        pageToken = data.nextPageToken || undefined;
      } catch (error) {
        const messageText = error instanceof Error ? error.message : 'Unknown listModels error';
        this.logger.warn(`Gemini listModels request error (${apiVersion}): ${messageText}`);
        return [];
      }
    } while (pageToken);

    return [...allModels];
  }

  private selectPreferredModel(modelNames: string[]): string {
    const ranked = [...modelNames].sort((a, b) => {
      const aRank = this.preferredModelRanks.get(a) ?? Number.MAX_SAFE_INTEGER;
      const bRank = this.preferredModelRanks.get(b) ?? Number.MAX_SAFE_INTEGER;

      if (aRank !== bRank) {
        return aRank - bRank;
      }

      return a.localeCompare(b);
    });

    return ranked[0];
  }

  private async fetchWithTimeout(
    url: string,
    init?: RequestInit,
    timeoutMs = GEMINI_REQUEST_TIMEOUT_MS,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(url, {
        ...init,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
