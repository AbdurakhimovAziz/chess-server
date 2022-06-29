import { UserDocument } from 'src/users/schemas/user.schema';

export interface SigninResponse {
  token: string;
  user: UserDocument;
}

export interface SignupResponse {
  message: string;
}
