import { Body, Controller, Post } from '@nestjs/common';
import { UserDto } from 'src/users/dto/user.dto';
import { AuthResponse } from './auth.response';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<AuthResponse> {
    return this.authService.login(email, password);
  }

  @Post('register')
  register(@Body() userDto: UserDto): Promise<AuthResponse> {
    return this.authService.register(userDto);
  }
}
