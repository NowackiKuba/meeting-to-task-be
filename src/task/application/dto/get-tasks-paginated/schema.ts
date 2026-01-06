import z from 'zod';
import { PAGE_INPUT_SCHEMA } from 'src/utils/pagination';
import { TASK_PRIORITY_SCHEMA, TASK_STATUS_SCHEMA } from '../common';

export const GET_TASKS_PAGINATED_SCHEMA = PAGE_INPUT_SCHEMA.extend({
  search: z.string().max(255).optional(),
  status: TASK_STATUS_SCHEMA.optional(),
  priority: TASK_PRIORITY_SCHEMA.optional(),
  category: z.string().max(255).optional(),
  assignee: z.string().max(255).optional(),
  orderBy: z.enum(['asc', 'desc']).optional(),
  orderByField: z.string().max(255).optional(),
});

export type GetTasksPaginatedInput = z.input<
  typeof GET_TASKS_PAGINATED_SCHEMA
>;
export type GetTasksPaginatedTransformed = z.output<
  typeof GET_TASKS_PAGINATED_SCHEMA
>;

