import z from 'zod';
import { TaskPriority, TaskStatus } from 'src/task/domain/entities/task.entity';

export const TASK_PRIORITY_SCHEMA = z.nativeEnum(TaskPriority);
export const TASK_STATUS_SCHEMA = z.nativeEnum(TaskStatus);

