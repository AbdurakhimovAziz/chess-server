import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { v4 } from 'uuid';
import { Server, WebSocket } from 'ws';
import { Events } from '../utils/constants';
import { LobbyCreateDTO, LobbyJoinDTO, LobbyLeaveDTO } from './dtos';
import { LobbyManagerService } from './lobby/lobby-manager.service';

@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(private lobbyManager: LobbyManagerService) {}

  public handleConnection(client: WebSocket, ...args: any[]): void {
    const id = v4();
    console.log('Client connected');
    client.send(JSON.stringify({ data: 'Successfully connected' }));
  }

  @SubscribeMessage(Events.MESSAGE)
  public handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: WebSocket,
  ): WsResponse<any> {
    const event = 'message';
    console.log('Message received: ', data);

    return { event, data };
  }

  @SubscribeMessage(Events.TEST)
  public handleTest(
    @MessageBody() data: string,
    @ConnectedSocket() client: WebSocket,
  ) {
    this.server.clients.forEach((ws) => {
      ws.send(JSON.stringify({ event: 'test', data: this.server.clients }));
    });
  }

  @SubscribeMessage(Events.LOBBY_CREATE) public handleCreateLobby(
    @MessageBody() data: LobbyCreateDTO,
  ): WsResponse<any> {
    const lobby = this.lobbyManager.createLobby(data.maxClients);
    console.log('Lobby created: ', lobby);

    return {
      event: Events.LOBBY_CREATE,
      data: {
        lobbyId: lobby.id,
        message: 'Lobby created',
      },
    };
  }

  @SubscribeMessage(Events.LOBBY_JOIN) public handleJoinLobby(
    @MessageBody() data: LobbyJoinDTO,
    @ConnectedSocket() client: WebSocket,
  ): WsResponse<any> {
    // const
    this.lobbyManager.joinLobby(data.lobbyId, client, data.userId);
    return {
      event: Events.LOBBY_JOIN,
      data: {
        lobbyId: data.lobbyId,
        message: 'joined lobby',
      },
    };
  }

  @SubscribeMessage(Events.LOBBY_LEAVE) public handleLeaveLobby(
    @MessageBody() data: LobbyLeaveDTO,
    @ConnectedSocket() client: WebSocket,
  ): WsResponse<any> {
    this.lobbyManager.leaveLobby(data.lobbyId, client, data.userId);
    return {
      event: Events.LOBBY_LEAVE,
      data: { message: 'left lobby', lobbyId: data.lobbyId },
    };
  }

  @SubscribeMessage(Events.MOVE)
  public handleMove(
    @MessageBody() data: string,
    @ConnectedSocket() client: WebSocket,
  ) {
    this.server.clients.forEach((ws) => {
      if (ws !== client) {
        ws.send(JSON.stringify({ event: 'move', data }));
      }
    });
  }

  public handleDisconnect(client: WebSocket): void {
    console.log('Client disconnected');
  }
}
