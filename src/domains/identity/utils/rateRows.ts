import type { Money } from '@/core/money';
import { fromPriceUsd, type PlatformResource, type RateCard } from '@/domains/auth';

export interface RateRowAddon {
  key: string;
  label: string;
  /** Server-computed (`computed_price_usd`), never client math. */
  price: Money;
  /** Rush delivery window; `null` for add-ons without one. */
  deliveryHours: number | null;
}

export interface RateRow {
  /** `slot_key`: unique per creator. */
  key: string;
  /** Server platform key, for the icon; `null` for in-person services. */
  platform: string | null;
  platformLabel: string | null;
  serviceLabel: string;
  packageLabel: string | null;
  price: Money;
  /** Localized "What's included" lines. */
  includes: readonly string[];
  addons: readonly RateRowAddon[];
}

/** Linked platforms (`/influencer/platforms`) and media kit platforms both fit. */
type RatePlatform = Pick<PlatformResource, 'platform' | 'platform_label' | 'is_primary'>;

/** Own cards and media kit cards share the §5 shape. */
type RateRowCard = Pick<
  RateCard,
  'slot_key' | 'platform' | 'service' | 'package' | 'price_usd' | 'includes' | 'addons'
>;

const toAddons = (addons: RateRowCard['addons']): RateRowAddon[] =>
  addons.flatMap(addon => {
    const price = fromPriceUsd(addon.computed_price_usd);
    if (!price) return [];
    const hours = addon.options.delivery_hours;
    return [
      {
        key: addon.type,
        label: addon.label,
        price,
        deliveryHours: typeof hours === 'number' ? hours : null,
      },
    ];
  });

/**
 * Saved rate cards as display rows: primary platform first, then the platform
 * order, in-person services last; server order within a platform. A card with
 * an unusable price is dropped.
 */
export const buildRateRows = (
  cards: readonly RateRowCard[],
  platforms: readonly RatePlatform[],
): RateRow[] => {
  const ordered = [...platforms].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  const platformRank = (platform: string | null): number => {
    if (platform === null) return ordered.length + 1;
    const index = ordered.findIndex(p => p.platform === platform);
    return index === -1 ? ordered.length : index;
  };

  return [...cards]
    .sort((a, b) => platformRank(a.platform) - platformRank(b.platform))
    .flatMap(card => {
      const price = fromPriceUsd(card.price_usd);
      if (!price) return [];
      return [
        {
          key: card.slot_key,
          platform: card.platform,
          platformLabel:
            card.platform === null
              ? null
              : platforms.find(p => p.platform === card.platform)?.platform_label ?? card.platform,
          serviceLabel: card.service.label,
          packageLabel: card.package?.label ?? null,
          price,
          includes: card.includes,
          addons: toAddons(card.addons),
        },
      ];
    });
};
