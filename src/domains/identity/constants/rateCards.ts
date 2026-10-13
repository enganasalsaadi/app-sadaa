import type { RateCardFormValues } from '../schemas/rateCardSchema';

/** Group key for platform-free services (on-site visit); never a platform key. */
export const RATE_GROUP_IN_PERSON = 'in_person';

/** Rush window option; must stay faster than the card's delivery days (rate-card-addons). */
export const RUSH_HOURS_OPTION = 'delivery_hours';
/** How long a duration add-on (exclusivity, paid ads, link in bio, pin) runs. */
export const DURATION_OPTION = 'duration_days';

/**
 * Single-card 422 keys → editor fields (handoff §6). `addons.{i}.*` index the
 * sent list, so they are mapped per save (`addonServerFields`).
 */
export const RATE_CARD_SERVER_FIELDS = {
  platform: 'group',
  service: 'service',
  package_value: 'packageValue',
  price_usd: 'price',
  delivery_days: 'deliveryDays',
  revisions: 'revisions',
  retention: 'retention',
} as const satisfies Record<string, keyof RateCardFormValues>;
