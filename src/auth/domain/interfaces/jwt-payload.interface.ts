export interface JwtPayload {
  sub: string;
  email: string;
  tier: 'free' | 'basic' | 'pro';
}

