import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(
      registerDto.name,
      registerDto.email,
      registerDto.password,
    );

    const payload = { sub: user._id.toString(), email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user._id.toString(), email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
      accessToken,
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
