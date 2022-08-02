import { UseFilters } from '@nestjs/common';
import {
  BaseWsExceptionFilter,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { WebsocketExceptionsFilter } from 'src/filters/websocket-exceptions.filter';
import { CustomSocket } from 'src/utils/types';
import { Server, WebSocket } from 'ws';
import { Events } from '../utils/constants';
import { LobbyCreateDTO, LobbyJoinDTO, LobbyLeaveDTO } from './dtos';
import { LobbyManagerService } from './lobby/lobby-manager.service';

@UseFilters(new WebsocketExceptionsFilter())
@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  constructor(private lobbyManager: LobbyManagerService) {}

  public handleConnection(client: WebSocket, ...args: any[]): void {
    console.log('Client connected');
    client.send(
      JSON.stringify({
        message: 'Successfully connected',
      }),
    );
  }

  @SubscribeMessage(Events.LOBBY_LIST)
  public getLobbies(): WsResponse<any> {
    const lobbies = Array.from(this.lobbyManager.getLobbies().values());

    return {
      event: Events.LOBBY_LIST,
      data: lobbies,
    };
  }

  @SubscribeMessage(Events.LOBBY_CREATE)
  public handleCreateLobby(
    @MessageBody() data: LobbyCreateDTO,
    @ConnectedSocket() client: WebSocket,
  ): WsResponse<any> {
    const [lobby, color] = this.lobbyManager.createLobby(
      data.maxClients,
      client,
      data.userId,
      data.color,
    );

    return {
      event: Events.LOBBY_CREATE,
      data: {
        lobby: lobby,
        hostColor: color,
        message: 'Lobby created',
      },
    };
  }

  @SubscribeMessage(Events.LOBBY_JOIN)
  public handleJoinLobby(
    @MessageBody() data: LobbyJoinDTO,
    @ConnectedSocket() client: WebSocket,
  ): WsResponse<any> {
    const color = this.lobbyManager.joinLobby(
      data.lobbyId,
      client,
      data.userId,
    );

    return {
      event: Events.LOBBY_JOIN,
      data: {
        lobbyId: data.lobbyId,
        message: 'joined lobby',
        color,
      },
    };
  }

  @SubscribeMessage(Events.LOBBY_LEAVE)
  public handleLeaveLobby(
    @MessageBody() data: LobbyLeaveDTO,
    @ConnectedSocket() client: WebSocket,
  ): WsResponse<any> {
    console.log('Client left lobby', client);

    this.lobbyManager.leaveLobby(client as CustomSocket);

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

  public handleDisconnect(client: CustomSocket): void {
    try {
      console.log('Client disconnected', client.id, client.lobbyId);
      this.lobbyManager.leaveLobby(client);
    } catch (error) {}
  }
}
