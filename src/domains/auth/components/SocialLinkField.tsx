import React, { memo } from 'react';
import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { CustomInput, SocialPlatformIcon } from '@/shared/ui';
import { SOCIAL_PLACEHOLDER_HOST, normalizeSocialUrl } from '@/shared/utils';
import type { SocialPlatform } from '@/shared/utils';
import type { BrandProfileFormValues } from '../schemas';

const PLATFORM_LABEL_KEY = {
  instagram: 'auth.brandOnboarding.profile.platforms.instagram',
  facebook: 'auth.brandOnboarding.profile.platforms.facebook',
  tiktok: 'auth.brandOnboarding.profile.platforms.tiktok',
  youtube: 'auth.brandOnboarding.profile.platforms.youtube',
  telegram: 'auth.brandOnboarding.profile.platforms.telegram',
  website: 'auth.brandOnboarding.profile.platforms.website',
} as const satisfies Record<SocialPlatform, string>;

interface SocialLinkFieldProps {
  platform: SocialPlatform;
  control: Control<BrandProfileFormValues>;
}

/**
 * One optional input per platform. On blur a valid entry is rewritten to its
 * canonical https URL, so the user sees exactly what gets saved.
 */
const SocialLinkFieldComponent: React.FC<SocialLinkFieldProps> = ({
  platform,
  control,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Controller
      control={control}
      name={`socialLinks.${platform}`}
      render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
        <CustomInput
          ref={ref}
          label={t(PLATFORM_LABEL_KEY[platform])}
          placeholder={SOCIAL_PLACEHOLDER_HOST[platform]}
          value={value}
          onChangeText={onChange}
          onBlur={() => {
            const normalized = normalizeSocialUrl(platform, value);
            if (normalized && normalized !== value) onChange(normalized);
            onBlur();
          }}
          leftIcon={
            <SocialPlatformIcon
              platform={platform}
              size={sizes.icon.sm}
              color={colors.icon.secondary}
            />
          }
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          textContentType="URL"
          returnKeyType="next"
          error={fieldState.error?.message}
        />
      )}
    />
  );
};

export const SocialLinkField = memo(SocialLinkFieldComponent);
