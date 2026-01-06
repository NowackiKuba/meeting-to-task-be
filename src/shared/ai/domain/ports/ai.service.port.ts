export interface IAiService {
  response(prompt: string, context: Record<string, string>): Promise<string>;
  responseFormatted<T>(
    prompt: string,
    context: Record<string, string>,
  ): Promise<T>;
}
