export interface LobbyCreateDTO {
  maxClients: number;
}

export interface LobbyJoinDTO {
  lobbyId: string;
  userId: string;
}

export interface LobbyLeaveDTO extends LobbyJoinDTO {}
