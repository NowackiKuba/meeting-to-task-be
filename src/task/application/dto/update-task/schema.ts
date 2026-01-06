import { TaskPriority, TaskStatus } from 'src/task/domain/entities/task.entity';
import z from 'zod';

export const UPDATE_TASK_SCHEMA = z.strictObject({
  description: z.string().min(3).max(1000).optional(),
  assignee: z.string().max(255).optional(),
  dueDate: z.coerce.date().optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  category: z.string().max(255).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  order: z.coerce.number().int().optional(),
});

export type UpdateTaskInput = z.input<typeof UPDATE_TASK_SCHEMA>;
export type UpdateTaskTransformed = z.output<typeof UPDATE_TASK_SCHEMA>;
