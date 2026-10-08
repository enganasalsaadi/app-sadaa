import type { AddonPricingMode, AddonType, RateService, Retention } from '@/core/api';

/**
 * Rate Cards v2 (handoff §5). Lives in auth because onboarding step 3 writes
 * them; the in-app editor and the media kit (identity) read the same shape.
 */
export interface RateCardAddon {
  type: AddonType;
  label: string;
  pricing_mode: AddonPricingMode;
  amount: number;
  computed_price_usd: number;
  options: Record<string, string | number | boolean>;
}

export interface RateCard {
  id: string;
  /** `platform:service:package`, unique per creator. */
  slot_key: string;
  /** `null` for platform-free services (on-site visit). */
  platform: string | null;
  service: { key: RateService; label: string };
  package: { key: string; value: string | number; label: string } | null;
  /** Dollars as the API sends them; minor units via `fromPriceUsd`. */
  price_usd: number;
  delivery_days: number;
  revisions: number;
  retention: { key: Retention; label: string } | null;
  attributes: { key: string; label: string; value: string | number | boolean; value_label: string }[];
  addons: RateCardAddon[];
  /** Localized "What's included" lines, ready to render. */
  includes: string[];
}

export interface RateCardAddonInput {
  type: AddonType;
  pricing_mode: AddonPricingMode;
  amount: number;
  options?: Record<string, string | number | boolean>;
}

/** `POST /influencer/rate-cards` body (handoff §4.1). */
export interface RateCardInput {
  platform: string | null;
  service: RateService;
  package_value?: string | number | null;
  price_usd: number;
  delivery_days?: number;
  revisions?: number;
  retention?: Retention;
  addons?: RateCardAddonInput[];
}

/** `PATCH /influencer/rate-cards/{id}`: changed fields only; `addons` replaces the whole list. */
export type RateCardPatch = Partial<
  Pick<RateCardInput, 'package_value' | 'price_usd' | 'delivery_days' | 'revisions' | 'retention' | 'addons'>
>;

/** Step 3 reads only these; everything else takes the server default (handoff §4.3). */
export type QuickRateCardInput = Pick<
  RateCardInput,
  'platform' | 'service' | 'package_value' | 'price_usd' | 'delivery_days'
>;
