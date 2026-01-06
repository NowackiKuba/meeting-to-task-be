import { EmailTemplate } from 'src/shared/mailer/domain/email';

export interface IEmailService {
  sendEmail(
    to: string,
    template: EmailTemplate,
    context: Record<string, any>,
    attachments?: { filename: string; content: Buffer; contentType: string }[],
  ): Promise<void>;
}
