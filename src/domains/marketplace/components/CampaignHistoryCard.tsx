import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Card, Pressable, Skeleton, Text, Timeline, type TimelineStep } from '@/shared/ui';
import type { CampaignHistoryEvent } from '../utils/campaignDetail';
import { formatCampaignDateTime } from '../utils/campaignSchedule';

export interface CampaignHistoryCardProps {
  events: readonly CampaignHistoryEvent[];
  isLoading: boolean;
  isError: boolean;
  /** The newest step reads as a bad end (rejected, removed). */
  endedBadly: boolean;
  onRetry: () => void;
}

/** The campaign's own log, newest first: lifecycle steps and the notes between them (server rows, never invented). */
const CampaignHistoryCardComponent: React.FC<CampaignHistoryCardProps> = ({
  events,
  isLoading,
  isError,
  endedBadly,
  onRetry,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  const steps = useMemo<TimelineStep[]>(() => {
    const newestStep = events.findIndex(event => !event.note);
    return events.map((event, index) => {
      const titleKey = event.titleKey;
      const why = event.whyKey ? t(event.whyKey) : null;
      const caption = [`${event.actor} · ${formatCampaignDateTime(event.occurredAt)}`, why].filter(Boolean).join('\n');
      return {
        key: event.id,
        title: titleKey ? t(titleKey) : event.title,
        caption,
        state: index === newestStep ? (endedBadly ? 'error' : 'current') : 'done',
      };
    });
  }, [endedBadly, events, t]);

  return (
    <Card p="lg" shadow="card">
      <Box gap="md">
        <Box row align="center" justify="space-between">
          <Text variant="title" color={colors.text.primary}>
            {t('marketplace.campaign.detail.history.title')}
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            {t('marketplace.campaign.detail.history.newest')}
          </Text>
        </Box>
        {isLoading ? (
          <Box gap="md">
            <Skeleton width="60%" height={16} borderRadius="sm" />
            <Skeleton width="80%" height={16} borderRadius="sm" />
            <Skeleton width="50%" height={16} borderRadius="sm" />
          </Box>
        ) : isError ? (
          <Box gap="sm" align="flex-start">
            <Text variant="bodySmall" color={colors.text.secondary}>
              {t('marketplace.campaign.detail.history.loadFailed')}
            </Text>
            <Pressable
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel={t('common.retry')}
              hitSlop={sizes.hitSlop.md}
            >
              <Text variant="buttonSmall" color={colors.interactive.text}>
                {t('common.retry')}
              </Text>
            </Pressable>
          </Box>
        ) : steps.length === 0 ? (
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.campaign.detail.history.empty')}
          </Text>
        ) : (
          <Timeline steps={steps} />
        )}
      </Box>
    </Card>
  );
};

export const CampaignHistoryCard = memo(CampaignHistoryCardComponent);
