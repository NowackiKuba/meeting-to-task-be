import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { IAiService } from 'src/shared/ai/domain/ports/ai.service.port';
import { OpenAI } from 'openai';

@Injectable()
export class OpenAIService implements IAiService {
  private readonly openai: OpenAI;
  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async response(
    prompt: string,
    context: Record<string, string>,
  ): Promise<string> {
    try {
      // Replace variables in the prompt using the context object
      const processedPrompt = prompt.replace(/{(\w+)}/g, (match, varName) => {
        // Replace with corresponding context value, or leave as-is if not found
        return context[varName] !== undefined ? context[varName] : match;
      });

      // Call the OpenAI API with the processed prompt
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: processedPrompt }],
        max_tokens: 256,
      });

      // Extract response text from OpenAI's reply
      const aiReply = completion.choices[0]?.message?.content ?? '';

      return aiReply;
    } catch (error) {
      // Handle error, return a fallback message or rethrow
      throw new Error(`OpenAI API error: ${error.message || error}`);
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

      // Call the OpenAI API and instruct it to return a response in JSON format
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: `${processedPrompt}\n\nRespond only with a valid JSON object.`,
          },
        ],
        max_tokens: 256,
        response_format: { type: 'json_object' },
      });

      // Extract response text from OpenAI's reply
      const aiReply = completion.choices[0]?.message?.content ?? '';

      // Parse the JSON result
      return JSON.parse(aiReply) as T;
    } catch (error) {
      throw new Error(
        `OpenAI API error (formatted): ${error.message || error}`,
      );
    }
  }
}
