import type { TFunction } from 'i18next';
import { DEAL_BRIEF_LIMITS } from '../constants/dealOffer';
import { toHashtag, toMention } from './offerForm';

/** Same rule as the server (`url:http,https`): a scheme, a host with a dot, no spaces. */
const BRIEF_LINK = /^https?:\/\/[^\s/$.?#][^\s]*\.[^\s]{2,}$/i;

export const isBriefLink = (value: string): boolean => BRIEF_LINK.test(value);

/** The lists a brief shares between a direct deal and a public campaign (campaigns add `links`). */
export type BriefListField = 'hashtags' | 'mentions' | 'talkingPoints' | 'donts';
export const BRIEF_TEMPLATES = ['launch', 'offer', 'event', 'review', 'awareness'] as const;
export type BriefTemplateKey = (typeof BRIEF_TEMPLATES)[number];
export const BRIEF_TONES = ['casual', 'luxury', 'fun', 'educational'] as const;
export type BriefToneKey = (typeof BRIEF_TONES)[number];

/** Each template's ready talking points and don'ts, as i18n text the brand can still edit. */
export const briefTemplateEntries = (t: TFunction, key: BriefTemplateKey): { points: string[]; donts: string[] } => {
  switch (key) {
    case 'launch':
      return {
        points: [
          t('marketplace.offer.brief.template.launch.p1'),
          t('marketplace.offer.brief.template.launch.p2'),
          t('marketplace.offer.brief.template.launch.p3'),
        ],
        donts: [t('marketplace.offer.brief.template.launch.d1'), t('marketplace.offer.brief.template.launch.d2')],
      };
    case 'offer':
      return {
        points: [
          t('marketplace.offer.brief.template.offer.p1'),
          t('marketplace.offer.brief.template.offer.p2'),
          t('marketplace.offer.brief.template.offer.p3'),
        ],
        donts: [t('marketplace.offer.brief.template.offer.d1')],
      };
    case 'event':
      return {
        points: [
          t('marketplace.offer.brief.template.event.p1'),
          t('marketplace.offer.brief.template.event.p2'),
          t('marketplace.offer.brief.template.event.p3'),
        ],
        donts: [t('marketplace.offer.brief.template.event.d1')],
      };
    case 'review':
      return {
        points: [t('marketplace.offer.brief.template.review.p1'), t('marketplace.offer.brief.template.review.p2')],
        donts: [t('marketplace.offer.brief.template.review.d1')],
      };
    case 'awareness':
      return {
        points: [t('marketplace.offer.brief.template.awareness.p1'), t('marketplace.offer.brief.template.awareness.p2')],
        donts: [t('marketplace.offer.brief.template.awareness.d1')],
      };
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
};

const TONE_POINT = {
  casual: 'marketplace.offer.brief.tone.casual.point',
  luxury: 'marketplace.offer.brief.tone.luxury.point',
  fun: 'marketplace.offer.brief.tone.fun.point',
  educational: 'marketplace.offer.brief.tone.educational.point',
} as const satisfies Record<BriefToneKey, string>;

/** A list entry in the shape the post uses (`#tag`, `@account`) or trimmed to the server cap; `''` = nothing to add. */
export const normalizeBriefEntry = (field: BriefListField, raw: string): string => {
  switch (field) {
    case 'hashtags':
      return toHashtag(raw);
    case 'mentions':
      return toMention(raw);
    case 'talkingPoints':
    case 'donts':
      return raw.trim().slice(0, DEAL_BRIEF_LIMITS.maxEntryLength);
    default: {
      const _exhaustive: never = field;
      return _exhaustive;
    }
  }
};

/** Appends what isn't there yet, up to the list cap. */
export const mergeBriefEntries = (current: readonly string[], extra: readonly string[]): string[] => {
  const next = [...current];
  extra.forEach(entry => {
    if (next.length < DEAL_BRIEF_LIMITS.maxEntries && !next.includes(entry)) next.push(entry);
  });
  return next;
};

/** A tone is one ready talking point (the API has no tone field). */
const tonePoints = (t: TFunction) => BRIEF_TONES.map(tone => ({ tone, point: t(TONE_POINT[tone]) }));

/** The tone whose point is among the talking points, if any. */
export const activeBriefTone = (t: TFunction, talkingPoints: readonly string[]): BriefToneKey | null =>
  tonePoints(t).find(({ point }) => talkingPoints.includes(point))?.tone ?? null;

/** Talking points with `tone` switched on (and every other tone off), or off when it was on. */
export const toggleBriefTone = (t: TFunction, talkingPoints: readonly string[], tone: BriefToneKey): string[] => {
  const others = tonePoints(t)
    .filter(entry => entry.tone !== tone)
    .map(entry => entry.point);
  const point = t(TONE_POINT[tone]);
  const current = talkingPoints.filter(entry => !others.includes(entry));
  return current.includes(point) ? current.filter(entry => entry !== point) : mergeBriefEntries(current, [point]);
};
