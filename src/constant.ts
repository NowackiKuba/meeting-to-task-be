import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

export const Token = {
  Logger: WINSTON_MODULE_PROVIDER,
  UserRepository: Symbol('UserRepository'),
  MeetingRepository: Symbol('MeetingRepository'),
  TaskRepository: Symbol('TaskRepository'),
  SubscriptionRepository: Symbol('SubscriptionRepository'),
  PacketRepository: Symbol('PacketRepository'),
  PaymentRepository: Symbol('PaymentRepository'),
  IntegrationRepository: Symbol('IntegrationRepository'),
  StripeService: Symbol('StripeService'),
  EmailService: Symbol('EmailService'),
  Mailer: Symbol('Mailer'),
};

export const EMAIL_PROVIDERS = {};
export const ROTATION_RULES = {};
export const WARMUP_SESSION_STAGES = {};
export const Notifications = {};
