import {
  ConnectedSocket,
  MessageBody,
  WebSocketGateway,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  private readonly adminRoom = 'support-admins';

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('registerAdmin')
  async registerAdmin(@ConnectedSocket() client: Socket) {
    client.join(this.adminRoom);
    const conversations = await this.chatService.getSupportConversations();
    client.emit('supportConversations', conversations);
  }

  @SubscribeMessage('requestSupportConversations')
  async requestSupportConversations(@ConnectedSocket() client: Socket) {
    const conversations = await this.chatService.getSupportConversations();
    client.emit('supportConversations', conversations);
  }

  @SubscribeMessage('requestHumanSupport')
  async requestHumanSupport(
    @MessageBody() payload: { userId?: number; userName?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = Number(payload?.userId);
    if (!userId) {
      client.emit('supportError', 'User id is required for support chat.');
      return;
    }

    const room = `support:${userId}`;
    client.join(room);

    const history = await this.chatService.getSupportHistory(userId);
    client.emit('supportHistory', history);

    client.to(this.adminRoom).emit('supportRequested', {
      room,
      userId,
      userName: payload?.userName || `User ${userId}`,
      requestedAt: new Date().toISOString(),
    });

    const conversations = await this.chatService.getSupportConversations();
    client.to(this.adminRoom).emit('supportConversations', conversations);
  }

  @SubscribeMessage('joinSupportRoom')
  async joinSupportRoom(
    @MessageBody() payload: { userId?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = Number(payload?.userId);
    if (!userId) {
      client.emit('supportError', 'User id is required to join room.');
      return;
    }

    const room = `support:${userId}`;
    client.join(room);

    const history = await this.chatService.getSupportHistory(userId);
    client.emit('supportHistory', history);
  }

  @SubscribeMessage('sendSupportMessage')
  async sendSupportMessage(
    @MessageBody()
    payload: {
      userId?: number;
      text?: string;
      senderRole?: 'USER' | 'ADMIN';
      senderName?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = Number(payload?.userId);
    const text = payload?.text?.trim();
    const senderRole = payload?.senderRole === 'ADMIN' ? 'ADMIN' : 'USER';

    if (!userId || !text) {
      client.emit('supportError', 'Invalid support message payload.');
      return;
    }

    const room = `support:${userId}`;
    // Persist admin message as BOT to stay compatible with current ChatSender enum.
    await this.chatService.saveMessage(
      room,
      senderRole === 'ADMIN' ? 'BOT' : 'USER',
      senderRole === 'ADMIN' ? `[ADMIN] ${text}` : text,
      userId,
    );

    client.to(room).emit('supportMessage', {
      userId,
      text,
      senderRole,
      senderName: payload?.senderName || (senderRole === 'ADMIN' ? 'Support Agent' : 'User'),
      createdAt: new Date().toISOString(),
    });

    const conversations = await this.chatService.getSupportConversations();
    client.to(this.adminRoom).emit('supportConversations', conversations);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ) {
    const cleanMessage = message?.trim();
    if (!cleanMessage) return;

    console.log('User:', cleanMessage);
    client.emit('botTyping', true);

    try {
      // Persist user message using socket id as session id.
      await this.chatService.saveMessage(client.id, 'USER', cleanMessage);

      // Get bot reply from service based on user text.
      const reply = await this.chatService.getReply(cleanMessage);

      // Persist generated bot reply for complete conversation history.
      await this.chatService.saveMessage(client.id, 'BOT', reply);

      // Send only bot text; frontend controls labels/styling.
      client.emit('receiveMessage', reply);
    } catch {
      client.emit('receiveMessage', 'Sorry, I could not process that right now. Please try again.');
    } finally {
      client.emit('botTyping', false);
    }
  }
}