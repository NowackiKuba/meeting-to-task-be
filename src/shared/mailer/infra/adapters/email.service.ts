import { Inject, Injectable } from '@nestjs/common';
import { join } from 'path';
import { renderFile } from 'ejs';
import { Token } from '../../../../constant';
import { IEmailService } from '../../domain/ports/email.service';
import { IMailer } from './mailer.provider';
import { ConfigService } from 'src/config/config.service';
import {
  EMAIL_CONSTANTS_MAP,
  EMAIL_SUBJECTS_MAP,
  EMAIL_TEMPLATES_MAP,
  EmailTemplate,
} from '../../domain/email';

@Injectable()
export class EmailService implements IEmailService {
  constructor(
    @Inject(Token.Mailer) private readonly mailer: IMailer,
    private readonly configService: ConfigService,
  ) {}

  replaceTitlePlaceholders(
    title: string,
    context: Record<string, any>,
  ): string {
    return title.replace(/{{(.*?)}}/g, (match, p1) => context[p1] || match);
  }

  async sendEmail(
    to: string,
    template: EmailTemplate,
    context: Record<string, any>,
    attachments?: { filename: string; content: Buffer; contentType: string }[],
  ): Promise<void> {
    const env = this.configService.get('ENV');
    const isDevelopment = env === 'development';

    // Automatically add appName to context if not provided
    const enhancedContext = {
      ...context,
      appName: context.appName || EMAIL_CONSTANTS_MAP.appName || 'Mailo',
    };

    // In development, templates are in src/shared/mailer/templates
    // In production, templates should be in dist/shared/mailer/templates
    const templatesDir = isDevelopment
      ? 'src/shared/mailer/templates'
      : 'dist/shared/mailer/templates';
    const templatePath = join(
      process.cwd(),
      templatesDir,
      `${EMAIL_TEMPLATES_MAP[template]}.ejs`,
    );

    const emailContent = await renderFile(templatePath, enhancedContext);

    await this.mailer.transporter.sendMail({
      to,
      from: `"${this.configService.get('EMAIL_FROM')}" ${this.configService.get('EMAIL_USER')}`,
      subject: this.replaceTitlePlaceholders(
        EMAIL_SUBJECTS_MAP[template],
        enhancedContext,
      ),
      html: emailContent,
      attachments,
    });
  }
}
