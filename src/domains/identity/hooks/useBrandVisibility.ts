import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toastService } from '@/core/toast';
import { useGetBrandSettingsQuery, useUpdateBrandSettingsMutation } from '../api/brandSettingsApi';
import { shouldToastFailure } from '../utils/requestFailure';

export interface BrandVisibilityModel {
  /** `null` until the first answer; the switch is not shown with a guessed value. */
  visible: boolean | null;
  isLoading: boolean;
  isError: boolean;
  isSaving: boolean;
  onToggle: (next: boolean) => void;
  retry: () => void;
}

/** "Show my brand on creators' profiles" (contract §8.3). */
/** `enabled` is false for creators: `/brand/settings` is brand-only (403 otherwise). */
export const useBrandVisibility = (enabled: boolean): BrandVisibilityModel => {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useGetBrandSettingsQuery(undefined, {
    skip: !enabled,
  });
  const [update, { isLoading: isSaving }] = useUpdateBrandSettingsMutation();

  const onToggle = useCallback(
    (next: boolean) => {
      update({ show_on_creator_profiles: next })
        .unwrap()
        .catch((error: unknown) => {
          // 422 is already toasted by baseQuery; 403/5xx/offline have their own surfaces.
          if (shouldToastFailure(error)) {
            toastService.error(t('account.profile.brandVisibility.updateFailed'));
          }
        });
    },
    [update, t],
  );

  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    visible: data?.show_on_creator_profiles ?? null,
    isLoading,
    isError: isError && !data,
    isSaving,
    onToggle,
    retry,
  };
};
