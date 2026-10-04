import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { CustomInput, SocialPlatformIcon } from '@/shared/ui';
import { SOCIAL_PLACEHOLDER_HOST, normalizeSocialUrl } from '@/shared/utils';
import type { SocialPlatform } from '@/shared/utils';
import { PLATFORM_LABEL_KEY } from '../constants/socialPlatforms';

export interface SocialLinkInputProps {
  platform: SocialPlatform;
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  error?: string;
  inputRef?: React.Ref<React.ComponentRef<typeof CustomInput>>;
}

/**
 * One optional link input. On blur a valid entry is rewritten to its canonical
 * https URL, so the user sees exactly what gets saved. Form-agnostic: each form
 * binds it with its own `Controller`.
 */
const SocialLinkInputComponent: React.FC<SocialLinkInputProps> = ({
  platform,
  value,
  onChange,
  onBlur,
  error,
  inputRef,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  const handleBlur = useCallback(() => {
    const normalized = normalizeSocialUrl(platform, value);
    if (normalized && normalized !== value) onChange(normalized);
    onBlur?.();
  }, [platform, value, onChange, onBlur]);

  return (
    <CustomInput
      ref={inputRef}
      label={t(PLATFORM_LABEL_KEY[platform])}
      placeholder={SOCIAL_PLACEHOLDER_HOST[platform]}
      value={value}
      onChangeText={onChange}
      onBlur={handleBlur}
      leftIcon={
        <SocialPlatformIcon platform={platform} size={sizes.icon.sm} color={colors.icon.secondary} />
      }
      autoCapitalize="none"
      autoCorrect={false}
      keyboardType="url"
      textContentType="URL"
      returnKeyType="next"
      error={error}
    />
  );
};

export const SocialLinkInput = memo(SocialLinkInputComponent);
