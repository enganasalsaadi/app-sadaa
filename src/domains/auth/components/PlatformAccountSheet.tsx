import React, { memo } from 'react';
import { ScrollView } from 'react-native';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useStyles } from '@/core/theme';
import {
  BottomSheet,
  Box,
  ChipGroup,
  CustomButton,
  CustomInput,
  FormSection,
  Text,
} from '@/shared/ui';
import { usePlatformAccountSheet } from '../hooks/usePlatformAccountSheet';
import type { InfluencerPlatform, PlatformAccountFormValues } from '../schemas';
import { isFollowerTier } from '../schemas';
import { FollowerTierPicker } from './FollowerTierPicker';
import type { FollowerTierOption } from './FollowerTierPicker';

interface PlatformAccountSheetProps {
  visible: boolean;
  onClose: () => void;
  initial: PlatformAccountFormValues | null;
  platforms: readonly InfluencerPlatform[];
  tiers: readonly FollowerTierOption[];
  tiersLoading: boolean;
  onSave: (account: PlatformAccountFormValues) => void;
}

/** Add or edit one linked account: platform, @handle, follower range. */
export const PlatformAccountSheet: React.FC<PlatformAccountSheetProps> = memo(
  ({ visible, onClose, initial, platforms, tiers, tiersLoading, onSave }) => {
    const { t } = useTranslation();
    const { control, platformItems, onSubmit, isEditing } = usePlatformAccountSheet({
      visible,
      initial,
      platforms,
      onSave,
    });
    const styles = useStyles(({ spacing }) => ({
      content: { paddingHorizontal: spacing['2xl'], paddingBottom: spacing['2xl'], gap: spacing['2xl'] },
    }));

    return (
      <BottomSheet visible={visible} onClose={onClose}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text variant="h4" align="center" accessibilityRole="header">
            {isEditing
              ? t('auth.influencerOnboarding.socials.sheet.editTitle')
              : t('auth.influencerOnboarding.socials.sheet.addTitle')}
          </Text>

          <Controller
            control={control}
            name="platform"
            render={({ field: { value, onChange }, fieldState }) => (
              <FormSection
                title={t('auth.influencerOnboarding.socials.sheet.platform')}
                error={fieldState.error?.message}
              >
                <ChipGroup
                  items={platformItems}
                  value={value || null}
                  onChange={onChange}
                  disabled={isEditing}
                  accessibilityLabel={t('auth.influencerOnboarding.socials.sheet.platform')}
                />
              </FormSection>
            )}
          />

          <Controller
            control={control}
            name="handle"
            render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
              <CustomInput
                ref={ref}
                label={t('auth.influencerOnboarding.socials.sheet.username')}
                placeholder={t('auth.influencerOnboarding.socials.sheet.usernamePlaceholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                autoComplete="username"
                returnKeyType="done"
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="followerTier"
            render={({ field: { value, onChange }, fieldState }) => (
              <FormSection
                title={t('auth.influencerOnboarding.socials.sheet.tier')}
                description={t('auth.influencerOnboarding.socials.sheet.tierHint')}
                error={fieldState.error?.message}
              >
                <FollowerTierPicker
                  options={tiers}
                  value={isFollowerTier(value) ? value : null}
                  onChange={onChange}
                  loading={tiersLoading}
                  accessibilityLabel={t('auth.influencerOnboarding.socials.sheet.tier')}
                />
              </FormSection>
            )}
          />

          <Box gap="sm">
            <CustomButton
              title={
                isEditing
                  ? t('auth.influencerOnboarding.socials.sheet.update')
                  : t('auth.influencerOnboarding.socials.sheet.add')
              }
              onPress={onSubmit}
              fullWidth
            />
            <CustomButton title={t('common.cancel')} onPress={onClose} variant="ghost" fullWidth />
          </Box>
        </ScrollView>
      </BottomSheet>
    );
  },
);
