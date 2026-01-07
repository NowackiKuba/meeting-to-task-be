import z from 'zod';

export const FEEDBACK_AREA_SCHEMA = z.string().min(1).max(255);
export const FEEDBACK_RATE_SCHEMA = z.number().int().min(1).max(5);
export const FEEDBACK_BODY_SCHEMA = z.string().max(2000).optional();

