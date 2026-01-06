import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import {
  WINSTON_MODULE_NEST_PROVIDER,
  WINSTON_MODULE_PROVIDER,
} from 'nest-winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestjsSwagger } from '@anatine/zod-nestjs';
import cookieParser from 'cookie-parser';

export const APP_NAME = 'meeting-to-task';
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
