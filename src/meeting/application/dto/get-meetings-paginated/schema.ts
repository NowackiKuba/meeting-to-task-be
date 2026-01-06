import z from 'zod';
import { PAGE_INPUT_SCHEMA } from 'src/utils/pagination';

export const GET_MEETINGS_PAGINATED_SCHEMA = PAGE_INPUT_SCHEMA.extend({
  status: z.enum(['processing', 'completed', 'failed']).optional(),
});

export type GetMeetingsPaginatedInput = z.input<
  typeof GET_MEETINGS_PAGINATED_SCHEMA
>;
export type GetMeetingsPaginatedTransformed = z.output<
  typeof GET_MEETINGS_PAGINATED_SCHEMA
>;
