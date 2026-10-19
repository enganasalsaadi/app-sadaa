import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, Card, Pressable, SectionHeader, Skeleton, Text } from '@/shared/ui';
import type { CampaignHistoryEvent } from '../utils/campaignDetail';
import { formatCampaignDateTime } from '../utils/campaignSchedule';

/** Events shown before «show all»: the latest few are what a brand comes back for. */
const PREVIEW_COUNT = 3;
const DOT = 10;

export interface CampaignHistoryCardProps {
  events: readonly CampaignHistoryEvent[];
  isLoading: boolean;
  isError: boolean;
  /** The newest step reads as a bad end (rejected, removed). */
  endedBadly: boolean;
  onRetry: () => void;
}

/**
 * The campaign's own log, newest first: lifecycle steps (a filled dot) and the notes between them
 * (a hollow one), server rows, never invented. Shows the latest few and opens to the rest.
 */
const CampaignHistoryCardComponent: React.FC<CampaignHistoryCardProps> = ({
  events,
  isLoading,
  isError,
  endedBadly,
  onRetry,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? events : events.slice(0, PREVIEW_COUNT);
  const newestStep = events.findIndex(event => !event.note);
  const more = events.length > PREVIEW_COUNT;

  return (
    <Box gap="md">
      <SectionHeader
        title={t('marketplace.campaign.detail.history.title')}
        subtitle={t('marketplace.campaign.detail.history.newest')}
        emphasis="strong"
      />
      <Card p="lg" shadow="card" borderRadius="lg">
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
        ) : events.length === 0 ? (
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.campaign.detail.history.empty')}
          </Text>
        ) : (
          <Box gap="md">
            {shown.map((event, index) => {
              const why = event.whyKey ? t(event.whyKey) : null;
              const dot = index === newestStep && endedBadly ? colors.status.danger.main : colors.interactive.main;
              return (
                <Box key={event.id} row gap="md" pt={index === 0 ? undefined : 'md'} borderTopWidth={index === 0 ? undefined : 'thin'} borderColor={colors.layout.divider}>
                  <Box
                    width={DOT}
                    height={DOT}
                    borderRadius="full"
                    mt="xs"
                    bg={event.note ? undefined : dot}
                    borderWidth={event.note ? 'md' : undefined}
                    borderColor={colors.text.tertiary}
                  />
                  <Box flex={1}>
                    <Text variant="bodyMedium" color={colors.text.primary}>
                      {event.titleKey ? t(event.titleKey) : event.title}
                    </Text>
                    {why ? (
                      <Text variant="caption" color={colors.text.secondary}>
                        {why}
                      </Text>
                    ) : null}
                    <Text variant="caption" color={colors.text.tertiary}>
                      {`${event.actor} · ${formatCampaignDateTime(event.occurredAt)}`}
                    </Text>
                  </Box>
                </Box>
              );
            })}
            {more ? (
              <Pressable
                align="center"
                justify="center"
                minHeight={sizes.button.md}
                onPress={() => setExpanded(previous => !previous)}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
              >
                <Text variant="buttonSmall" color={colors.interactive.text}>
                  {expanded
                    ? t('marketplace.campaign.detail.history.showLess')
                    : t('marketplace.campaign.detail.history.showAll', { count: events.length })}
                </Text>
              </Pressable>
            ) : null}
          </Box>
        )}
      </Card>
    </Box>
  );
};

export const CampaignHistoryCard = memo(CampaignHistoryCardComponent);
