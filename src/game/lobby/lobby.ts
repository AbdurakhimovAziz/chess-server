import { CustomSocket } from 'src/utils/types';
import { v4 } from 'uuid';

export class Lobby {
  public readonly id: string = v4();

  public readonly clients: Map<CustomSocket['id'], CustomSocket> = new Map<
    CustomSocket['id'],
    CustomSocket
  >();

  constructor(private maxClients: number = 2) {}

  public addClient(client: CustomSocket): void {
    if (this.clients.size < this.maxClients) {
      this.clients.set(client.id, client);
      client.lobby = this;
    }
  }

  public removeClient(client: CustomSocket): void {
    this.clients.delete(client.id);
    client.lobby = null;
  }
}
