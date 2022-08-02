import { WsException } from '@nestjs/websockets';
import { COLORS } from 'src/utils/constants';
import { CustomSocket } from 'src/utils/types';
import { v4 } from 'uuid';

export class Lobby {
  public readonly id: string = v4();

  public readonly clients: Map<CustomSocket['id'], CustomSocket> = new Map<
    CustomSocket['id'],
    CustomSocket
  >();
  public readonly playersByColors: Map<COLORS, CustomSocket['id']> = new Map<
    COLORS,
    CustomSocket['id']
  >();

  constructor(private maxClients: number = 2) {}

  public addClient(client: CustomSocket, hostColor?: COLORS): COLORS {
    if (this.clients.size >= this.maxClients)
      throw new WsException('Lobby is full');

    let color: COLORS | undefined;

    if (this.clients.size === 0) {
      color = hostColor || Math.random() < 0.5 ? COLORS.WHITE : COLORS.BLACK;
    } else {
      color = this.playersByColors.get(COLORS.WHITE)
        ? COLORS.BLACK
        : COLORS.WHITE;
    }

    this.playersByColors.set(color, client.id);
    this.clients.set(client.id, client);
    client.lobbyId = this.id;
    return color;
  }

  public removeClient(client: CustomSocket): void {
    client.lobbyId = null;
    this.clients.delete(client.id);
    this.playersByColors.forEach((id, color) => {
      if (id === client.id) this.playersByColors.delete(color);
    });
  }

  public toJSON() {
    return {
      id: this.id,
      clients: Array.from(this.clients.values()).map((c) => {
        const filteredClient: Pick<CustomSocket, 'id' | 'lobbyId'> = {
          id: c.id,
          lobbyId: c.lobbyId,
        };
        return filteredClient;
      }),
      playersByColors: Array.from(this.playersByColors),
    };
  }
}
