import { Transporter, createTransport } from 'nodemailer';
import { Token } from '../../../../constant';
import { ConfigService } from 'src/config/config.service';

export interface IMailer {
  transporter: Transporter;
}

export const mailerProvider = {
  provide: Token.Mailer,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<IMailer> => {
    const user = configService.get('GOOGLE_USER_EMAIL');
    const clientId = configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get('GOOGLE_CLIENT_SECRET');
    const refreshToken = configService.get('GOOGLE_REFRESH_TOKEN');

    // Debug logging - CHECK THESE VALUES
    console.log('=== OAuth2 Configuration Debug ===');
    console.log('User Email:', user);
    console.log('Client ID:', clientId);
    console.log(
      'Client Secret:',
      clientSecret ? `${clientSecret.substring(0, 15)}...` : 'MISSING',
    );
    console.log(
      'Refresh Token:',
      refreshToken ? `${refreshToken.substring(0, 20)}..` : 'MISSING',
    );
    console.log('===================================');

    // Check for missing values
    if (!user || !clientId || !clientSecret || !refreshToken) {
      const missing = [];
      if (!user) missing.push('GOOGLE_USER_EMAIL');
      if (!clientId) missing.push('GOOGLE_CLIENT_ID');
      if (!clientSecret) missing.push('GOOGLE_CLIENT_SECRET');
      if (!refreshToken) missing.push('GOOGLE_REFRESH_TOKEN');

      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`,
      );
    }

    const transporter = createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user,
        clientId,
        clientSecret,
        refreshToken,
      },
    });

    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (error) {
      console.error('❌ SMTP connection failed');
      console.error('Error details:', error.message);
      // Don't throw here to allow app to start, but log the error
    }

    return { transporter };
  },
};
