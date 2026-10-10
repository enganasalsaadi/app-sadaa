import type { Money } from '@/core/money';
import { fromPriceUsd, type PlatformResource, type RateCard } from '@/domains/auth';
import type { PublicRateCard } from '../types/mediaKit';

/** `Money` for own cards; `Money | null` where another viewer may get prices locked. */
type RowPrice = Money | null;

export interface RateRowAddon<TPrice extends RowPrice = Money> {
  key: string;
  label: string;
  /** Server-computed (`computed_price_usd`), never client math. `null` = locked for this viewer. */
  price: TPrice;
  /** Rush delivery window; `null` for add-ons without one. */
  deliveryHours: number | null;
}

export interface RateRow<TPrice extends RowPrice = Money> {
  /** `slot_key`: unique per creator. */
  key: string;
  /** Server platform key, for the icon; `null` for in-person services. */
  platform: string | null;
  platformLabel: string | null;
  serviceLabel: string;
  packageLabel: string | null;
  /** `null` = hidden from this viewer (price lock, brand-explore §6). */
  price: TPrice;
  /** Localized "What's included" lines. */
  includes: readonly string[];
  addons: readonly RateRowAddon<TPrice>[];
}

/** A Media Kit row: what the slot offers, its price only when the viewer may see it. */
export type LockableRateRow = RateRow<RowPrice>;

/** Linked platforms (`/influencer/platforms`) and media kit platforms both fit. */
type RatePlatform = Pick<PlatformResource, 'platform' | 'platform_label' | 'is_primary'>;

type RowFields = 'slot_key' | 'platform' | 'service' | 'package' | 'price_usd' | 'includes' | 'addons';
/** Own cards and media kit cards share the §5 shape; the kit's prices may be `null`. */
type LockableRowCard = Pick<PublicRateCard, RowFields>;

/** Dollars → row price; `undefined` drops the card or add-on (unusable price). */
type ReadPrice<TPrice extends RowPrice> = (usd: number | null) => TPrice | undefined;

const readOwnPrice: ReadPrice<Money> = usd => (usd === null ? undefined : fromPriceUsd(usd) ?? undefined);

const readLockablePrice: ReadPrice<RowPrice> = usd =>
  usd === null ? null : fromPriceUsd(usd) ?? undefined;

const toAddons = <TPrice extends RowPrice>(
  addons: LockableRowCard['addons'],
  readPrice: ReadPrice<TPrice>,
): RateRowAddon<TPrice>[] =>
  addons.flatMap(addon => {
    const price = readPrice(addon.computed_price_usd);
    if (price === undefined) return [];
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

const buildRows = <TPrice extends RowPrice>(
  cards: readonly LockableRowCard[],
  platforms: readonly RatePlatform[],
  readPrice: ReadPrice<TPrice>,
): RateRow<TPrice>[] => {
  const ordered = [...platforms].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  const platformRank = (platform: string | null): number => {
    if (platform === null) return ordered.length + 1;
    const index = ordered.findIndex(p => p.platform === platform);
    return index === -1 ? ordered.length : index;
  };

  return [...cards]
    .sort((a, b) => platformRank(a.platform) - platformRank(b.platform))
    .flatMap(card => {
      const price = readPrice(card.price_usd);
      if (price === undefined) return [];
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
          addons: toAddons(card.addons, readPrice),
        },
      ];
    });
};

/**
 * Saved rate cards as display rows: primary platform first, then the platform
 * order, in-person services last; server order within a platform. A card with
 * an unusable price is dropped.
 */
export const buildRateRows = (
  cards: readonly Pick<RateCard, RowFields>[],
  platforms: readonly RatePlatform[],
): RateRow[] => buildRows(cards, platforms, readOwnPrice);

/** Same order and drops, but a `null` price (locked for this viewer) keeps the row, priceless. */
export const buildLockableRateRows = (
  cards: readonly LockableRowCard[],
  platforms: readonly RatePlatform[],
): LockableRateRow[] => buildRows(cards, platforms, readLockablePrice);
