import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';

import { CustomSocket } from 'src/utils/types';
import { Lobby } from './lobby';

@Injectable()
export class LobbyManagerService {
  private readonly lobbies: Map<Lobby['id'], Lobby> = new Map<
    Lobby['id'],
    Lobby
  >();

  public createLobby(maxClients: number): Lobby {
    const lobby = new Lobby(maxClients);
    this.lobbies.set(lobby.id, lobby);
    return lobby;
  }

  public joinLobby(lobbyId: string, socket: WebSocket, userId: string): void {
    const lobby = this.lobbies.get(lobbyId);
    if (lobby) {
      const client: CustomSocket = socket as CustomSocket;
      client.id = userId;
      lobby.addClient(client);
    }
  }

  public leaveLobby(lobbyId: string, socket: WebSocket, userId: string): void {
    const lobby = this.lobbies.get(lobbyId);
    if (lobby) {
      const client: CustomSocket = socket as CustomSocket;
      client.id = userId;
      lobby.removeClient(client);
    }
  }

  getLobbies(): Map<Lobby['id'], Lobby> {
    return this.lobbies;
  }
}
