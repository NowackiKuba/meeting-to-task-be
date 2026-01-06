import { z } from 'zod';
import { Logger } from '@nestjs/common';
import { SeedManager } from '@mikro-orm/seeder';
import { Migrator } from '@mikro-orm/migrations';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { defineConfig } from '@mikro-orm/postgresql';
import { BaseEntity } from 'src/orm/entities/base.entity';
import { UserEntity } from '@user/infrastructure/entities/user.entity';
import { MeetingEntity } from '@meeting/infrastructure/entities/meeting.entity';
import { TaskEntity } from '@task/infrastructure/entities/task.entity';
import { SubscriptionEntity } from 'src/subscription/infrastructure/entities/subscription.entity';
import { PacketEntity } from 'src/packet/infrastructure/entities/packet.entity';
import { PaymentEntity } from 'src/payment/infrastructure/entities/payment.entity';

const logger = new Logger('MikroORM');

export const DATABASE_CONFIG_SCHEMA = z.object({
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().optional().default(5432),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
});

export type DatabaseConfig = z.infer<typeof DATABASE_CONFIG_SCHEMA>;

export const config = defineConfig({
  host: 'localhost',
  port: 5432,
  debug: false,
  highlighter: new SqlHighlighter(),
  entities: [
    BaseEntity,
    UserEntity,
    MeetingEntity,
    TaskEntity,
    SubscriptionEntity,
    PacketEntity,
    PaymentEntity,
  ],
  extensions: [SeedManager, Migrator],
  logger: logger.log.bind(logger),
  dbName: 'app',
  user: 'user',
  password: 'password',
  seeder: {
    glob: '!(*.d).{js,ts}',
    path: 'dist/orm/seeds',
    pathTs: 'src/orm/seeds',
  },
  migrations: {
    path: 'dist/orm/migrations',
    pathTs: 'src/orm/migrations',
    migrationsList: [],
  },
});

export default config;
