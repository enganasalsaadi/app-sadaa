import React, { memo } from 'react';
import { ScrollView } from 'react-native';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import {
  BottomSheet,
  Box,
  ChipGroup,
  CustomButton,
  CustomInput,
  FormSection,
  ListRow,
  Notice,
  Switch,
  Text,
  TierBadge,
} from '@/shared/ui';
import { usePlatformAccountSheet } from '../hooks/usePlatformAccountSheet';
import type { InfluencerPlatform, PlatformAccountFormValues } from '../schemas';
import { isFollowerTier } from '../schemas';
import { formatClock } from '../utils/formatClock';
import { FollowerTierPicker } from './FollowerTierPicker';
import type { FollowerTierOption } from './FollowerTierPicker';
import { SocialProfileCard } from './SocialProfileCard';

interface PlatformAccountSheetProps {
  visible: boolean;
  onClose: () => void;
  initial: PlatformAccountFormValues | null;
  platforms: readonly InfluencerPlatform[];
  supportsLookup: (platform: InfluencerPlatform) => boolean;
  tiers: readonly FollowerTierOption[];
  tiersLoading: boolean;
  onSave: (account: PlatformAccountFormValues) => void;
  /** A server write is in flight (in-app management); the sheet stays open until it settles. */
  saving?: boolean;
  /** The primary toggle; in-app edits change it on the platform screen instead. */
  showPrimary?: boolean;
}

/**
 * Add or edit one linked account (contract §14): platform, @handle, then a
 * lookup fills the follower tier, or the user picks it (reviewed by admin).
 */
export const PlatformAccountSheet: React.FC<PlatformAccountSheetProps> = memo(
  ({
    visible,
    onClose,
    initial,
    platforms,
    supportsLookup,
    tiers,
    tiersLoading,
    onSave,
    saving = false,
    showPrimary = true,
  }) => {
    const { t } = useTranslation();
    const { colors, sizes } = useTheme();
    const sheet = usePlatformAccountSheet({
      visible,
      initial,
      platforms,
      supportsLookup,
      onSave,
    });
    const { control, tierMode, lookupKind, throttleSeconds } = sheet;
    const styles = useStyles(({ spacing }) => ({
      content: {
        paddingHorizontal: spacing['2xl'],
        paddingBottom: spacing['2xl'],
        gap: spacing['2xl'],
      },
    }));

    return (
      <BottomSheet visible={visible} onClose={onClose}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text variant="h4" align="center" accessibilityRole="header">
            {sheet.isEditing
              ? t('auth.influencerOnboarding.socials.sheet.editTitle')
              : t('auth.influencerOnboarding.socials.sheet.addTitle')}
          </Text>

          <Controller
            control={control}
            name="platform"
            render={({ field: { value }, fieldState }) => (
              <FormSection
                title={t('auth.influencerOnboarding.socials.sheet.platform')}
                error={fieldState.error?.message}
              >
                <ChipGroup
                  items={sheet.platformItems}
                  value={value || null}
                  onChange={sheet.onPlatformChange}
                  disabled={sheet.isEditing || sheet.isChecking}
                  accessibilityLabel={t(
                    'auth.influencerOnboarding.socials.sheet.platform',
                  )}
                />
              </FormSection>
            )}
          />

          <Box gap="md">
            <Controller
              control={control}
              name="handle"
              render={({
                field: { ref, value, onChange, onBlur },
                fieldState,
              }) => (
                <CustomInput
                  ref={ref}
                  label={t('auth.influencerOnboarding.socials.sheet.username')}
                  placeholder={t(
                    'auth.influencerOnboarding.socials.sheet.usernamePlaceholder',
                  )}
                  value={value}
                  onChangeText={text => {
                    onChange(text);
                    sheet.onHandleEdited(text);
                  }}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="username"
                  autoComplete="username"
                  returnKeyType={sheet.canLookup ? 'search' : 'done'}
                  onSubmitEditing={sheet.canLookup ? sheet.onCheck : undefined}
                  error={fieldState.error?.message ?? sheet.handleError}
                />
              )}
            />
            {sheet.canLookup ? (
              <CustomButton
                title={
                  throttleSeconds > 0
                    ? t('auth.influencerOnboarding.socials.lookup.checkIn', {
                        time: formatClock(throttleSeconds),
                      })
                    : t('auth.influencerOnboarding.socials.lookup.check')
                }
                onPress={sheet.onCheck}
                variant="secondary"
                size="md"
                loading={sheet.isChecking}
                disabled={throttleSeconds > 0}
                leftIcon={
                  <Search
                    size={sizes.icon.sm}
                    color={colors.interactive.main}
                  />
                }
                fullWidth
              />
            ) : null}
          </Box>

          {sheet.isChecking ? <SocialProfileCard loading /> : null}
          {sheet.foundProfile ? (
            <SocialProfileCard profile={sheet.foundProfile} />
          ) : null}

          {lookupKind === 'unavailable' ? (
            <Notice
              tone="info"
              message={t(
                'auth.influencerOnboarding.socials.lookup.unavailable',
              )}
            />
          ) : null}
          {lookupKind === 'throttled' && throttleSeconds > 0 ? (
            <Notice
              tone="warning"
              message={t('auth.influencerOnboarding.socials.lookup.throttled', {
                time: formatClock(throttleSeconds),
              })}
            />
          ) : null}

          {/* Kept from an earlier lookup (editing): no fresh card to show it in. */}
          {tierMode === 'locked' && !sheet.foundProfile && sheet.lockedTier ? (
            <FormSection
              title={t('auth.influencerOnboarding.socials.sheet.tier')}
              description={t(
                'auth.influencerOnboarding.socials.lookup.tierLocked',
              )}
            >
              <TierBadge
                tier={sheet.lockedTier}
                size="md"
                interactive={false}
              />
            </FormSection>
          ) : null}

          {tierMode === 'manual' ? (
            <Controller
              control={control}
              name="followerTier"
              render={({ field: { value, onChange }, fieldState }) => (
                <FormSection
                  title={t('auth.influencerOnboarding.socials.sheet.tier')}
                  description={t(
                    'auth.influencerOnboarding.socials.lookup.manualHint',
                  )}
                  error={fieldState.error?.message}
                >
                  <FollowerTierPicker
                    options={tiers}
                    value={isFollowerTier(value) ? value : null}
                    onChange={onChange}
                    loading={tiersLoading}
                    accessibilityLabel={t(
                      'auth.influencerOnboarding.socials.sheet.tier',
                    )}
                  />
                </FormSection>
              )}
            />
          ) : null}

          {showPrimary ? (
            <Controller
              control={control}
              name="isPrimary"
              render={({ field: { value, onChange } }) => (
                <ListRow
                  title={t('auth.influencerOnboarding.socials.sheet.primary')}
                  subtitle={t(
                    'auth.influencerOnboarding.socials.sheet.primaryHint',
                  )}
                  trailing={
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      accessibilityLabel={t(
                        'auth.influencerOnboarding.socials.sheet.primary',
                      )}
                    />
                  }
                />
              )}
            />
          ) : null}

          <Box gap="sm">
            <CustomButton
              title={
                sheet.isEditing
                  ? t('auth.influencerOnboarding.socials.sheet.update')
                  : t('auth.influencerOnboarding.socials.sheet.add')
              }
              onPress={sheet.onSubmit}
              loading={saving}
              fullWidth
            />
            <CustomButton
              title={t('common.cancel')}
              onPress={onClose}
              variant="ghost"
              disabled={saving}
              fullWidth
            />
          </Box>
        </ScrollView>
      </BottomSheet>
    );
  },
);
