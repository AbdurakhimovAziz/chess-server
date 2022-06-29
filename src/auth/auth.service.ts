import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { SigninResponse, SignupResponse } from './models/auth-response.model';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  public async login(email: string, password: string): Promise<SigninResponse> {
    const user = await this.validateUser(email, password);

    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);

    return {
      token: this.generateToken(user),
      user: user,
    };
  }

  public async register(userDto: UserDto): Promise<SignupResponse> {
    const user = await this.userService.findByEmail(userDto.email);
    if (user) {
      throw new BadRequestException('User already exists');
    }
    const hashedPassword = await bcrypt.hash(userDto.password, 10);
    const newUser = await this.userService.createUser({
      ...userDto,
      password: hashedPassword,
    });

    return {
      message: 'User created successfully',
    };
  }

  private generateToken(user: UserDocument): string {
    const payload = { email: user.email, sub: user._id };
    return this.jwtService.sign(payload);
  }

  private async validateUser(
    email: string,
    password: string,
  ): Promise<UserDocument> {
    const user = await this.userService.findByEmail(email);

    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);

    const passwordsEqual = await bcrypt.compare(password, user.password);

    if (passwordsEqual) {
      return user;
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
