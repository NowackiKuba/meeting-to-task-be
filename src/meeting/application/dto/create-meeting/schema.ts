import z from 'zod';

export const CREATE_MEETING_SCHEMA = z.strictObject({
  notes: z.string().min(10).max(50000),
  title: z.string().max(255).optional(),
});

export type CreateMeetingInput = z.input<typeof CREATE_MEETING_SCHEMA>;
export type CreateMeetingTransformed = z.output<typeof CREATE_MEETING_SCHEMA>;
