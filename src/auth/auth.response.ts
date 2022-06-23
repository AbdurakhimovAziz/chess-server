import { UserDto } from 'src/users/dto/user.dto';
import { UserDocument } from 'src/users/schemas/user.schema';

export interface AuthResponse {
  token: string;
  user: UserDto;
}
