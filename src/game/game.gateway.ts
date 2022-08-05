import { UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
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
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server: Server;

  constructor(private lobbyManager: LobbyManagerService) {}

  afterInit(server: Server) {
    this.lobbyManager.setServer(server);
  }

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
    const lobbies = this.lobbyManager.getLobbies();

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
      data.user,
      data.color,
    );

    return {
      event: Events.LOBBY_CREATE,
      data: {
        lobby,
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
    const color = this.lobbyManager.joinLobby(data.lobbyId, client, data.user);

    return {
      event: Events.LOBBY_JOIN,
      data: {
        lobbyId: data.lobbyId,
        message: 'joined lobby',
        color,
        gameStatus: this.lobbyManager.getGameStatus(data.lobbyId),
      },
    };
  }

  @SubscribeMessage(Events.LOBBY_LEAVE)
  public handleLeaveLobby(
    @MessageBody() data: LobbyLeaveDTO,
    @ConnectedSocket() client: WebSocket,
  ): WsResponse<any> {
    this.lobbyManager.leaveLobby(client as CustomSocket);
    return {
      event: Events.LOBBY_LEAVE,
      data: { message: 'left lobby', lobbyId: data.lobbyId },
    };
  }

  @SubscribeMessage(Events.MOVE)
  public handleMove(
    @MessageBody() data: any,
    @ConnectedSocket() client: WebSocket,
  ) {
    this.lobbyManager.handleMove(client as CustomSocket, data);
  }

  public handleDisconnect(client: CustomSocket): void {
    try {
      console.log('Client disconnected', client.id, client.lobbyId);
      this.lobbyManager.leaveLobby(client);
    } catch (error) {}
  }
}
