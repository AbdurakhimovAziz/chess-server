import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any, ...args: any[]): void {
    console.log('Client connected');
    client.send(JSON.stringify({ event: 'connected' }));
  }

  @SubscribeMessage('message')
  handleEvent(
    @MessageBody() data: string,
    @ConnectedSocket() client: WebSocket,
  ): string {
    client.send(JSON.stringify({ event: 'message', data }));
    return 'data';
  }

  @SubscribeMessage('test')
  handleMsg(
    @MessageBody() data: string,
    @ConnectedSocket() client: WebSocket,
  ): string {
    client.send(JSON.stringify({ event: 'test', data }));
    return 'df';
  }
}
