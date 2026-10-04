import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, ChevronLeft, ChevronRight, Clock } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import {
  Box,
  Card,
  Notice,
  Skeleton,
  SocialPlatformIcon,
  StatusPill,
  Text,
  TierBadge,
} from '@/shared/ui';
import type { ProfileScreenModel } from '../hooks/useProfileScreen';

interface PlatformsSummaryCardProps {
  summary: ProfileScreenModel['platformsSummary'];
  details: ProfileScreenModel['details'];
  onPress: () => void;
}

/** One calm summary (primary account + counts); full management lives on its own screen. */
const PlatformsSummaryCardComponent: React.FC<PlatformsSummaryCardProps> = ({
  summary,
  details,
  onPress,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  if (details.isError) {
    return (
      <Notice
        tone="danger"
        message={t('account.profile.detailsError')}
        action={{ label: t('common.retry'), onPress: details.retry }}
      />
    );
  }

  const { primary } = summary;

  return (
    <Card
      shadow="none"
      p="lg"
      onPress={onPress}
      accessibilityLabel={t('account.profile.platforms.title')}
    >
      <Box gap="md">
        <Box row align="center" gap="sm">
          <Box flex={1}>
            <Text variant="title">{t('account.profile.platforms.title')}</Text>
          </Box>
          {details.isLoading ? (
            <Skeleton width="30%" height={sizes.icon.xs} />
          ) : (
            <Text variant="caption" color={colors.text.secondary}>
              {t('account.profile.platforms.summary', {
                platforms: summary.count,
                rates: summary.rateCardCount,
              })}
            </Text>
          )}
          <Chevron size={sizes.icon.sm} color={colors.icon.secondary} />
        </Box>

        {details.isLoading ? (
          <Skeleton width="60%" height={sizes.icon.md} borderRadius="md" />
        ) : primary ? (
          <Box row align="center" gap="sm">
            {isSocialPlatform(primary.platform) ? (
              <SocialPlatformIcon
                platform={primary.platform}
                size={sizes.icon.md}
                color={colors.text.primary}
              />
            ) : null}
            <Box flex={1}>
              <Text variant="bodyMedium" numberOfLines={1}>
                @{primary.username}
              </Text>
              <Text variant="caption" color={colors.text.tertiary}>
                {t('account.profile.platforms.primary')}
              </Text>
            </Box>
            {primary.follower_tier ? (
              <TierBadge tier={primary.follower_tier} size="sm" interactive={false} />
            ) : null}
          </Box>
        ) : (
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('account.profile.platforms.empty')}
          </Text>
        )}

        {summary.reviewStatus === 'under_review' ? (
          <StatusPill
            label={t('account.profile.platforms.underReview')}
            tone="info"
            icon={Clock}
            size="sm"
          />
        ) : null}
        {summary.reviewStatus === 'action_required' ? (
          <StatusPill
            label={t('account.profile.platforms.actionRequired')}
            tone="danger"
            icon={AlertCircle}
            size="sm"
          />
        ) : null}
      </Box>
    </Card>
  );
};

export const PlatformsSummaryCard = memo(PlatformsSummaryCardComponent);
