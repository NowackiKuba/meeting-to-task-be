export const EMAIL_TEMPLATES_MAP = {
  WELCOME: 'welcome',
  RESET_PASSWORD: 'reset-password',
  VERIFY_EMAIL: 'verify-email',
  ACCOUNT_CREATED_BY: 'account-created-by',
  ACCOUNT_CREATED: 'account-created',
  SUBSCRIPTION_CONFIRMATION: 'subscription-confirmation',
  HELP: 'help',
  HELP_RESPONSE: 'help-response',
  ORDER_CANCELED: 'order-canceled',
  ORDER_CONFIRMED: 'order-confirmed',
  ORDER_DATA: 'order-data',
  ORDER_PROCCESED: 'order-proccesed',
  INVITE: 'invite',
  WAITING_LIST_CONFIRMATION: 'waiting-list-confirmation',
};

export const EMAIL_SUBJECTS_MAP = {
  WELCOME: 'Witaj w spromptuj.pl!',
  RESET_PASSWORD: 'Resetowanie hasła',
  VERIFY_EMAIL: 'Weryfikacja adresu email',
  ACCOUNT_CREATED_BY: 'Your {{appName}} account has been created',
  ACCOUNT_CREATED: 'Complete your {{appName}} registration',
  SUBSCRIPTION_CONFIRMATION:
    'Welcome to {{appName}}! Your subscription is active',
  HELP: 'Oczekiwanie na pomoc',
  HELP_RESPONSE:
    'Potwierdzenie przyjęcia zgłoszenia nr {{requestNumber}} – spromptuj.pl',
  ORDER_CANCELED: ' Anulowanie zamówienia – spromptuj.pl',
  ORDER_CONFIRMED: 'Potwierdzenie złożenia zamówienia – spromptuj.pl',
  ORDER_DATA:
    'Szczegóły zamówienia nr {{orderNumber}} oraz faktura – spromptuj.pl',
  ORDER_PROCCESED: 'Twoje zamówienie zostało zrealizowane – spromptuj.pl',
  INVITE: 'Zaproszenie do {{appName}} — dołącz do swojego zespołu!',
  WAITING_LIST_CONFIRMATION: "You're on the {{appName}} waiting list!",
};

export const EMAIL_CONSTANTS_MAP = {
  email: 'kuba.nowacki77@gmail.com',
  appUrl: 'https://spotboost.pl',
  appName: 'Mailo',
};

export type EmailTemplate = keyof typeof EMAIL_TEMPLATES_MAP;
