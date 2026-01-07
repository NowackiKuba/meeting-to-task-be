import z from 'zod';
import { PAGE_INPUT_SCHEMA } from 'src/utils/pagination';
import { FEEDBACK_AREA_SCHEMA } from '../common';

export const GET_FEEDBACKS_PAGINATED_SCHEMA = PAGE_INPUT_SCHEMA.extend({
  search: z.string().max(255).optional(),
  area: FEEDBACK_AREA_SCHEMA.optional(),
  rate: z.number().int().min(1).max(5).optional(),
  orderBy: z.enum(['asc', 'desc']).optional(),
  orderByField: z.string().max(255).optional(),
});

export type GetFeedbacksPaginatedInput = z.input<
  typeof GET_FEEDBACKS_PAGINATED_SCHEMA
>;
export type GetFeedbacksPaginatedTransformed = z.output<
  typeof GET_FEEDBACKS_PAGINATED_SCHEMA
>;

