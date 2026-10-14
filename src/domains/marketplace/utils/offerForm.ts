import { isAddonType, type AddonType } from '@/core/api';
import type { Deal, DealShippingMode } from '../types/deal';
import type { DealOfferInput } from '../types/dealOffer';

export interface OfferLineValue {
  rateCardId: string;
  quantity: number;
  addons: AddonType[];
}

/** One form across the three steps; the brief lists hold trimmed, de-duplicated entries. */
export interface OfferFormValues {
  /** Pick order = display order. */
  lines: OfferLineValue[];
  /** «Will you send a product?» — `shippingMode` stays `none` until a kind is picked. */
  hasProduct: boolean;
  shippingMode: DealShippingMode;
  /** `null` = the creator's fastest time. */
  requestedDeliveryDays: number | null;
  hashtags: string[];
  mentions: string[];
  talkingPoints: string[];
  donts: string[];
  promoCode: string;
  trackingLink: string;
}

export const EMPTY_OFFER_FORM: OfferFormValues = {
  lines: [],
  hasProduct: false,
  shippingMode: 'none',
  requestedDeliveryDays: null,
  hashtags: [],
  mentions: [],
  talkingPoints: [],
  donts: [],
  promoCode: '',
  trackingLink: '',
};

const textOrNull = (value: string): string | null => {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

export const toOfferInput = (values: OfferFormValues): DealOfferInput => ({
  lines: values.lines.map(line => ({ rateCardId: line.rateCardId, quantity: line.quantity, addons: line.addons })),
  shippingMode: values.hasProduct ? values.shippingMode : 'none',
  requestedDeliveryDays: values.requestedDeliveryDays,
  brief: {
    hashtags: values.hashtags,
    mentions: values.mentions,
    talkingPoints: values.talkingPoints,
    donts: values.donts,
    promoCode: textOrNull(values.promoCode),
    trackingLink: textOrNull(values.trackingLink),
  },
});

/**
 * A saved draft back into the form: deliverables of one rate card become one line (their
 * count is the quantity, the first one's add-ons are the line's). Upsell items never exist on
 * a draft; unknown add-on types are dropped since the builder can't show them.
 */
export const offerFormFromDeal = (deal: Deal): OfferFormValues => {
  const lines: OfferLineValue[] = [];
  deal.items.forEach(item => {
    if (!item.rateCardId) return;
    const line = lines.find(entry => entry.rateCardId === item.rateCardId);
    if (line) {
      line.quantity += 1;
      return;
    }
    lines.push({
      rateCardId: item.rateCardId,
      quantity: 1,
      addons: item.addons.map(addon => addon.type).filter(isAddonType),
    });
  });
  const shippingMode = deal.shippingMode.key ?? 'none';
  const brief = deal.brief;
  return {
    lines,
    hasProduct: shippingMode !== 'none',
    shippingMode,
    requestedDeliveryDays: deal.requestedDeliveryDays,
    hashtags: brief?.hashtags ?? [],
    mentions: brief?.mentions ?? [],
    talkingPoints: brief?.talkingPoints ?? [],
    donts: brief?.donts ?? [],
    promoCode: brief?.promoCode ?? '',
    trackingLink: brief?.trackingLink ?? '',
  };
};

/** Deliverables in the offer (a line of 3 reels = 3). */
export const countDeliverables = (lines: readonly OfferLineValue[]): number =>
  lines.reduce((sum, line) => sum + line.quantity, 0);

/** Hashtag as written in the post: one leading `#`, spaces joined by `_`. */
export const toHashtag = (raw: string): string => {
  const body = raw.trim().replace(/^#+/, '').trim().replace(/\s+/g, '_');
  return body === '' ? '' : `#${body}`;
};

/** Mention as written in the post: one leading `@`, no spaces. */
export const toMention = (raw: string): string => {
  const body = raw.trim().replace(/^@+/, '').replace(/\s+/g, '');
  return body === '' ? '' : `@${body}`;
};

/** Some line asks for rush delivery: the offer's pace is the rush window, not a requested date. */
export const hasRush = (lines: readonly OfferLineValue[]): boolean =>
  lines.some(line => line.addons.includes('rush_delivery'));
