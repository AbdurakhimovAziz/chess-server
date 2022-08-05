import { Injectable } from '@nestjs/common';
import { Server, WebSocket } from 'ws';
import { CustomSocket, UserDetails } from 'src/utils/types';
import { Lobby } from './lobby';
import { COLORS, Events } from 'src/utils/constants';
import { WsException } from '@nestjs/websockets';

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

  public createLobby(
    maxClients: number,
    socket: WebSocket,
    user: UserDetails,
    hostColor?: COLORS,
  ): [Lobby, COLORS] {
    const client = socket as CustomSocket;
    console.log(client.lobbyId, this.clientLobbyMap.get(user._id));

    if (client.lobbyId || this.clientLobbyMap.get(user._id))
      throw new WsException('Client already in lobby');

    const lobby = new Lobby(maxClients);
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
    if (!client.lobbyId || !client.id)
      throw new WsException('Client not in lobby');

    const lobby = this.lobbies.get(client.lobbyId);
    if (!lobby) throw new WsException('Lobby not found');

    lobby.removeClient(client);
    this.clientLobbyMap.delete(client.id);
    if (lobby.clients.size === 0) this.lobbies.delete(lobby.id);
    this.sendLobbiesToAll();
  }

  public getLobbies(): Lobby[] {
    return Array.from(this.lobbies.values());
  }

  public handleMove(client: CustomSocket, move: any): void {
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
