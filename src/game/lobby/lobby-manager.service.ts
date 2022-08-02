import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { CustomSocket } from 'src/utils/types';
import { Lobby } from './lobby';
import { COLORS } from 'src/utils/constants';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class LobbyManagerService {
  private readonly lobbies: Map<Lobby['id'], Lobby> = new Map<
    Lobby['id'],
    Lobby
  >();

  public createLobby(
    maxClients: number,
    socket: WebSocket,
    userId: string,
    hostColor?: COLORS,
  ): [Lobby, COLORS] {
    const client = socket as CustomSocket;
    if (client.lobbyId) throw new WsException('Client already in lobby');

    const lobby = new Lobby(maxClients);
    this.lobbies.set(lobby.id, lobby);
    const color = this.joinLobby(lobby.id, socket, userId, hostColor);
    return [lobby, color];
  }

  public joinLobby(
    lobbyId: string,
    socket: WebSocket,
    userId: string,
    hostColor?: COLORS,
  ): COLORS {
    const client: CustomSocket = socket as CustomSocket;
    if (client.lobbyId) throw new WsException('Client already in lobby');

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) throw new WsException('Lobby not found');

    client.id = userId;
    return lobby.addClient(client, hostColor);
  }

  public leaveLobby(client: CustomSocket): void {
    if (!client.lobbyId || !client.id)
      throw new WsException('Client not in lobby');

    const lobby = this.lobbies.get(client.lobbyId);
    if (!lobby) throw new WsException('Lobby not found');

    lobby.removeClient(client);
  }

  public getLobbies(): Map<Lobby['id'], Lobby> {
    return this.lobbies;
  }
}
