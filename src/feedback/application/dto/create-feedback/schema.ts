import z from 'zod';
import {
  FEEDBACK_AREA_SCHEMA,
  FEEDBACK_BODY_SCHEMA,
  FEEDBACK_RATE_SCHEMA,
} from '../common';

export const CREATE_FEEDBACK_SCHEMA = z.strictObject({
  rate: FEEDBACK_RATE_SCHEMA,
  area: FEEDBACK_AREA_SCHEMA,
  body: FEEDBACK_BODY_SCHEMA,
});

export type CreateFeedbackInput = z.input<typeof CREATE_FEEDBACK_SCHEMA>;
export type CreateFeedbackTransformed = z.output<typeof CREATE_FEEDBACK_SCHEMA>;
