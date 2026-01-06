import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '@user/domain/ports/user.repository.port';
import { Token } from 'src/constant';
import { User } from '@user/domain/entities/user.entity';

@Injectable()
export class GetUserByEmailUseCase {
  constructor(
    @Inject(Token.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async handle(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}

