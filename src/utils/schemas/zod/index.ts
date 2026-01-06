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

