import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { INFLUENCER_PLATFORMS, type PlatformAccountFormValues } from '@/domains/auth';
import { useAddPlatformMutation, useGetPlatformsQuery } from '../../../api/platformsApi';
import { usePlatformSheetSupport } from '../../../hooks/usePlatformSheetSupport';
import { platformErrorMessage, toPlatformBody } from '../../../utils/platformForm';

type Navigation = NativeStackNavigationProp<SettingsStackParamList, 'PlatformsScreen'>;

export const usePlatformsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const list = useGetPlatformsQuery();
  const support = usePlatformSheetSupport();
  const [addPlatform, { isLoading: isAdding }] = useAddPlatformMutation();
  const [sheetVisible, setSheetVisible] = useState(false);

  const platforms = useMemo(() => list.data ?? [], [list.data]);
  // One account per platform (409 `platform_already_exists`): offer only the free ones.
  const freePlatforms = useMemo(
    () => INFLUENCER_PLATFORMS.filter(id => !platforms.some(item => item.platform === id)),
    [platforms],
  );

  const openAdd = useCallback(() => setSheetVisible(true), []);
  const closeSheet = useCallback(() => setSheetVisible(false), []);
  const openPlatform = useCallback(
    (platformId: string) => navigation.navigate('PlatformDetailScreen', { platformId }),
    [navigation],
  );

  const onAdd = useCallback(
    async (account: PlatformAccountFormValues) => {
      try {
        await addPlatform({
          platform: account.platform,
          ...toPlatformBody(account),
          ...(account.isPrimary ? { is_primary: true } : {}),
        }).unwrap();
        setSheetVisible(false);
        toastService.success(t('account.platforms.added'));
      } catch (err) {
        const message = platformErrorMessage(err, t);
        if (message) toastService.error(message);
      }
    },
    [addPlatform, t],
  );

  return {
    platforms,
    isLoading: list.isLoading,
    isRefreshing: list.isFetching && !list.isLoading,
    isError: list.isError && !list.data,
    refetch: list.refetch,
    canAdd: !list.isLoading && freePlatforms.length > 0,
    openAdd,
    openPlatform,
    sheet: {
      visible: sheetVisible,
      onClose: closeSheet,
      initial: null,
      platforms: freePlatforms,
      ...support,
      onSave: onAdd,
      saving: isAdding,
    },
  };
};
