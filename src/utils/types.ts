import { UserDocument } from 'src/users/schemas/user.schema';
import { WebSocket } from 'ws';
import { COLORS } from './constants';

export type CustomSocket = WebSocket & {
  id: string;
  lobbyId: string | null;
  color: COLORS;
  details: UserDetails;
};

export type UserDetails = Pick<
  UserDocument,
  '_id' | 'firstName' | 'lastName' | 'email'
>;
