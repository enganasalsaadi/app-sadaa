/** Server caps for what a campaign asks of each creator (contract §3.2); the step validates against the same numbers. */
export const CAMPAIGN_DELIVERABLE_LIMITS = {
  /** Total units (the sum of every line's count) per creator. */
  units: 20,
  countMin: 1,
  countMax: 10,
  revisionsMin: 0,
  revisionsMax: 3,
} as const;

export const CAMPAIGN_TARGETING_LIMITS = {
  niches: 5,
} as const;

/** Follower-floor shortcuts; the server takes any 0 – 1e9. */
export const CAMPAIGN_FOLLOWER_PRESETS = [1_000, 5_000, 10_000, 50_000, 100_000] as const;
