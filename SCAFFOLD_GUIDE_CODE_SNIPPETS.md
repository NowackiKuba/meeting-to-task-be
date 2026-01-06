# Code Snippets for EXACT COPY Files

This file contains the actual code for all files that must be copied EXACTLY from Mailo. Use these code snippets when scaffolding a new application.

## Table of Contents

1. [main.ts](#1-maints)
2. [app.module.ts](#2-appmodulets)
3. [constant.ts](#3-constantts)
4. [errors.ts](#4-errorsts)
5. [config/](#5-config-directory)
6. [orm/](#6-orm-directory)
7. [utils/](#7-utils-directory)
8. [shared/](#8-shared-directory)
9. [auth/](#9-auth-directory-critical-files)

---

## 1. main.ts

**File:** `src/main.ts`

**Copy this EXACTLY. Only update `APP_NAME`.**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import {
  WINSTON_MODULE_NEST_PROVIDER,
  WINSTON_MODULE_PROVIDER,
} from 'nest-winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestjsSwagger } from '@anatine/zod-nestjs';
import * as cookieParser from 'cookie-parser';

export const APP_NAME = 'your-app-name'; // UPDATE THIS ONLY
export const GLOBAL_PREFIX = 'api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: true,
  });
  const configService = app.get(ConfigService);
  const logger = app.get(WINSTON_MODULE_PROVIDER);

  const version = configService.get('VERSION');
  const env = configService.get('ENV').toUpperCase();
  const port = configService.get('PORT');
  const origin = configService.get('ORIGIN');

  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Enable cookie parser middleware
  app.use(cookieParser());

  app.enableCors({
    origin,
    credentials: true,
  });

  if (env === 'DEVELOPMENT') {
    logger.info(`🚀 [${env}] Swagger is enabled`);
    const config = new DocumentBuilder()
      .setTitle(`${APP_NAME.toUpperCase()} API`)
      .setDescription(`${APP_NAME.toUpperCase()} API Documentation`)
      .setVersion(version)
      .addBearerAuth()
      .build();

    patchNestjsSwagger();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(GLOBAL_PREFIX, app, document);
  }

  await app.listen(port);

  logger.info(
    `🚀 [${env}] Application is running on: http://localhost:${port}/${GLOBAL_PREFIX}`,
  );
}
bootstrap();
```

---

## 2. app.module.ts

**File:** `src/app.module.ts`

**Copy this EXACTLY. Only update imports array (add your feature modules).**

```typescript
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
// ADD YOUR FEATURE MODULES HERE

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
    ConfigModule,
    // ADD YOUR FEATURE MODULES HERE
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
```

---

## 3. constant.ts

**File:** `src/constant.ts`

**Copy this EXACTLY. Add repository tokens for new features as needed.**

*Note: This file is very long. See the actual file in Mailo's `src/constant.ts`. Key structure:*

```typescript
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

export const Token = {
  Logger: WINSTON_MODULE_PROVIDER,
  UserRepository: Symbol('UserRepository'),
  // Add your repository tokens here:
  // {FeatureName}Repository: Symbol('{FeatureName}Repository'),
};

// Keep all other constants (EMAIL_PROVIDERS, ROTATION_RULES, etc.)
```

**IMPORTANT:** Copy the ENTIRE `src/constant.ts` file from Mailo. It's ~380 lines. Add new tokens to the `Token` object as needed.

---

## 4. errors.ts

**File:** `src/errors.ts`

**Copy this EXACTLY:**

```typescript
import { HttpException } from '@nestjs/common';
import { StatusCodes } from 'http-status-codes';

export enum ErrorCode {
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  UNRECOGNIZED = 'UNRECOGNIZED',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export abstract class AppError extends HttpException {
  protected constructor(
    message: string,
    public readonly httpCode: StatusCodes,
    public readonly errorCode: ErrorCode = ErrorCode.UNRECOGNIZED,
    public readonly details: unknown = {},
  ) {
    super({ message, errorCode, details }, httpCode);
  }
}

export class AlreadyExistsError extends AppError {
  constructor(entity?: string, field?: string) {
    super(
      `${entity} already exists`,
      StatusCodes.CONFLICT,
      ErrorCode.ALREADY_EXISTS,
      {
        entity,
        field,
      },
    );
  }
}

export class NotFoundError extends AppError {
  constructor(entity?: string, field?: string) {
    super(
      `${entity} is not found`,
      StatusCodes.NOT_FOUND,
      ErrorCode.NOT_FOUND,
      {
        entity,
        field,
      },
    );
  }
}

export class ProcessingError extends AppError {
  constructor(message: string, details?: unknown) {
    super(
      message,
      StatusCodes.UNPROCESSABLE_ENTITY,
      ErrorCode.PROCESSING_ERROR,
      details,
    );
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, StatusCodes.BAD_REQUEST, ErrorCode.BAD_REQUEST, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, StatusCodes.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, StatusCodes.CONFLICT, ErrorCode.CONFLICT, details);
  }
}
```

---

## 5. config/ directory

### 5.1. config.module.ts

**File:** `src/config/config.module.ts`

**Copy this EXACTLY:**

```typescript
import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { CONFIG_SCHEMA } from './config.validation';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: (config) => CONFIG_SCHEMA.parse(config),
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
```

### 5.2. config.service.ts

**File:** `src/config/config.service.ts`

**Copy this EXACTLY:**

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Config } from './config.validation';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService<Config, true>) {}
  get<T extends keyof Config>(key: T) {
    return this.configService.get(key, { infer: true });
  }
}
```

### 5.3. config.validation.ts

**File:** `src/config/config.validation.ts`

**Copy this structure. Update schema fields based on your app needs:**

```typescript
import { DATABASE_CONFIG_SCHEMA } from 'src/orm/database.config';
import { z } from 'zod';

export const BASE_CONFIG = z.object({
  ENV: z.enum(['development', 'production']).default('production'),
  PORT: z.coerce.number().optional().default(8080),
  ORIGIN: z.string().optional().default('http://localhost:3000'),
  VERSION: z.string().optional().default('1.0'),
  API_KEY: z.string().uuid(),
  JWT_SECRET: z.string(),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  // Add your config fields here
  // EMAIL_USER: z.string(),
  // EMAIL_FROM: z.string(),
  // etc.
});

export const CONFIG_SCHEMA = BASE_CONFIG.merge(DATABASE_CONFIG_SCHEMA);

export type Config = z.infer<typeof CONFIG_SCHEMA>;
```

---

## 6. orm/ directory

### 6.1. database.config.ts

**File:** `src/orm/database.config.ts`

**Copy this structure. Update entities array with your entities:**

```typescript
import { z } from 'zod';
import { Logger } from '@nestjs/common';
import { SeedManager } from '@mikro-orm/seeder';
import { Migrator } from '@mikro-orm/migrations';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { defineConfig } from '@mikro-orm/postgresql';
import { BaseEntity } from 'src/orm/entities/base.entity';
// Import your entities here
// import { UserEntity } from '@user/infrastructure/entities/user.entity';

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
    // Add your entities here
    // UserEntity,
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
    migrationsList: [
      // Add your migrations here
      // { name: Migration20251226003555.name, class: Migration20251226003555 },
    ],
  },
});

export default config;
```

### 6.2. entities/base.entity.ts

**File:** `src/orm/entities/base.entity.ts`

**Copy this EXACTLY:**

```typescript
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ abstract: true })
export abstract class BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ type: 'timestamptz', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Property({
    type: 'timestamptz',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt: Date = new Date();
}
```

---

## 7. utils/ directory

All utils must be copied EXACTLY. Here are the key ones:

### 7.1. utils/logger/index.ts

**File:** `src/utils/logger/index.ts`

```typescript
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';

export const baseLoggerConfig = (
  appName: string,
  level: string = 'debug',
): winston.LoggerOptions => ({
  level,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike(appName, {
          colors: true,
          prettyPrint: true,
          processId: true,
          appName: true,
        }),
      ),
    }),
  ],
});
```

### 7.2. utils/pagination/index.ts

**File:** `src/utils/pagination/index.ts`

```typescript
import { PageParams } from './schema';
export * from './schema';

export interface Page<T> {
  data: T[];
  page: PageParams;
}

export function paginate<T>(
  data: T[],
  {
    limit,
    offset,
    totalCount,
    nextCursor,
  }: {
    limit?: number;
    offset?: number;
    totalCount?: number;
    nextCursor?: string;
  },
) {
  return {
    data,
    page: {
      limit,
      offset,
      count: data.length,
      totalCount,
      hasNextPage:
        nextCursor != null ||
        (totalCount != null &&
          offset != null &&
          totalCount > offset + (limit ?? 0)),
      hasPreviousPage: offset != null && offset > 0,
      nextCursor,
    },
  };
}
```

### 7.3. utils/pagination/schema.ts

**File:** `src/utils/pagination/schema.ts`

```typescript
import { z } from 'zod';

export const PAGE_INPUT_SCHEMA = z.strictObject({
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().min(0).optional(),
  cursor: z.string().optional(),
});

export type PageInput = z.output<typeof PAGE_INPUT_SCHEMA>;

export const PAGE_PARAMS_SCHEMA = z.strictObject({
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().min(0).optional(),
  count: z.coerce.number().int().positive().optional(),
  totalCount: z.coerce.number().int().positive().optional(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  nextCursor: z.string().optional(),
});

export type PageParams = z.output<typeof PAGE_PARAMS_SCHEMA>;
```

### 7.4. utils/generate-code/index.ts

```typescript
export const generateCode = (length: number, onlyNumbers = false) => {
  if (length <= 0) {
    throw new Error('Length must be greater than 0');
  }

  const chars = onlyNumbers
    ? '123456789'
    : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
```

### 7.5. utils/generate-uuid/index.ts

```typescript
import { v4 } from 'uuid';

export const generateUUID = v4;
```

### 7.6. utils/or-fail/index.ts

```typescript
export async function orFail<T>(
  resultPromise: Promise<T | undefined | null>,
  error: Error,
): Promise<T> {
  const result = await resultPromise;

  if (!result) {
    throw error;
  }

  return result;
}
```

### 7.7. utils/nullish-or-fail/index.ts

```typescript
export async function nullishOrFail<T>(
  resultPromise: Promise<T | T[] | undefined | null>,
  error: Error,
): Promise<void> {
  const result = await resultPromise;
  if (
    (result && !Array.isArray(result)) ||
    (Array.isArray(result) && result.length > 0)
  ) {
    throw error;
  }
}
```

### 7.8. utils/transaction/index.ts

```typescript
import { IsolationLevel, EntityManager } from '@mikro-orm/core';

export type ITransactionWrapper = <T>(
  work: () => Promise<T>,
  isolationLevel?: IsolationLevel,
) => Promise<T>;

export function transactionWrapperFactory(em: EntityManager) {
  return async function <T>(
    work: () => Promise<T>,
    isolationLevel: IsolationLevel = IsolationLevel.SERIALIZABLE,
  ): Promise<T> {
    await em.begin({ isolationLevel });
    try {
      const result = await work();
      await em.commit();
      return result;
    } catch (error) {
      console.error('Transaction failed, rolling back', error);
      await em.rollback();
      throw error;
    }
  };
}
```

### 7.9. utils/schemas/zod/index.ts

```typescript
import { z } from 'zod';

export const PASSWORD_SCHEMA = z.string().min(6).max(255);
export const EMAIL_SCHEMA = z.string().email().max(255);
export const UUID_SCHEMA = z.string().uuid();
export const RESET_PASSWORD_KEY_SCHEMA = z.string().uuid();
export const ACTIVATION_CODE_SCHEMA = z.string().min(3).max(255);
export const CONFIRM_PASSWORD_SCHEMA = z.string().min(6).max(255);
export const NAME_SCHEMA = z.string().min(3).max(255);
export const SURNAME_SCHEMA = z.string().min(3).max(255);
export const USERNAME_SCHEMA = z.string().min(3).max(255);
export const ROLE_SCHEMA = z.enum(['ADMIN', 'USER']);
export const CREDIT_BALANCE_SCHEMA = z.coerce.number().min(0);
```

### 7.10. utils/encryption/index.ts

**File:** `src/utils/encryption/index.ts`

```typescript
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    this.key = Buffer.from(encryptionKey, 'hex');
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  decrypt(encrypted: string): string {
    const [ivHex, encryptedHex] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

---

## 8. shared/ directory

### 8.1. shared/core/result.ts

**File:** `src/shared/core/result.ts`

```typescript
export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error: string;
  private _value: T;

  private constructor(isSuccess: boolean, error?: string, value?: T) {
    if (isSuccess && error) {
      throw new Error(
        'InvalidOperation: A result cannot be successful and contain an error',
      );
    }
    if (!isSuccess && !error) {
      throw new Error(
        'InvalidOperation: A failing result needs to contain an error message',
      );
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;
  }

  public getValue(): T {
    if (!this.isSuccess) {
      throw new Error(
        "Can't get the value of an error result. Use 'errorValue' instead.",
      );
    }
    return this._value;
  }

  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, null, value);
  }

  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }

  public static combine(results: Result<any>[]): Result<any> {
    for (const result of results) {
      if (result.isFailure) return result;
    }
    return Result.ok();
  }
}
```

---

## 9. auth/ directory (CRITICAL FILES)

**IMPORTANT:** Copy the ENTIRE `src/auth/` directory from Mailo. Here are the critical files:

### 9.1. auth/infrastructure/guards/jwt-auth.guard.ts

Copy the entire file from Mailo. This is critical for JWT authentication.

### 9.2. auth/infrastructure/guards/permissions.guard.ts

Copy the entire file from Mailo. This is critical for permission-based authorization.

### 9.3. auth/infrastructure/decorators/public.decorator.ts

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

### 9.4. auth/infrastructure/decorators/user.decorator.ts

Copy the entire file from Mailo. This decorator extracts the current user from the request.

### 9.5. auth/infrastructure/decorators/permissions.decorator.ts

Copy the entire file from Mailo. This decorator is used for permission-based access control.

### 9.6. auth/infrastructure/adapters/outbound/jwt/jwt.strategy.ts

Copy the entire file from Mailo. This is the JWT strategy for Passport.

### 9.7. auth/domain/interfaces/auth-user.interface.ts

Copy the entire file from Mailo. This defines the authenticated user interface.

### 9.8. auth/domain/interfaces/jwt-payload.interface.ts

Copy the entire file from Mailo. This defines the JWT payload structure.

---

## How to Use This File

1. **For each file listed above**, copy the code snippet EXACTLY as shown
2. **Only update** the values explicitly marked as "UPDATE THIS ONLY"
3. **Keep all other code** identical
4. **For files marked "Copy entire file from Mailo"**, you'll need access to the Mailo codebase to copy the full file

---

## Files That Need Full Copy from Mailo

These files are too large to include here. Copy them EXACTLY from Mailo:

1. `src/constant.ts` (~380 lines) - Add tokens as needed
2. `src/auth/` directory - Copy entire directory structure
3. `src/shared/mailer/` - Copy entire directory if you need email functionality
4. `src/utils/permissions/` - Copy entire file (very long)

---

## Next Steps

After copying all EXACT COPY files:

1. Update `APP_NAME` in `main.ts`
2. Add your feature modules to `app.module.ts` imports
3. Add repository tokens to `constant.ts`
4. Add entities to `orm/database.config.ts`
5. Update config schema in `config.validation.ts` based on your needs

Then proceed with creating feature modules using the patterns in `SCAFFOLD_GUIDE.md`.

