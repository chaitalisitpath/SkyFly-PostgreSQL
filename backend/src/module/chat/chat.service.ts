import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

 async saveMessage(sessionId: string, sender: 'USER' | 'BOT', message: string, userId?: number) {
  return this.prisma.$executeRaw`
    INSERT INTO "ChatMessage" ("sessionId", "sender", "message", "userId")
    VALUES (${sessionId}, ${sender}::"ChatSender", ${message}, ${userId ?? null})
  `;
 }

 getReply(message: string): string {
  const msg = message.toLowerCase().trim();

  const intents = [
    {
      keywords: ["hi", "hello", "hey"],
      response: "Hi! How can I help you with flights?"
    },
    {
      keywords: ["flight", "book", "ticket", "travel"],
      response: "Sure! Please tell me source and destination."
    },
    {
      keywords: ["cancel", "refund", "return"],
      response: "Please provide your booking ID to proceed with cancellation."
    },
    {
      keywords: ["thanks", "thank you", "good service"],
      response: "You're welcome! 😊"
    }
  ];

  // Check intents
  for (const intent of intents) {
    if (intent.keywords.some(keyword => msg.includes(keyword))) {
      return intent.response;
    }
  }

  // Default fallback
  return "Sorry, I didn't understand. Can you rephrase?";
}
}