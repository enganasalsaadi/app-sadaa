import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetLookupsQuery } from '@/core/api';
import type { FollowerTierOption } from '../components/FollowerTierPicker';
import { FOLLOWER_TIERS } from '../store';
import type { FollowerTierId } from '../store';

/** Follower tiers from /lookups in ladder order, localized. */
export const useFollowerTierOptions = () => {
  const { i18n } = useTranslation();
  const { data, isLoading } = useGetLookupsQuery();
  const lookup = data?.follower_tiers;
  const isArabic = i18n.language.startsWith('ar');

  const options = useMemo<FollowerTierOption[]>(
    () =>
      FOLLOWER_TIERS.flatMap(id => {
        const tier = lookup?.[id];
        return tier ? [{ id, label: isArabic ? tier.label_ar : tier.label_en, range: tier.range }] : [];
      }),
    [isArabic, lookup],
  );

  const labelOf = useCallback(
    (id: FollowerTierId) => options.find(option => option.id === id)?.label ?? id,
    [options],
  );

  return { options, labelOf, isLoading };
};
