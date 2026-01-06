import { TaskPriority } from 'src/task/domain/entities/task.entity';
import z from 'zod';

export const CREATE_TASK_SCHEMA = z.strictObject({
  description: z.string().min(3).max(1000),
  assignee: z.string().max(255).optional(),
  dueDate: z.coerce.date().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  category: z.string().max(255).optional(),
});

export type CreateTaskInput = z.input<typeof CREATE_TASK_SCHEMA>;
export type CreateTaskTransformed = z.output<typeof CREATE_TASK_SCHEMA>;
