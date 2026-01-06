import { Module } from '@nestjs/common';
import { UsersController } from './infrastructure/adapters/inbound/http/users.controller';
import { Token } from 'src/constant';
import { UserRepository } from './infrastructure/adapters/outbound/persistence/user.repository';
import { CreateUserUseCase, GetUserByEmailUseCase } from './application/use-cases';
import { UserMapper } from './infrastructure/mappers/user.mapper';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserEntity } from './infrastructure/entities/user.entity';

@Module({
  imports: [MikroOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    GetUserByEmailUseCase,
    UserMapper,
    {
      provide: Token.UserRepository,
      useClass: UserRepository,
    },
  ],
  exports: [Token.UserRepository, CreateUserUseCase, GetUserByEmailUseCase],
})
export class UsersModule {}

