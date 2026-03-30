import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {

  constructor(private chatService: ChatService) {}

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