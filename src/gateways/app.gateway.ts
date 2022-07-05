import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection {
  @WebSocketServer()
  public server: Server;

  public handleConnection(client: WebSocket, ...args: any[]): void {
    console.log('Client connected');
    client.send(JSON.stringify({ data: 'Successfully connected' }));
  }

  @SubscribeMessage('message')
  public handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: WebSocket,
  ): WsResponse<any> {
    const event = 'message';
    return { event, data };
  }

  @SubscribeMessage('test')
  public handleTest(
    @MessageBody() data: string,
    @ConnectedSocket() client: WebSocket,
  ): WsResponse<any> {
    return { event: 'test', data };
  }
}
