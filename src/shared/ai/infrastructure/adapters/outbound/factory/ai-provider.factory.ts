import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { AnthropicService } from '../persistence/anthropic.service';
import { OpenAIService } from '../persistence/openai.service';

@Injectable()
export class AIProviderFactory implements AIProviderFactory {
  constructor(private readonly moduleRef: ModuleRef) {}

  get(provider: 'openai' | 'anthropic') {
    switch (provider) {
      case 'anthropic':
        return this.moduleRef.get(AnthropicService);
      case 'openai':
        return this.moduleRef.get(OpenAIService);
    }
  }
}
