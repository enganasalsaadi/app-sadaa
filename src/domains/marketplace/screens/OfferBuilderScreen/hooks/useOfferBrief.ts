import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import { toastService } from '@/core/toast';
import { DEAL_BRIEF_LIMITS } from '../../../constants/dealOffer';
import {
  activeBriefTone,
  briefTemplateEntries,
  mergeBriefEntries,
  normalizeBriefEntry,
  toggleBriefTone,
  type BriefListField,
  type BriefTemplateKey,
  type BriefToneKey,
} from '../../../utils/briefEntries';
import type { OfferFormValues } from '../../../utils/offerForm';

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
      const entry = normalizeBriefEntry(field, raw);
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
      const { points, donts } = briefTemplateEntries(t, key);
      setValue('talkingPoints', mergeBriefEntries(getValues('talkingPoints'), points), { shouldDirty: true });
      setValue('donts', mergeBriefEntries(getValues('donts'), donts), { shouldDirty: true });
    },
    [getValues, setValue, t],
  );

  const activeTone = useMemo(() => activeBriefTone(t, talkingPoints), [t, talkingPoints]);

  const toggleTone = useCallback(
    (tone: BriefToneKey) => setValue('talkingPoints', toggleBriefTone(t, getValues('talkingPoints'), tone), { shouldDirty: true }),
    [getValues, setValue, t],
  );

  return { addEntry, removeEntry, applyTemplate, activeTone, toggleTone };
};

export type OfferBriefModel = ReturnType<typeof useOfferBrief>;
