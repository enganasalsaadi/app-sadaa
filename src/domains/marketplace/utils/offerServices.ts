import { orderAddons, type AddonType } from '@/core/api';
import { parseAmountText, type Money } from '@/core/money';
import { DURATION_OPTION, RUSH_HOURS_OPTION, type PublicMediaKit, type PublicRateCard } from '@/domains/identity';

/** What an add-on promises: a rush window in hours, or how many days it runs. */
export interface OfferAddonDetail {
  unit: 'hours' | 'days';
  count: number;
}

export interface OfferAddon {
  type: AddonType;
  label: string;
  /** Server-computed fee; the quote confirms it. */
  price: Money;
  detail: OfferAddonDetail | null;
}

/** A rate card as the builder shows it: only real data, every badge from the card itself. */
export interface OfferService {
  rateCardId: string;
  /** Server platform key for the mark; `null` = in person. */
  platform: string | null;
  platformLabel: string | null;
  title: string;
  /** First "what's included" line, if any. */
  summary: string | null;
  price: Money;
  deliveryDays: number;
  revisions: number;
  retentionLabel: string | null;
  addons: OfferAddon[];
}

/** The creator as the ticket header shows them. */
export interface OfferCreator {
  slug: string;
  name: string;
  avatarUrl: string | null;
  handle: string | null;
  cityLabel: string | null;
  /** Average views over 30 days, all platforms; `null` = not enough data (never estimated). */
  avgViews: number | null;
}

const toUsd = (usd: number | null): Money | null =>
  usd === null || !Number.isFinite(usd) || usd < 0 ? null : parseAmountText(usd.toFixed(2), 'USD');

const toDetail = (options: Record<string, unknown>): OfferAddonDetail | null => {
  const hours = options[RUSH_HOURS_OPTION];
  if (typeof hours === 'number') return { unit: 'hours', count: hours };
  const days = options[DURATION_OPTION];
  return typeof days === 'number' ? { unit: 'days', count: days } : null;
};

const toService = (
  card: PublicRateCard,
  platformLabel: (platform: string) => string,
): OfferService | null => {
  const price = toUsd(card.price_usd);
  if (!price) return null;
  const addons = orderAddons(card.addons).flatMap(addon => {
    const fee = toUsd(addon.computed_price_usd);
    return fee ? [{ type: addon.type, label: addon.label, price: fee, detail: toDetail(addon.options) }] : [];
  });
  return {
    rateCardId: card.id,
    platform: card.platform,
    platformLabel: card.platform === null ? null : platformLabel(card.platform),
    title: card.package ? `${card.service.label} · ${card.package.label}` : card.service.label,
    summary: card.includes[0] ?? null,
    price,
    deliveryDays: card.delivery_days,
    revisions: card.revisions,
    retentionLabel: card.retention?.label ?? null,
    addons,
  };
};

/**
 * Priced cards only (a locked kit gives none), primary platform first, in-person last,
 * server order inside a platform. Add-ons in catalog order; unknown types are skipped.
 */
export const toOfferServices = (kit: PublicMediaKit): OfferService[] => {
  const platforms = [...kit.platforms].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  const rank = (platform: string | null) => {
    if (platform === null) return platforms.length + 1;
    const index = platforms.findIndex(p => p.platform === platform);
    return index === -1 ? platforms.length : index;
  };
  const label = (platform: string) => platforms.find(p => p.platform === platform)?.platform_label ?? platform;
  return [...kit.rate_cards]
    .sort((a, b) => rank(a.platform) - rank(b.platform))
    .flatMap(card => {
      const service = toService(card, label);
      return service ? [service] : [];
    });
};

export const toOfferCreator = (kit: PublicMediaKit): OfferCreator => {
  const primary = kit.platforms.find(p => p.is_primary) ?? kit.platforms[0];
  return {
    slug: kit.slug,
    name: kit.display_name ?? kit.slug,
    avatarUrl: kit.avatar_url,
    handle: primary ? `@${primary.username.replace(/^@+/, '')}` : null,
    cityLabel: kit.city?.label ?? null,
    avgViews: kit.highlights?.avg_views ?? null,
  };
};

/** The rush add-on of every picked line, or `null` when any line can't be rushed. */
export const rushPlanFor = (
  services: readonly OfferService[],
  rateCardIds: readonly string[],
): { hours: number; addons: { rateCardId: string; addon: OfferAddon }[] } | null => {
  if (rateCardIds.length === 0) return null;
  const addons = rateCardIds.map(rateCardId => ({
    rateCardId,
    addon: services.find(s => s.rateCardId === rateCardId)?.addons.find(a => a.type === 'rush_delivery'),
  }));
  if (addons.some(entry => !entry.addon)) return null;
  const picked = addons as { rateCardId: string; addon: OfferAddon }[];
  return {
    hours: Math.max(...picked.map(entry => (entry.addon.detail?.unit === 'hours' ? entry.addon.detail.count : 0))),
    addons: picked,
  };
};
