import { Injectable } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { CustomSocket, UserDetails } from 'src/utils/types';
import { Lobby } from './lobby';
import { COLORS, Events } from 'src/utils/constants';
import { WsException } from '@nestjs/websockets';
import { GameStatus } from '../game-status';

@Injectable()
export class LobbyManagerService {
  private server: Server;
  private readonly lobbies: Map<Lobby['id'], Lobby> = new Map<
    Lobby['id'],
    Lobby
  >();

  public clientLobbyMap: Map<CustomSocket['id'], Lobby['id']> = new Map<
    CustomSocket['id'],
    Lobby['id']
  >();

  public setServer(server: Server): void {
    this.server = server;
  }

  public getGameStatus(lobbyId: string): GameStatus {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) throw new WsException('Lobby not found');

    return lobby.getGameStatus();
  }

  public isLobbyFull(lobbyId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) throw new WsException('Lobby not found');

    return lobby.isFull();
  }

  public dispatchGameStatus(lobbyId: string): void {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) throw new WsException('Lobby not found');

    lobby.clients.forEach((c) => {
      c.send(
        JSON.stringify({
          event: Events.GAME_STATUS,
          data: {
            gameStatus: lobby.getGameStatus(),
            lobby,
          },
        }),
      );
    });
  }

  public createLobby(
    name: string,
    maxClients: number,
    socket: WebSocket,
    user: UserDetails,
    hostColor: COLORS,
  ): [Lobby, COLORS] {
    const client = socket as CustomSocket;

    if (client.lobbyId || this.clientLobbyMap.get(user._id))
      throw new WsException('Client already in lobby');

    const lobby = new Lobby(name, maxClients);
    this.lobbies.set(lobby.id, lobby);
    const color = this.joinLobby(lobby.id, socket, user, hostColor);
    return [lobby, color];
  }

  public joinLobby(
    lobbyId: string,
    socket: WebSocket,
    user: UserDetails,
    hostColor?: COLORS,
  ): COLORS {
    const client: CustomSocket = socket as CustomSocket;
    if (client.lobbyId || this.clientLobbyMap.get(user._id))
      throw new WsException('Client already in lobby');

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) throw new WsException('Lobby not found');

    client.id = user._id;
    client.details = user;
    const color = lobby.addClient(client, hostColor);
    this.clientLobbyMap.set(client.id, lobby.id);
    client.color = color;
    this.sendLobbiesToAll();
    return color;
  }

  public leaveLobby(client: CustomSocket): void {
    const lobby = this.lobbies.get(client.lobbyId);
    if (!lobby) throw new WsException('Lobby not found');

    const { lobbyId } = client;
    lobby.removeClient(client);
    this.clientLobbyMap.delete(client.id);
    this.dispatchGameStatus(lobbyId);
    if (lobby.clients.size === 0) this.lobbies.delete(lobby.id);
    this.sendLobbiesToAll();
  }

  public getLobbies(): Lobby[] {
    return Array.from(this.lobbies.values());
  }

  public handleMove(client: CustomSocket, move: any): void {
    //TODO: do not bind lobby id to client
    const lobby = this.lobbies.get(client.lobbyId);
    if (!lobby) throw new WsException('Lobby not found');

    lobby.clients.forEach((c) => {
      if (c !== client) {
        c.send(JSON.stringify({ event: Events.MOVE, data: move }));
      }
    });
  }

  public sendLobbiesToAll(): void {
    this.server.clients.forEach((c) => {
      c.send(
        JSON.stringify({ event: Events.LOBBY_LIST, data: this.getLobbies() }),
      );
    });
  }
}
