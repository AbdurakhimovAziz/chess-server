import { WsException } from '@nestjs/websockets';
import { COLORS, Events } from 'src/utils/constants';
import { CustomSocket } from 'src/utils/types';
import { v4 } from 'uuid';

export class Lobby {
  public readonly id: string = v4();

  public readonly clients: Map<CustomSocket['id'], CustomSocket> = new Map<
    CustomSocket['id'],
    CustomSocket
  >();

  constructor(private maxClients: number = 2) {}

  public addClient(client: CustomSocket, hostColor?: COLORS): COLORS {
    if (this.clients.size >= this.maxClients)
      throw new WsException('Lobby is full');

    let color: COLORS | undefined;

    if (this.clients.size === 0) {
      color = hostColor || Math.random() < 0.5 ? COLORS.WHITE : COLORS.BLACK;
    } else {
      this.clients.forEach((c, _) => {
        if (c.color === COLORS.WHITE) color = COLORS.BLACK;
        else color = COLORS.WHITE;
      });
    }

    this.clients.set(client.id, client);
    client.lobbyId = this.id;
    return color;
  }

  public removeClient(client: CustomSocket): void {
    client.lobbyId = null;
    this.clients.delete(client.id);
    this.clients.forEach((c) => {
      c.send(
        JSON.stringify({ event: Events.ERROR, data: 'Opponent disconnected' }),
      );
    });
  }

  public toJSON() {
    return {
      id: this.id,
      clients: Array.from(this.clients.values()).map((c) => {
        const filteredClient: Pick<
          CustomSocket,
          'id' | 'lobbyId' | 'details' | 'color'
        > = {
          id: c.id,
          lobbyId: c.lobbyId,
          details: c.details,
          color: c.color,
        };
        return filteredClient;
      }),
    };
  }
}
