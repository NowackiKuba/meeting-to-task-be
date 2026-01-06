export interface AuthUser {
  id: string;
  email: string;
  tier: 'free' | 'basic' | 'pro';
}

