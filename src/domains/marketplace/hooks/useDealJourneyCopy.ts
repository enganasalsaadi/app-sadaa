import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatMoney } from '@/core/i18n';
import type { Money } from '@/core/money';
import type { DealShippingMode } from '../types/deal';
import type { DealWindows } from '../types/dealOffer';
import type { DealJourneyStageKey } from '../utils/dealJourney';
import { formatDuration } from '../utils/offerDuration';

export interface DealJourneyCopyInput {
  /** `plan`: before signing (the review step). `live`: a sent deal. */
  mode: 'plan' | 'live';
  creatorName: string;
  shippingMode: DealShippingMode;
  windows: DealWindows;
  /** What escrow holds; `null` while unpriced. */
  total: Money | null;
  /** What the wallet lacks at acceptance; `null` = enough. */
  shortfall: Money | null;
  deliverables: number;
  /** The creation window (requested deadline, else the creator's fastest). */
  paceHours: number;
  /** When the brand signed (live only). */
  signedAt: number | null;
}

export interface DealJourneyCopy {
  name: string;
  title: string;
  when: string;
  what: string;
  you: string;
  ifLate: string | null;
}

/** Every station's card text for one deal, with its real windows, amounts and names. */
export const useDealJourneyCopy = ({
  mode,
  creatorName: name,
  shippingMode,
  windows,
  total,
  shortfall,
  deliverables,
  paceHours,
  signedAt,
}: DealJourneyCopyInput): Record<DealJourneyStageKey, DealJourneyCopy> => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return useMemo(() => {
    const reply = formatDuration(t, windows.influencerResponseHours);
    const topUp = formatDuration(t, windows.paymentTopUpHours);
    const review = formatDuration(t, windows.brandReviewHours);
    const publish = formatDuration(t, windows.publishWindowHours);
    const amount = total ? formatMoney(total, lang) : t('marketplace.offer.review.empty');
    const missing = shortfall ? formatMoney(shortfall, lang) : null;
    const pace = formatDuration(t, paceHours);
    const hasProduct = shippingMode !== 'none';
    const live = mode === 'live';

    return {
      sign: {
        name: t('marketplace.journey.stage.sign.name'),
        title: t('marketplace.journey.stage.sign.title'),
        when:
          live && signedAt !== null
            ? t('marketplace.journey.stage.sign.whenLive', {
                time: formatDate(signedAt, { hour: 'numeric', minute: '2-digit' }, lang),
              })
            : t('marketplace.journey.stage.sign.whenPlan'),
        what: t('marketplace.journey.stage.sign.what', { name }),
        you: live ? t('marketplace.journey.stage.sign.youLive') : t('marketplace.journey.stage.sign.youPlan'),
        ifLate: null,
      },
      reply: {
        name: t('marketplace.journey.stage.reply.name'),
        title: t('marketplace.journey.stage.reply.title', { name }),
        when: t('marketplace.journey.stage.reply.when', { duration: reply }),
        what: t('marketplace.journey.stage.reply.what'),
        you: t('marketplace.journey.stage.reply.you'),
        ifLate: t('marketplace.journey.stage.reply.ifLate', { duration: reply }),
      },
      escrow: {
        name: t('marketplace.journey.stage.escrow.name'),
        title: t('marketplace.journey.stage.escrow.title'),
        when: t('marketplace.journey.stage.escrow.when'),
        what: t('marketplace.journey.stage.escrow.what', { amount, name }),
        you: missing
          ? t('marketplace.journey.stage.escrow.youShort', { amount: missing, duration: topUp })
          : t('marketplace.journey.stage.escrow.youEnough'),
        ifLate: missing ? t('marketplace.journey.stage.escrow.ifShort', { duration: topUp }) : null,
      },
      ship: {
        name: t('marketplace.journey.stage.ship.name'),
        title:
          shippingMode === 'returnable'
            ? t('marketplace.journey.stage.ship.titleReturnable', { name })
            : t('marketplace.journey.stage.ship.titleGift', { name }),
        when: t('marketplace.journey.stage.ship.when', { duration: formatDuration(t, windows.brandShipHours) }),
        what:
          shippingMode === 'returnable'
            ? t('marketplace.journey.stage.ship.whatReturnable')
            : t('marketplace.journey.stage.ship.what'),
        you: t('marketplace.journey.stage.ship.you'),
        ifLate: t('marketplace.journey.stage.ship.ifLate'),
      },
      make: {
        name: t('marketplace.journey.stage.make.name'),
        title: t('marketplace.journey.stage.make.title'),
        when: hasProduct
          ? t('marketplace.journey.stage.make.whenProduct', { duration: pace })
          : t('marketplace.journey.stage.make.whenDigital', { duration: pace }),
        what: t('marketplace.journey.stage.make.what', {
          items: t('marketplace.offer.units.deliverables', { count: deliverables }),
        }),
        you: t('marketplace.journey.stage.make.you'),
        ifLate: t('marketplace.journey.stage.make.ifLate'),
      },
      review: {
        name: t('marketplace.journey.stage.review.name'),
        title: t('marketplace.journey.stage.review.title'),
        when: t('marketplace.journey.stage.review.when', { duration: review }),
        what: t('marketplace.journey.stage.review.what'),
        you: t('marketplace.journey.stage.review.you'),
        ifLate: t('marketplace.journey.stage.review.ifLate', { duration: review }),
      },
      publish: {
        name: t('marketplace.journey.stage.publish.name'),
        title: t('marketplace.journey.stage.publish.title'),
        when: t('marketplace.journey.stage.publish.when', { duration: publish }),
        what: t('marketplace.journey.stage.publish.what'),
        you: t('marketplace.journey.stage.publish.you'),
        ifLate: t('marketplace.journey.stage.publish.ifLate', { duration: publish }),
      },
      done: {
        name: t('marketplace.journey.stage.done.name'),
        title: t('marketplace.journey.stage.done.title'),
        when: t('marketplace.journey.stage.done.when'),
        what: t('marketplace.journey.stage.done.what', { name }),
        you: t('marketplace.journey.stage.done.you'),
        ifLate: null,
      },
    };
  }, [deliverables, lang, mode, name, paceHours, shippingMode, shortfall, signedAt, t, total, windows]);
};
