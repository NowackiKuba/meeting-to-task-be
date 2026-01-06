import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { NotFoundError } from 'src/errors';
import { User } from 'src/user/domain/entities/user.entity';
import { IUserRepository } from 'src/user/domain/ports/user.repository.port';
import { orFail } from 'src/utils/or-fail';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(Token.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async handle(id: string) {
    const user = await orFail(
      this.userRepository.findById(id),
      new NotFoundError(User.name, id),
    );

    return user;
  }
}
