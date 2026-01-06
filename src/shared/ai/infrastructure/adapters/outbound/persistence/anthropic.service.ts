import { Injectable } from '@nestjs/common';
import { IAiService } from 'src/shared/ai/domain/ports/ai.service.port';
import { Anthropic } from '@anthropic-ai/sdk';
import { ConfigService } from 'src/config/config.service';
import { parseJsonWithFallback } from '../../../utils/json-parser.util';

@Injectable()
export class AnthropicService implements IAiService {
  private readonly anthropic: Anthropic;
  constructor(private readonly configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get('ANTHROPIC_API_KEY'),
    });
  }

  async response(
    prompt: string,
    context: Record<string, string>,
  ): Promise<string> {
    try {
      const processedPrompt = prompt.replace(/{(\w+)}/g, (match, varName) => {
        return context[varName] !== undefined ? context[varName] : match;
      });

      const completion = await this.anthropic.completions.create({
        model: 'claude-3-7-sonnet-20250219',
        prompt: processedPrompt,
        max_tokens_to_sample: 256,
      });

      const aiReply = completion.completion;

      return aiReply;
    } catch (error) {
      throw new Error(`Anthropic error: ${error.message || error}`);
    }
  }

  async responseFormatted<T>(
    prompt: string,
    context: Record<string, string>,
  ): Promise<T> {
    try {
      // Replace variables in the prompt using the context object
      const processedPrompt = prompt.replace(/{(\w+)}/g, (match, varName) => {
        return context[varName] !== undefined ? context[varName] : match;
      });

      const completion = await this.anthropic.completions.create({
        model: 'claude-3-7-sonnet-20250219',
        prompt: `${processedPrompt}\n\nIMPORTANT: Return ONLY valid JSON. Do not add extra text, markdown, or explanations. Escape all quotes properly.`,
        max_tokens_to_sample: 4000, // Increased for longer responses
        temperature: 0, // Reduce variability for more consistent JSON
      });

      const aiReply = completion.completion;

      // Parse the JSON result with fallback recovery
      return parseJsonWithFallback<T>(aiReply, 3);
    } catch (error) {
      throw new Error(
        `OpenAI API error (formatted): ${error.message || error}`,
      );
    }
  }
}
