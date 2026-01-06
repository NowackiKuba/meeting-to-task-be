import z from 'zod';
import { TASK_PRIORITY_SCHEMA, TASK_STATUS_SCHEMA } from '../common';

export const BULK_UPDATE_TASKS_SCHEMA = z.strictObject({
  task_ids: z.array(z.string().uuid()).min(1),
  updates: z
    .strictObject({
      status: TASK_STATUS_SCHEMA.optional(),
      priority: TASK_PRIORITY_SCHEMA.optional(),
    })
    .refine(
      (data) => data.status !== undefined || data.priority !== undefined,
      {
        message: 'At least one update field (status or priority) must be provided',
      },
    ),
});

export type BulkUpdateTasksInput = z.input<typeof BULK_UPDATE_TASKS_SCHEMA>;
export type BulkUpdateTasksTransformed = z.output<
  typeof BULK_UPDATE_TASKS_SCHEMA
>;

