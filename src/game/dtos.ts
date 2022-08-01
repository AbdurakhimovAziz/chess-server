import { COLORS } from 'src/utils/constants';

export interface LobbyCreateDTO {
  maxClients: number;
  userId: string;
  color?: COLORS;
}

export interface LobbyJoinDTO {
  lobbyId: string;
  userId: string;
}

export interface LobbyLeaveDTO extends LobbyJoinDTO {}
