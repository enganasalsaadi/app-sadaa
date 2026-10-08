/**
 * `GET /lookups/rate-card-catalog` (Rate Cards v2 handoff §3): what a creator can
 * price, per platform. Server-localized; labels are rendered as-is (rule 03).
 */

/** Service keys; `on_site_visit` is the only platform-free one in v1. */
export type RateService =
  | 'reel'
  | 'story'
  | 'feed_post'
  | 'post'
  | 'video'
  | 'shorts'
  | 'integrated_mention'
  | 'dedicated_video'
  | 'channel_post'
  | 'article'
  | 'on_site_visit';

export type Retention = '24h' | '30d' | '90d' | '180d' | 'permanent';

/** Only `rush_delivery` is offered in v1. */
export type AddonType = 'rush_delivery' | 'whitelisting' | 'exclusivity' | 'pin' | 'on_site';
export type AddonPricingMode = 'fixed' | 'percent_of_base';

export interface CatalogOption<TValue> {
  value: TValue;
  label: string;
}

/** Package choice (frames, duration…); one card per package value. */
export interface CatalogPackage {
  key: string;
  label: string;
  type: 'options';
  options: CatalogOption<string | number>[];
  default: string | number;
  visible: boolean;
}

export interface CatalogCriteria {
  delivery_days: { label: string; min: number; max: number; default: number };
  revisions: { label: string; options: CatalogOption<number>[]; default: number };
  /** `null` = not applicable (on-site visit). */
  retention: {
    label: string;
    options: CatalogOption<Retention>[];
    default: Retention;
    minimum: Retention;
  } | null;
}

/** Platform extras; hidden (`visible: false`) ones are never shown or sent. */
export interface CatalogAttribute {
  key: string;
  label: string;
  type: string;
  options?: CatalogOption<string | number | boolean>[];
  default: string | number | boolean;
  visible: boolean;
}

export interface CatalogService {
  key: RateService;
  label: string;
  /** `null` = one card per service. */
  package: CatalogPackage | null;
  criteria: CatalogCriteria;
  attributes: CatalogAttribute[];
  /** Add-on types allowed on this service. */
  addons: AddonType[];
}

export interface CatalogPlatform {
  key: string;
  label: string;
  services: CatalogService[];
}

export interface CatalogAddonPricingMode {
  key: AddonPricingMode;
  label: string;
  min: number;
  max: number;
}

export interface CatalogAddonOption {
  key: string;
  options: { value: string | number; label?: string }[];
  default: string | number;
  visible: boolean;
}

export interface CatalogAddon {
  type: AddonType;
  label: string;
  pricing_modes: CatalogAddonPricingMode[];
  options: CatalogAddonOption[];
}

export interface ContractTerms {
  version: string;
  items: { key: string; text: string }[];
}

export interface RateCardCatalog {
  catalog_version: string;
  price_bounds: { min_usd: number; max_usd: number };
  platforms: CatalogPlatform[];
  platform_agnostic_services: CatalogService[];
  addons: CatalogAddon[];
  contract_terms: ContractTerms;
}
