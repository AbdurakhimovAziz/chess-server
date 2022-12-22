import { COLORS } from 'src/utils/constants';
import { UserDetails } from 'src/utils/types';

export interface LobbyCreateDTO {
  name: string;
  maxClients: number;
  user: UserDetails;
  color?: COLORS;
}

export interface LobbyJoinDTO {
  lobbyId: string;
  user: UserDetails;
}

export interface LobbyLeaveDTO extends LobbyJoinDTO {}
