import { Injectable } from '@nestjs/common';

export type IntegrationRecord = {
  id: string;
  userId: string;
  provider: string;
  projectId?: string;
  workspaceId?: string;
};

@Injectable()
export class IntegrationService {
  private integrations: IntegrationRecord[] = [];

  list(userId: string) {
    return this.integrations.filter((i) => i.userId === userId);
  }

  add(record: IntegrationRecord) {
    this.integrations.push(record);
    return record;
  }

  remove(id: string) {
    this.integrations = this.integrations.filter((i) => i.id !== id);
  }
}

