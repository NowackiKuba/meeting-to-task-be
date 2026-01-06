import { Injectable } from '@nestjs/common';

export type SubscriptionRecord = {
  id: string;
  userId: string;
  tier: 'basic' | 'pro';
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
};

@Injectable()
export class SubscriptionService {
  private subscriptions: SubscriptionRecord[] = [];

  getForUser(userId: string) {
    return this.subscriptions.find((s) => s.userId === userId) ?? null;
  }

  upsert(sub: SubscriptionRecord) {
    const existingIdx = this.subscriptions.findIndex((s) => s.id === sub.id);
    if (existingIdx >= 0) {
      this.subscriptions[existingIdx] = sub;
    } else {
      this.subscriptions.push(sub);
    }
    return sub;
  }
}

