import z from 'zod';

export const PACKET_FEATURE_VALUE_SCHEMA = z.union([
  z.boolean(),
  z.number(),
  z.string(),
  z.array(z.string()),
  z.record(z.any()),
]);

export const PACKET_FEATURES_SCHEMA = z.record(
  z.string(),
  PACKET_FEATURE_VALUE_SCHEMA,
);

export type PacketFeaturesInput = z.input<typeof PACKET_FEATURES_SCHEMA>;
export type PacketFeaturesTransformed = z.output<typeof PACKET_FEATURES_SCHEMA>;
