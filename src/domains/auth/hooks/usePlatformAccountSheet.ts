import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import type { ChipGroupItem } from '@/shared/ui';
import { PLATFORM_LABEL_KEY } from '../constants/socialPlatforms';
import {
  createPlatformAccountSchema,
  isFollowerTier,
  isInfluencerPlatform,
  toHandle,
} from '../schemas';
import type {
  InfluencerPlatform,
  PlatformAccountDraft,
  PlatformAccountFormValues,
} from '../schemas';

const EMPTY: PlatformAccountDraft = { platform: '', handle: '', followerTier: '' };

interface PlatformAccountSheetConfig {
  visible: boolean;
  /** Set when editing an existing account. */
  initial: PlatformAccountFormValues | null;
  /** Platforms not linked yet (plus the one being edited). */
  platforms: readonly InfluencerPlatform[];
  onSave: (account: PlatformAccountFormValues) => void;
}

export const usePlatformAccountSheet = ({
  visible,
  initial,
  platforms,
  onSave,
}: PlatformAccountSheetConfig) => {
  const { t } = useTranslation();
  const schema = useMemo(() => createPlatformAccountSchema(t), [t]);

  const { control, handleSubmit, reset, setFocus } = useForm<PlatformAccountDraft>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: EMPTY,
  });

  // Fresh form on every open; the only platform left is preselected.
  useEffect(() => {
    if (!visible) return;
    const only = platforms.length === 1 ? platforms[0] : undefined;
    reset(
      initial
        ? { platform: initial.platform, handle: initial.handle, followerTier: initial.followerTier }
        : { ...EMPTY, platform: only ?? '' },
    );
  }, [initial, platforms, reset, visible]);

  const platformItems = useMemo<ChipGroupItem[]>(
    () => platforms.map(value => ({ value, label: t(PLATFORM_LABEL_KEY[value]) })),
    [platforms, t],
  );

  const onSubmit = useCallback(() => {
    handleSubmit(values => {
      // Already enforced by the schema; narrows the draft's strings.
      if (!isInfluencerPlatform(values.platform) || !isFollowerTier(values.followerTier)) return;
      const handle = toHandle(values.handle);
      // Untouched rows keep their source; any change is a hand-picked tier.
      const unchanged =
        initial?.handle === handle && initial.followerTier === values.followerTier;
      onSave({
        platform: values.platform,
        handle,
        followerTier: values.followerTier,
        tierSource: unchanged ? initial.tierSource : 'manual',
        isPrimary: initial?.isPrimary ?? false,
      });
    })();
  }, [handleSubmit, initial, onSave]);

  return { control, setFocus, platformItems, onSubmit, isEditing: initial !== null };
};
