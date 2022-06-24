import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { UserDocument } from 'src/users/schemas/user.schema';
import { AuthResponse } from './auth.response';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  public async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.validateUser(email, password);
    return {
      token: this.generateToken(user),
      user: user,
    };
  }

  public async register(userDto: UserDto): Promise<AuthResponse> {
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
      token: this.generateToken(newUser),
      user: newUser,
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
    const passwordsEqual = await bcrypt.compare(password, user.password);

    if (passwordsEqual) {
      return user;
    }

    throw new BadRequestException('Invalid credentials');
  }
}
