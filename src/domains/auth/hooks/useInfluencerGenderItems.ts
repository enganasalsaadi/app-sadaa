import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import type { ChipGroupItem } from '@/shared/ui';
import { INFLUENCER_GENDERS } from '../store';
import type { InfluencerGender } from '../store';

const GENDER_KEY = {
  male: 'common.gender.male',
  female: 'common.gender.female',
} as const satisfies Record<InfluencerGender, ParseKeys>;

/** Gender chips shared by the onboarding socials step and the profile editor. */
export const useInfluencerGenderItems = (): ChipGroupItem[] => {
  const { t } = useTranslation();
  return useMemo(
    () => INFLUENCER_GENDERS.map(value => ({ value, label: t(GENDER_KEY[value]) })),
    [t],
  );
};
