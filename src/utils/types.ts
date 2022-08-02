import { WebSocket } from 'ws';

export type CustomSocket = WebSocket & {
  id: string;
  lobbyId: string | null;
};
