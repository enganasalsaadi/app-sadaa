import React from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import {
  Box,
  ChipGroup,
  CustomButton,
  FormSection,
  InlineError,
  Layout, LayoutFooter,
  Pressable,
  Text,
} from '@/shared/ui';
import { SocialLinkField } from '../../components/SocialLinkField';
import { useBrandProfileScreen } from './hooks/useBrandProfileScreen';

export const BrandProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const {
    control,
    governorates,
    businessTypes,
    lookupsFailed,
    retryLookups,
    visiblePlatforms,
    canShowMorePlatforms,
    showMorePlatforms,
    onSubmit,
    isSaving,
    error,
  } = useBrandProfileScreen();

  return (
    <Layout
      padding={{ y: '2xl' }}
      footer={
        <LayoutFooter
          primary={{
            label: t('auth.brandOnboarding.profile.submit'),
            onPress: onSubmit,
            loading: isSaving,
          }}
        />
      }
    >
      <Box gap="3xl">
        {lookupsFailed ? (
          <Box gap="md" p="lg" borderRadius="lg" bg={colors.status.danger.soft}>
            <Text variant="bodySmall" color={colors.status.danger.text}>
              {t('auth.brandOnboarding.profile.lookupsError')}
            </Text>
            <CustomButton
              title={t('common.retry')}
              onPress={retryLookups}
              variant="outline"
              size="sm"
            />
          </Box>
        ) : null}

        <Controller
          control={control}
          name="governorate"
          render={({ field: { value, onChange }, fieldState }) => (
            <FormSection
              title={t('auth.brandOnboarding.profile.governorate')}
              description={t('auth.brandOnboarding.profile.governorateHint')}
              error={fieldState.error?.message}
            >
              <ChipGroup
                items={governorates.items}
                value={value}
                onChange={onChange}
                loading={governorates.isLoading}
                skeletonCount={8}
                accessibilityLabel={t('auth.brandOnboarding.profile.governorate')}
              />
            </FormSection>
          )}
        />

        <Controller
          control={control}
          name="businessType"
          render={({ field: { value, onChange }, fieldState }) => (
            <FormSection
              title={t('auth.brandOnboarding.profile.businessType')}
              error={fieldState.error?.message}
            >
              <ChipGroup
                items={businessTypes.items}
                value={value}
                onChange={onChange}
                loading={businessTypes.isLoading}
                accessibilityLabel={t('auth.brandOnboarding.profile.businessType')}
              />
            </FormSection>
          )}
        />

        <FormSection
          title={t('auth.brandOnboarding.profile.socialLinks')}
          tag={t('common.optional')}
          description={t('auth.brandOnboarding.profile.socialLinksHint')}
        >
          <Box gap="lg">
            {visiblePlatforms.map(platform => (
              <SocialLinkField key={platform} platform={platform} control={control} />
            ))}
          </Box>
          {canShowMorePlatforms ? (
            <Pressable
              onPress={showMorePlatforms}
              row
              align="center"
              gap="xs"
              minHeight={sizes.button.md}
              accessibilityRole="button"
              accessibilityLabel={t('auth.brandOnboarding.profile.morePlatforms')}
            >
              <Text variant="bodyMedium" color={colors.interactive.text}>
                {t('auth.brandOnboarding.profile.morePlatforms')}
              </Text>
              <ChevronDown size={sizes.icon.sm} color={colors.interactive.main} />
            </Pressable>
          ) : null}
        </FormSection>

        <InlineError error={error} />
      </Box>
    </Layout>
  );
};
