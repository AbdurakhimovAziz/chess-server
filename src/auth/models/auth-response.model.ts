import { UserDocument } from 'src/users/schemas/user.schema';

export interface AuthResponse {
  token: string;
  user: UserDocument;
}
