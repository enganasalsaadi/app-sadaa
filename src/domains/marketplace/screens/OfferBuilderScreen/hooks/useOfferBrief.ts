import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { UseFormReturn } from 'react-hook-form';
import { toastService } from '@/core/toast';
import { DEAL_BRIEF_LIMITS } from '../../../constants/dealOffer';
import { toHashtag, toMention, type OfferFormValues } from '../../../utils/offerForm';

export type BriefListField = 'hashtags' | 'mentions' | 'talkingPoints' | 'donts';
export const BRIEF_TEMPLATES = ['launch', 'offer', 'event', 'review', 'awareness'] as const;
export type BriefTemplateKey = (typeof BRIEF_TEMPLATES)[number];
export const BRIEF_TONES = ['casual', 'luxury', 'fun', 'educational'] as const;
export type BriefToneKey = (typeof BRIEF_TONES)[number];

/** Each template's ready talking points and don'ts, as i18n text the brand can still edit. */
const templateEntries = (t: TFunction, key: BriefTemplateKey): { points: string[]; donts: string[] } => {
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

const normalize = (field: BriefListField, raw: string): string => {
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
const merge = (current: readonly string[], extra: readonly string[]): string[] => {
  const next = [...current];
  extra.forEach(entry => {
    if (next.length < DEAL_BRIEF_LIMITS.maxEntries && !next.includes(entry)) next.push(entry);
  });
  return next;
};

/**
 * The brief's lists (talking points, don'ts, hashtags, mentions): add with the right shape
 * (`#tag`, `@account`), no duplicates, ≤ 10 × 300 like the server. A template fills points and
 * don'ts; a tone is one ready talking point (the API has no tone field), one at a time.
 */
export const useOfferBrief = (form: UseFormReturn<OfferFormValues>, talkingPoints: readonly string[]) => {
  const { t } = useTranslation();
  const { getValues, setValue } = form;

  const addEntry = useCallback(
    (field: BriefListField, raw: string): boolean => {
      const entry = normalize(field, raw);
      if (entry === '') return false;
      const current = getValues(field);
      if (current.includes(entry)) {
        toastService.info(t('marketplace.offer.brief.duplicate'));
        return false;
      }
      if (current.length >= DEAL_BRIEF_LIMITS.maxEntries) {
        toastService.info(t('marketplace.offer.brief.max', { max: DEAL_BRIEF_LIMITS.maxEntries }));
        return false;
      }
      setValue(field, [...current, entry], { shouldDirty: true });
      return true;
    },
    [getValues, setValue, t],
  );

  const removeEntry = useCallback(
    (field: BriefListField, entry: string) => {
      setValue(
        field,
        getValues(field).filter(value => value !== entry),
        { shouldDirty: true },
      );
    },
    [getValues, setValue],
  );

  const applyTemplate = useCallback(
    (key: BriefTemplateKey) => {
      const { points, donts } = templateEntries(t, key);
      setValue('talkingPoints', merge(getValues('talkingPoints'), points), { shouldDirty: true });
      setValue('donts', merge(getValues('donts'), donts), { shouldDirty: true });
    },
    [getValues, setValue, t],
  );

  const tonePoints = useMemo(
    () => BRIEF_TONES.map(tone => ({ tone, point: t(TONE_POINT[tone]) })),
    [t],
  );
  const activeTone = tonePoints.find(({ point }) => talkingPoints.includes(point))?.tone ?? null;

  const toggleTone = useCallback(
    (tone: BriefToneKey) => {
      const others = tonePoints.filter(entry => entry.tone !== tone).map(entry => entry.point);
      const point = t(TONE_POINT[tone]);
      const current = getValues('talkingPoints').filter(entry => !others.includes(entry));
      const next = current.includes(point) ? current.filter(entry => entry !== point) : merge(current, [point]);
      setValue('talkingPoints', next, { shouldDirty: true });
    },
    [getValues, setValue, t, tonePoints],
  );

  return { addEntry, removeEntry, applyTemplate, activeTone, toggleTone };
};

export type OfferBriefModel = ReturnType<typeof useOfferBrief>;
