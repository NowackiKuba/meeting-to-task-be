export interface IAiService {
  response(prompt: string, context: Record<string, string>): Promise<string>;
  responseFormatted<T>(
    prompt: string,
    context: Record<string, string>,
  ): Promise<T>;
}

export type ExtractedTask = {
  tasks: {
    description: string;
    assignee?: string;
    due_date: Date;
    priority: string;
    category?: string;
  }[];
};
