import { COLORS } from 'src/utils/constants';

//TODO: receive user instead of userId
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
