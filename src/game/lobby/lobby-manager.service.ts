import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { CustomSocket, UserDetails } from 'src/utils/types';
import { Lobby } from './lobby';
import { COLORS } from 'src/utils/constants';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class LobbyManagerService {
  private readonly lobbies: Map<Lobby['id'], Lobby> = new Map<
    Lobby['id'],
    Lobby
  >();

  public clientLobbyMap: Map<CustomSocket['id'], Lobby['id']> = new Map<
    CustomSocket['id'],
    Lobby['id']
  >();

  public createLobby(
    maxClients: number,
    socket: WebSocket,
    user: UserDetails,
    hostColor?: COLORS,
  ): [Lobby, COLORS] {
    const client = socket as CustomSocket;
    console.log(this.clientLobbyMap.get(user._id));

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
  }

  public getLobbies(): Map<Lobby['id'], Lobby> {
    return this.lobbies;
  }
}
