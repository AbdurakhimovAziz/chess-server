import { WebSocket } from 'ws';
import { Lobby } from 'src/game/lobby/lobby';

export type CustomSocket = WebSocket & {
  id: string;
  lobby: Lobby | null;
};
