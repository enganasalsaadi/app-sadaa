import { formatNumber } from '@/core/i18n';
import type { Money } from '@/core/money';
import type {
  AudienceShare,
  MediaKitAudience,
  MediaKitPlatform,
  PublicMediaKit,
  PublicRateCard,
  MediaKitWorkedWith,
} from '../types/mediaKit';
import type { LockableRateRow } from './rateRows';

/** Hero strip cells, best first; the strip shows the first `MAX_METRICS` the kit has data for. */
export const SHOWCASE_METRIC_KEYS = [
  'reach',
  'engagement',
  'avgViews',
  'localAudience',
  'campaigns',
  'fastestDelivery',
  'platforms',
] as const;
export type ShowcaseMetricKey = (typeof SHOWCASE_METRIC_KEYS)[number];

export interface ShowcaseMetric {
  key: ShowcaseMetricKey;
  /** Already formatted, so `AnimatedNumber` rolls only the digits. */
  value: string;
}

const MAX_METRICS = 4;
const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };

const isNumber = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const formatPercent = (pct: number): string =>
  formatNumber(pct / 100, { style: 'percent', maximumFractionDigits: 1 });

/** Followers summed over every linked platform (not de-duplicated: the strip says "total followers"). */
export const sumFollowers = (platforms: readonly MediaKitPlatform[]): number | null =>
  platforms.length > 0 ? platforms.reduce((sum, p) => sum + p.follower_count, 0) : null;

/** Quickest turnaround any service promises, in days. */
export const fastestDeliveryDays = (cards: readonly Pick<PublicRateCard, 'delivery_days'>[]): number | null => {
  const days = cards.map(card => card.delivery_days).filter(day => isNumber(day) && day > 0);
  return days.length > 0 ? Math.min(...days) : null;
};

/** Only metrics the server sent; a missing one is skipped, never shown as 0. */
export const buildShowcaseMetrics = (kit: PublicMediaKit): ShowcaseMetric[] => {
  const highlights = kit.highlights ?? null;
  const reach = sumFollowers(kit.platforms);
  const fastest = fastestDeliveryDays(kit.rate_cards);
  const engagement = highlights?.engagement_rate_pct;
  const avgViews = highlights?.avg_views;
  const local = highlights?.local_audience_pct;
  const campaigns = highlights?.completed_campaigns;

  const candidates: Record<ShowcaseMetricKey, string | null> = {
    reach: reach === null ? null : formatNumber(reach, COMPACT),
    engagement: isNumber(engagement) ? formatPercent(engagement) : null,
    avgViews: isNumber(avgViews) ? formatNumber(avgViews, COMPACT) : null,
    localAudience: isNumber(local) ? formatPercent(local) : null,
    campaigns: isNumber(campaigns) && campaigns > 0 ? formatNumber(campaigns) : null,
    fastestDelivery: fastest === null ? null : formatNumber(fastest),
    platforms: kit.platforms.length > 0 ? formatNumber(kit.platforms.length) : null,
  };

  return SHOWCASE_METRIC_KEYS.flatMap(key => {
    const value = candidates[key];
    return value === null ? [] : [{ key, value }];
  }).slice(0, MAX_METRICS);
};

/** A rate row plus the terms a brand compares before picking (rate card §5 fields). */
export interface ShowcaseService extends LockableRateRow {
  deliveryDays: number;
  revisions: number;
  retentionLabel: string | null;
}

/** Group key for platform-free services (on-site visit). */
export const IN_PERSON_GROUP = 'in_person';

export interface ServiceGroup {
  /** Platform key, or `IN_PERSON_GROUP`. */
  key: string;
  /** Server platform label; `null` for in-person. */
  label: string | null;
  services: ShowcaseService[];
}

/** Services as platform tabs, in the rows' order (primary platform first, in-person last). */
export const buildServiceGroups = (
  rows: readonly LockableRateRow[],
  cards: readonly PublicRateCard[],
): ServiceGroup[] => {
  const bySlot = new Map(cards.map(card => [card.slot_key, card]));
  const groups: ServiceGroup[] = [];
  for (const row of rows) {
    const card = bySlot.get(row.key);
    if (!card) continue;
    const key = row.platform ?? IN_PERSON_GROUP;
    let group = groups.find(item => item.key === key);
    if (!group) {
      group = { key, label: row.platformLabel, services: [] };
      groups.push(group);
    }
    group.services.push({
      ...row,
      deliveryDays: card.delivery_days,
      revisions: card.revisions,
      retentionLabel: card.retention?.label ?? null,
    });
  }
  return groups;
};

/**
 * Base prices of the picked services: a preview only (rule 06), shown as an estimate; the
 * server prices the real offer. Locked (priceless) picks and add-ons are left out.
 */
export const sumSelectedPrices = (
  groups: readonly ServiceGroup[],
  selected: ReadonlySet<string>,
): Money | null => {
  let total: Money | null = null;
  for (const group of groups) {
    for (const service of group.services) {
      const { price } = service;
      if (!price || !selected.has(service.key)) continue;
      if (total === null) {
        total = { amount: price.amount, currency: price.currency };
      } else if (total.currency === price.currency) {
        total = { amount: total.amount + price.amount, currency: total.currency };
      }
    }
  }
  return total;
};

/** `null` unless at least one audience breakdown has data. */
export const toShowcaseAudience = (
  audience: MediaKitAudience | null | undefined,
): MediaKitAudience | null =>
  audience && (audience.cities.length > 0 || audience.gender !== null || audience.age_ranges.length > 0)
    ? audience
    : null;

/** The biggest age bucket ("most of the audience is 18–24"). */
export const topAgeRange = (ranges: readonly AudienceShare[]): AudienceShare | null =>
  ranges.reduce<AudienceShare | null>(
    (top, range) => (top === null || range.share_pct > top.share_pct ? range : top),
    null,
  );

/** `null` until the creator has at least one brand to show. */
export const toWorkedWith = (worked: MediaKitWorkedWith | null | undefined): MediaKitWorkedWith | null =>
  worked && worked.items.length > 0 ? worked : null;
