import { Body, Controller, Post } from '@nestjs/common';

import { UserDto } from '../users/dto/user.dto';
import { AuthResponse } from './models/auth-response.model';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  public login(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<AuthResponse> {
    return this.authService.login(email, password);
  }

  @Post('register')
  public register(@Body() userDto: UserDto): Promise<AuthResponse> {
    return this.authService.register(userDto);
  }
}
