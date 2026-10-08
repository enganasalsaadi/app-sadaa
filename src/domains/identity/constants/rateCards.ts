import type { AddonType } from '@/core/api';
import type { RateCardFormValues } from '../schemas/rateCardSchema';

/** Group key for platform-free services (on-site visit); never a platform key. */
export const RATE_GROUP_IN_PERSON = 'in_person';

/** The only add-on offered in v1 (handoff §3). */
export const RUSH_ADDON = 'rush_delivery' satisfies AddonType;

/**
 * Single-card 422 keys → editor fields (handoff §6). Rush is always sent first,
 * so its errors come back on `addons.0`.
 */
export const RATE_CARD_SERVER_FIELDS = {
  platform: 'group',
  service: 'service',
  package_value: 'packageValue',
  price_usd: 'price',
  delivery_days: 'deliveryDays',
  revisions: 'revisions',
  retention: 'retention',
  'addons.0.type': 'rushHours',
  'addons.0.pricing_mode': 'rushPrice',
  'addons.0.amount': 'rushPrice',
  'addons.0.options.delivery_hours': 'rushHours',
} as const satisfies Record<string, keyof RateCardFormValues>;
