import { WebSocket } from 'ws';
import { Lobby } from 'src/game/lobby/lobby';
import { COLORS } from './constants';

export type CustomSocket = WebSocket & {
  id: string;
  lobbyId: string | null;
};
