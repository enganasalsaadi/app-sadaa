import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '@/core/i18n';
import { DEAL_STATION_LABEL } from '../constants/dealCopy';
import { DEFAULT_DEAL_WINDOWS } from '../constants/dealOffer';
import type { Deal, DealFunding, DealRole } from '../types';
import type { DealJourneyStageKey } from '../utils/dealJourney';
import { formatDuration } from '../utils/offerDuration';
import { useDealJourneyCopy } from './useDealJourneyCopy';

export interface DealStationCopy {
  /** One word, as on the stepper and the orbit. */
  name: string;
  title: string;
  what: string;
  /** The viewer's part at this station. */
  you: string;
}

type CopyDeal = Pick<
  Deal,
  | 'brand'
  | 'creator'
  | 'shippingMode'
  | 'total'
  | 'itemsCount'
  | 'deliveryHours'
  | 'extendedDeliveryHours'
  | 'requestedDeliveryDays'
  | 'sentAt'
>;

const paceOf = (deal: CopyDeal): number =>
  deal.extendedDeliveryHours ??
  deal.deliveryHours ??
  (deal.requestedDeliveryDays !== null ? deal.requestedDeliveryDays * 24 : 0);

/**
 * What every station means for this deal, from the viewer's side: the brand reads the deal
 * guide's live copy, the creator reads its own (they act at different stations).
 */
export const useDealStationCopy = (
  deal: CopyDeal,
  role: DealRole,
  funding: DealFunding | null = null,
): Record<DealJourneyStageKey, DealStationCopy> => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const shortfall =
    funding && funding.missing.amount > 0 ? funding.missing : null;
  const brandCopy = useDealJourneyCopy({
    mode: 'live',
    creatorName: deal.creator.name ?? '',
    shippingMode: deal.shippingMode.key ?? 'none',
    windows: DEFAULT_DEAL_WINDOWS,
    total: deal.total,
    shortfall,
    deliverables: deal.itemsCount,
    paceHours: paceOf(deal),
    signedAt: deal.sentAt,
  });

  return useMemo(() => {
    const name = deal.brand.name ?? '';
    const reply = formatDuration(
      t,
      DEFAULT_DEAL_WINDOWS.influencerResponseHours,
    );
    const review = formatDuration(t, DEFAULT_DEAL_WINDOWS.brandReviewHours);
    const amount = formatMoney(deal.total, lang);
    const items = t('marketplace.offer.units.deliverables', {
      count: deal.itemsCount,
    });
    const creator: Record<
      DealJourneyStageKey,
      Omit<DealStationCopy, 'name'>
    > = {
      sign: {
        title: t('marketplace.deals.creatorStage.sign.title', { name }),
        what: t('marketplace.deals.creatorStage.sign.what'),
        you: t('marketplace.deals.creatorStage.sign.you'),
      },
      reply: {
        title: t('marketplace.deals.creatorStage.reply.title'),
        what: t('marketplace.deals.creatorStage.reply.what'),
        you: t('marketplace.deals.creatorStage.reply.you', { duration: reply }),
      },
      escrow: {
        title: t('marketplace.deals.creatorStage.escrow.title'),
        what: t('marketplace.deals.creatorStage.escrow.what', { name, amount }),
        you: t('marketplace.deals.creatorStage.escrow.you'),
      },
      ship: {
        title: t('marketplace.deals.creatorStage.ship.title'),
        what: t('marketplace.deals.creatorStage.ship.what', { name }),
        you: t('marketplace.deals.creatorStage.ship.you'),
      },
      make: {
        title: t('marketplace.deals.creatorStage.make.title'),
        what: t('marketplace.deals.creatorStage.make.what', { items }),
        you: t('marketplace.deals.creatorStage.make.you'),
      },
      review: {
        title: t('marketplace.deals.creatorStage.review.title', { name }),
        what: t('marketplace.deals.creatorStage.review.what'),
        you: t('marketplace.deals.creatorStage.review.you', {
          name,
          duration: review,
        }),
      },
      publish: {
        title: t('marketplace.deals.creatorStage.publish.title'),
        what: t('marketplace.deals.creatorStage.publish.what'),
        you: t('marketplace.deals.creatorStage.publish.you', {
          name,
          duration: review,
        }),
      },
      done: {
        title: t('marketplace.deals.creatorStage.done.title'),
        what: t('marketplace.deals.creatorStage.done.what'),
        you: t('marketplace.deals.creatorStage.done.you'),
      },
    };
    const copyOf = (key: DealJourneyStageKey): DealStationCopy => {
      const label = t(DEAL_STATION_LABEL[key]);
      if (role === 'creator') return { name: label, ...creator[key] };
      const brand = brandCopy[key];
      return {
        name: label,
        title: brand.title,
        what: brand.what,
        you: brand.you,
      };
    };
    return {
      sign: copyOf('sign'),
      reply: copyOf('reply'),
      escrow: copyOf('escrow'),
      ship: copyOf('ship'),
      make: copyOf('make'),
      review: copyOf('review'),
      publish: copyOf('publish'),
      done: copyOf('done'),
    };
  }, [brandCopy, deal.brand.name, deal.itemsCount, deal.total, lang, role, t]);
};
