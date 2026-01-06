import z from 'zod';

export const UPDATE_MEETING_SCHEMA = z.strictObject({
  title: z.string().max(255).optional(),
  notes: z.string().min(10).max(50000).optional(),
});

export type UpdateMeetingInput = z.input<typeof UPDATE_MEETING_SCHEMA>;
export type UpdateMeetingTransformed = z.output<typeof UPDATE_MEETING_SCHEMA>;

