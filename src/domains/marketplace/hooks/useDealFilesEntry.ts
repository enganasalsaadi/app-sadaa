import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { DealsStackScreenProps } from '@/core/navigation';
import { useGetDealFilesQuery } from '../api/dealFilesApi';
import type { DealRole } from '../types';
import { buildDealVault, isSaveable, vaultFiles } from '../utils/dealVault';
import { useDealFileRefresh } from './useDealFileRefresh';

type Navigation = DealsStackScreenProps<'DealDetail'>['navigation'];

/** The deal page's files strip: the vault's files and the way in. `null` until there is a file. */
export const useDealFilesEntry = (role: DealRole, dealId: string) => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const { data } = useGetDealFilesQuery({ role, id: dealId });
  const refreshUrl = useDealFileRefresh(role, dealId);

  const all = useMemo(
    () => (data ? vaultFiles(buildDealVault(data, role, n => t('marketplace.vault.photoName', { n }))) : []),
    [data, role, t],
  );
  const files = useMemo(() => all.filter(isSaveable), [all]);
  const seeAll = useCallback(() => navigation.navigate('DealFiles', { id: dealId }), [dealId, navigation]);

  return all.length > 0 ? { count: all.length, files, refreshUrl, seeAll } : null;
};
