import { Inject, Injectable } from '@nestjs/common';
import { Token } from 'src/constant';
import { ITaskRepository } from 'src/task/domain/ports/task.repository.port';

type ExportResponse = {
  content: string | File;
  action: 'copy' | 'download';
};

@Injectable()
export class ExportTasksUseCase {
  constructor(
    @Inject(Token.TaskRepository)
    private readonly taskRepository: ITaskRepository,
  ) {}

  // Helper: sanitize CSV/Markdown strings
  private sanitize(value: string | number | null | undefined) {
    if (value == null) return '';
    return String(value).replace(/"/g, '""');
  }

  async csv(id: string): Promise<ExportResponse> {
    const tasksData = await this.taskRepository.getByMeeting(id, {
      limit: 100,
      offset: 0,
    });

    const tasks = tasksData.data;
    if (!tasks.length) return { content: '', action: 'copy' };

    // CSV header
    const headers = [
      'Description',
      'Assignee',
      'Due Date',
      'Priority',
      'Category',
    ];
    const rows = tasks.map((task) =>
      [
        `"${this.sanitize(task.description)}"`,
        `"${this.sanitize(task.assignee)}"`,
        `"${task.dueDate ?? ''}"`,
        `"${task.priority}"`,
        `"${this.sanitize(task.category)}"`,
      ].join(','),
    );

    const csvContent = [headers.join(','), ...rows].join('\n');

    return { content: csvContent, action: 'copy' };
  }

  async json(id: string): Promise<ExportResponse> {
    const tasksData = await this.taskRepository.getByMeeting(id, {
      limit: 100,
      offset: 0,
    });

    const tasks = tasksData.data;

    const jsonContent = JSON.stringify(tasks, null, 2);

    return { content: jsonContent, action: 'copy' };
  }

  async markdown(id: string): Promise<ExportResponse> {
    const tasksData = await this.taskRepository.getByMeeting(id, {
      limit: 100,
      offset: 0,
    });

    const tasks = tasksData.data;

    if (!tasks.length) return { content: '', action: 'copy' };

    const mdLines = tasks.map(
      (task) =>
        `- **Description:** ${task.description}\n` +
        `  - **Assignee:** ${task.assignee ?? 'Unassigned'}\n` +
        `  - **Due Date:** ${task.dueDate ?? 'N/A'}\n` +
        `  - **Priority:** ${task.priority}\n` +
        `  - **Category:** ${task.category ?? 'N/A'}\n`,
    );

    const mdContent = mdLines.join('\n');

    return { content: mdContent, action: 'copy' };
  }
}
