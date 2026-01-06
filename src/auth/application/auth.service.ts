import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  CreateUserUseCase,
  GetUserByEmailUseCase,
} from '@user/application/use-cases';
import { CreateUserTransformed } from '@user/application/dto/create-user';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedError } from 'src/errors';
import { AuthUser } from '@auth/domain/interfaces/auth-user.interface';
import { User } from '@user/domain/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    payload: CreateUserTransformed,
  ): Promise<{ token: string; user: AuthUser }> {
    const user = await this.createUserUseCase.handle(payload);
    const token = await this.generateToken(user);
    return { token, user: this.toAuthUser(user) };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; user: AuthUser }> {
    const user = await this.getUserByEmailUseCase.handle(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    console.log(email, password);
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedError('Invalid password');
    }
    const token = await this.generateToken(user);
    return { token, user: this.toAuthUser(user) };
  }

  async me(user: AuthUser): Promise<AuthUser> {
    return user;
  }

  private async generateToken(user: User): Promise<string> {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      tier: user.currentTier,
    });
  }

  private toAuthUser(user: User): AuthUser {
    return { id: user.id, email: user.email, tier: user.currentTier };
  }
}
