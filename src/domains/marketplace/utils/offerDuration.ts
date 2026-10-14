import type { TFunction } from 'i18next';

/** Up to two days reads in hours («48 ساعة»); longer windows in whole days, rounded up. */
const HOURS_CUTOFF = 48;
const HOURS_PER_DAY = 24;

export interface DurationParts {
  unit: 'hours' | 'days';
  count: number;
}

export const toDurationParts = (hours: number): DurationParts =>
  hours <= HOURS_CUTOFF
    ? { unit: 'hours', count: Math.max(1, Math.round(hours)) }
    : { unit: 'days', count: Math.ceil(hours / HOURS_PER_DAY) };

/** A window as people say it: «48 ساعة», «5 أيام». Never a calendar date. */
export const formatDuration = (t: TFunction, hours: number): string => {
  const { unit, count } = toDurationParts(hours);
  return unit === 'hours'
    ? t('marketplace.offer.units.hours', { count })
    : t('marketplace.offer.units.days', { count });
};

export const formatDays = (t: TFunction, days: number): string =>
  t('marketplace.offer.units.days', { count: days });

/** The offer's pace as quoted: the asked-for deadline, else the creator's fastest (rush included). */
export const quotePaceHours = (quote: { minDeliveryHours: number; requestedDeliveryDays: number | null }): number =>
  quote.requestedDeliveryDays !== null ? quote.requestedDeliveryDays * 24 : quote.minDeliveryHours;
