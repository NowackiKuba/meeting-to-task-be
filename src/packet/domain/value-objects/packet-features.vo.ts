import { Injectable } from '@nestjs/common';

/**
 * Lightweight value object to hold arbitrary packet features.
 * Stored as JSON (see `PacketEntity.features`), but exposed with a small API
 * for readability and immutability.
 */
export type PacketTier = 'free' | 'basic' | 'pro';
export type PacketFeatureKey = string;
export type PacketFeatureValue =
  | boolean
  | number
  | string
  | string[]
  | Record<string, any>;

export type PacketFeaturesProps = Record<PacketFeatureKey, PacketFeatureValue>;

/**
 * Default feature sets per tier.
 * Extend/adjust this catalog to match the real product surface.
 */
export const PACKET_FEATURES_BY_TIER: Record<PacketTier, PacketFeaturesProps> =
  {
    free: {
      meetings_per_month: 5,
      recording_minutes: 300,
      tasks_per_month: 20,
      ai_summaries: false,
      priority_support: false,
    },
    basic: {
      meetings_per_month: 50,
      recording_minutes: 3000,
      tasks_per_month: 200,
      ai_summaries: true,
      priority_support: false,
    },
    pro: {
      meetings_per_month: 999999,
      recording_minutes: 999999,
      tasks_per_month: 999999,
      ai_summaries: true,
      priority_support: true,
    },
  };

@Injectable()
export class PacketFeatures {
  private readonly features: PacketFeaturesProps;

  /**
   * Build a feature set ensuring every key in `allKeys` is present.
   * Missing entries are defaulted to `false`, but any extra keys in `provided`
   * are preserved.
   */
  static withCatalog(
    allKeys: PacketFeatureKey[],
    provided: PacketFeaturesProps = {},
  ): PacketFeatures {
    const normalized: PacketFeaturesProps = {};

    for (const key of allKeys) {
      normalized[key] = provided[key] ?? false;
    }

    for (const [key, value] of Object.entries(provided)) {
      if (!Object.prototype.hasOwnProperty.call(normalized, key)) {
        normalized[key] = value;
      }
    }

    return new PacketFeatures(normalized);
  }

  constructor(props: PacketFeaturesProps = {}) {
    // Defensive copy to keep the VO immutable from the outside
    this.features = Object.freeze({ ...props });
  }

  /**
   * Create a feature set for a given tier with optional overrides.
   * Ensures all known feature keys across tiers are present.
   */
  static createFrom(
    tier: PacketTier,
    overrides: PacketFeaturesProps = {},
  ): PacketFeatures {
    const catalog = PACKET_FEATURES_BY_TIER[tier] ?? {};
    const allKeys = Array.from(
      new Set(
        Object.keys(PACKET_FEATURES_BY_TIER.free).concat(
          Object.keys(PACKET_FEATURES_BY_TIER.basic),
          Object.keys(PACKET_FEATURES_BY_TIER.pro),
          Object.keys(overrides),
        ),
      ),
    );

    const provided = { ...catalog, ...overrides };
    return PacketFeatures.withCatalog(allKeys, provided);
  }

  /** Return all features as a plain object. */
  get all(): PacketFeaturesProps {
    return this.features;
  }

  /** Get a single feature by key. */
  get<T extends keyof PacketFeaturesProps>(key: T): PacketFeaturesProps[T] {
    return this.features[key];
  }

  /** Check if a feature exists. */
  has(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.features, key);
  }

  /** Build a simple availability map (true/false per key). */
  availability(keys?: PacketFeatureKey[]): Record<PacketFeatureKey, boolean> {
    const featureKeys = keys ?? Object.keys(this.features);
    return featureKeys.reduce<Record<PacketFeatureKey, boolean>>((acc, key) => {
      acc[key] = Boolean(this.features[key]);
      return acc;
    }, {});
  }

  /** Convenient JSON serialisation hook. */
  toJSON(): PacketFeaturesProps {
    return this.features;
  }
}
