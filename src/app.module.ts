import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import {
  ConfigModule,
  ConfigService,
  ConfigModule as NestConfigModule,
} from '@nestjs/config';
import dbConfig from './orm/database.config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { WinstonModule } from 'nest-winston';
import { APP_NAME } from './main';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MikroORM } from '@mikro-orm/core';
import { CONFIG_SCHEMA } from './config/config.validation';
import { baseLoggerConfig } from './utils/logger';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { Token } from './constant';
import { BullModule } from '@nestjs/bullmq';
import { JwtAuthGuard } from '@auth/infrastructure/guards';
import { UsersModule } from '@user/users.module';
import { MeetingsModule } from '@meeting/meetings.module';
import { TasksModule } from '@task/tasks.module';
import { SubscriptionsModule } from '@subscription/subscriptions.module';
import { PaymentsModule } from '@payment/payments.module';
import { IntegrationsModule } from '@integration/integrations.module';
import { UsageModule } from '@usage/usage.module';
import { PacketsModule } from './packet/packets.module';
import { StripeModule } from './stripe/stripe.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'fallback-secret',
        signOptions: { expiresIn: '1d' },
      }),
      global: true,
    }),
    NestConfigModule.forRoot({
      validate: (config) =>
        CONFIG_SCHEMA.parse({ ...config, VERSION: config.npm_package_version }),
      isGlobal: true,
    }),
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.get('ENV')?.toLowerCase();
        const logLevel = env === 'development' ? 'debug' : 'info';
        return baseLoggerConfig(APP_NAME, logLevel);
      },
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          ...dbConfig,
          host: configService.get('DB_HOST'),
          dbName: configService.get('DB_NAME'),
          user: configService.get('DB_USER'),
          password: configService.get('DB_PASSWORD'),
          port: configService.get('DB_PORT'),
        };
      },
    }),
    AuthModule,
    StripeModule,
    FeedbackModule,
    ConfigModule,
    PacketsModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const connection: any = {
          host: configService.get('REDIS_HOST'),
          port: Number(configService.get('REDIS_PORT')),
        };

        const password = configService.get<string>('REDIS_PASSWORD');
        const username = configService.get<string>('REDIS_USER');

        if (
          password &&
          typeof password === 'string' &&
          password.trim().length > 0 &&
          password.trim() !== 'undefined' &&
          password.trim() !== 'null'
        ) {
          connection.password = password.trim();
        }

        if (
          username &&
          typeof username === 'string' &&
          username.trim().length > 0 &&
          username.trim() !== 'undefined' &&
          username.trim() !== 'null'
        ) {
          connection.user = username.trim();
        }

        return {
          connection,
          defaultJobOptions: {
            attempts: 3,
            removeOnComplete: true,
            removeOnFail: false,
          },
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    MeetingsModule,
    TasksModule,
    SubscriptionsModule,
    PaymentsModule,
    IntegrationsModule,
    UsageModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly orm: MikroORM,
    private readonly configService: ConfigService,
    @Inject(Token.Logger)
    private readonly logger: { info: (message: string) => void },
  ) {}

  async onModuleInit() {
    const environment = this.configService.get('ENV').toUpperCase();

    this.logger.info(`[APP] Running migrations in ${environment} environment`);

    if (environment === 'DEVELOPMENT') {
      const generator = this.orm.getSchemaGenerator();
      this.logger.info(`[${environment} DB] Checking database schema...`);
      await generator.ensureDatabase();
      await generator.updateSchema();
      this.logger.info(`[${environment} DB] Database schema is up to date.`);
    }

    if (environment === 'PRODUCTION') {
      const migrator = this.orm.getMigrator();
      this.logger.info(`[${environment} DB] Running migrations...`);
      await migrator.up();
      this.logger.info(`[${environment} DB] Migrations are done.`);
    }
  }
}
