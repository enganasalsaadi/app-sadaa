import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Pencil, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, IconButton, SocialPlatformIcon, StatusPill, Tag, Text, TierBadge } from '@/shared/ui';
import { PLATFORM_LABEL_KEY } from '../constants/socialPlatforms';
import type { PlatformAccountFormValues } from '../schemas';

interface PlatformAccountRowProps {
  account: PlatformAccountFormValues;
  /** Server 422 for this row (`platforms.N.*`). */
  error?: string;
  onEdit: (platform: PlatformAccountFormValues['platform']) => void;
  onRemove: (platform: PlatformAccountFormValues['platform']) => void;
}

/**
 * One linked account in the socials step: icon, @handle, tier crest,
 * "under review" for hand-picked tiers, primary tag, edit/remove.
 */
export const PlatformAccountRow: React.FC<PlatformAccountRowProps> = memo(
  ({ account, error, onEdit, onRemove }) => {
    const { t } = useTranslation();
    const { colors, sizes } = useTheme();
    const platformLabel = t(PLATFORM_LABEL_KEY[account.platform]);
    const hasBadges =
      account.followerTier !== null || account.tierSource === 'manual' || account.isPrimary;
    const handleEdit = useCallback(() => onEdit(account.platform), [onEdit, account.platform]);
    const handleRemove = useCallback(
      () => onRemove(account.platform),
      [onRemove, account.platform],
    );

    return (
      <Box
        gap="sm"
        p="md"
        borderRadius="lg"
        borderWidth="thin"
        borderColor={error ? colors.status.danger.main : colors.border.default}
        bg={colors.surface.main}
      >
        <Box row align="center" gap="md">
          <Box
            width={sizes.button.md}
            height={sizes.button.md}
            borderRadius="md"
            bg={colors.interactive.soft}
            align="center"
            justify="center"
          >
            <SocialPlatformIcon
              platform={account.platform}
              size={sizes.icon.md}
              color={colors.interactive.main}
            />
          </Box>
          <Box flex={1} gap="xs">
            <Text variant="bodyMedium" numberOfLines={1}>
              {platformLabel}
            </Text>
            <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
              @{account.handle}
            </Text>
          </Box>
          <IconButton
            icon={Pencil}
            variant="ghost"
            size="sm"
            onPress={handleEdit}
            accessibilityLabel={t('auth.influencerOnboarding.socials.editAccount', {
              platform: platformLabel,
            })}
          />
          <IconButton
            icon={Trash2}
            variant="ghost"
            size="sm"
            tone="danger"
            onPress={handleRemove}
            accessibilityLabel={t('auth.influencerOnboarding.socials.removeAccount', {
              platform: platformLabel,
            })}
          />
        </Box>

        {hasBadges ? (
          <Box row align="center" gap="sm">
            {account.followerTier ? <TierBadge tier={account.followerTier} size="sm" /> : null}
            {account.tierSource === 'manual' ? (
              <StatusPill
                label={t('auth.influencerOnboarding.socials.underReview')}
                tone="info"
                icon={Clock}
                size="sm"
              />
            ) : null}
            {account.isPrimary ? (
              <Tag label={t('auth.influencerOnboarding.socials.primary')} tone="brand" />
            ) : null}
          </Box>
        ) : null}

        {error ? (
          <Text variant="caption" color={colors.status.danger.text}>
            {error}
          </Text>
        ) : null}
      </Box>
    );
  },
);
