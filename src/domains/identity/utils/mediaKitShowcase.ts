import { formatNumber } from '@/core/i18n';
import type { Money } from '@/core/money';
import type {
  AudienceShare,
  MediaKitAudience,
  PublicMediaKit,
  PublicRateCard,
  MediaKitWorkedWith,
} from '../types/mediaKit';
import type { LockableRateRow } from './rateRows';

/** Highlight tiles, in the order shown (contract §17.11 `highlights`). */
export const SHOWCASE_METRIC_KEYS = ['engagement', 'avgViews', 'localAudience', 'campaigns'] as const;
export type ShowcaseMetricKey = (typeof SHOWCASE_METRIC_KEYS)[number];

export interface ShowcaseMetric {
  key: ShowcaseMetricKey;
  /** Already formatted. */
  value: string;
}

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };

const isNumber = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const formatPercent = (pct: number): string =>
  formatNumber(pct / 100, { style: 'percent', maximumFractionDigits: 1 });

/**
 * Only the server's highlights, each only when sent; never a 0 stand-in or a count derived on
 * the device (followers are on the platform cards already). `highlights: null` → none.
 */
export const buildShowcaseMetrics = (kit: PublicMediaKit): ShowcaseMetric[] => {
  const highlights = kit.highlights;
  if (!highlights) return [];
  const { engagement_rate_pct: engagement, avg_views: avgViews, local_audience_pct: local } = highlights;
  const campaigns = highlights.completed_campaigns;

  const candidates: Record<ShowcaseMetricKey, string | null> = {
    engagement: isNumber(engagement) ? formatPercent(engagement) : null,
    avgViews: isNumber(avgViews) ? formatNumber(avgViews, COMPACT) : null,
    localAudience: isNumber(local) ? formatPercent(local) : null,
    campaigns: isNumber(campaigns) && campaigns > 0 ? formatNumber(campaigns) : null,
  };

  return SHOWCASE_METRIC_KEYS.flatMap(key => {
    const value = candidates[key];
    return value === null ? [] : [{ key, value }];
  });
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
