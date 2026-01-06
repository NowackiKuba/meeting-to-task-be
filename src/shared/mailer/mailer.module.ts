import { Module } from '@nestjs/common';
import { Token } from '../../constant';
import { EmailService } from './infra/adapters/email.service';
import { mailerProvider } from './infra/adapters/mailer.provider';
import { ConfigModule } from 'src/config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [
    mailerProvider,
    {
      provide: Token.EmailService,
      useClass: EmailService,
    },
  ],
  exports: [Token.EmailService],
})
export class MailerModule {}
