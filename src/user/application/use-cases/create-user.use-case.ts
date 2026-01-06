import { Inject, Injectable } from '@nestjs/common';
import { User } from '@user/domain/entities/user.entity';
import { IUserRepository } from '@user/domain/ports/user.repository.port';
import { Token } from 'src/constant';
import { CreateUserTransformed } from '../dto/create-user';
import { AlreadyExistsError } from 'src/errors';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(Token.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async handle(payload: CreateUserTransformed): Promise<User> {
    const existing = await this.userRepository.findByEmail(payload.email);
    if (existing) {
      throw new AlreadyExistsError('User', 'email');
    }

    const hash = await bcrypt.hash(payload.password, 10);
    const user = new User({
      email: payload.email,
      password: hash,
      name: payload.name,
    });
    return this.userRepository.create(user);
  }
}
