import type { Money } from '@/core/money';
import {
  SERVICE_TYPES,
  fromPriceUsd,
  type PlatformResource,
  type RateCardEntry,
  type ServiceType,
} from '@/domains/auth';

export interface RateRow {
  key: string;
  platformLabel: string;
  serviceLabel: string;
  price: Money;
}

/** Linked platforms (`/influencer/platforms`) and media kit platforms both fit. */
type RatePlatform = Pick<PlatformResource, 'platform' | 'platform_label' | 'is_primary'>;

/**
 * Saved rate cards as display rows: primary platform first, then the linked-platform
 * order, services in their enum order. A card with an unusable price is dropped.
 */
export const buildRateRows = (
  cards: readonly RateCardEntry[],
  platforms: readonly RatePlatform[],
  serviceLabel: (service: ServiceType) => string,
): RateRow[] => {
  const ordered = [...platforms].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  const platformRank = (platform: string): number => {
    const index = ordered.findIndex(p => p.platform === platform);
    return index === -1 ? ordered.length : index;
  };

  return [...cards]
    .sort(
      (a, b) =>
        platformRank(a.platform) - platformRank(b.platform) ||
        SERVICE_TYPES.indexOf(a.service_type) - SERVICE_TYPES.indexOf(b.service_type),
    )
    .flatMap(card => {
      const price = fromPriceUsd(card.price_usd);
      if (!price) return [];
      return [
        {
          key: `${card.platform}:${card.service_type}`,
          platformLabel:
            platforms.find(p => p.platform === card.platform)?.platform_label ?? card.platform,
          serviceLabel: serviceLabel(card.service_type),
          price,
        },
      ];
    });
};
