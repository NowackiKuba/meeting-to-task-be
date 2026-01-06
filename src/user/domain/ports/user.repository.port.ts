import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  update(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  getByStripeCustomerId(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
