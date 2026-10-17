import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { formatDate, formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme, type HueTone } from '@/core/theme';
import { Box, Pressable, StatusPill, Text } from '@/shared/ui';
import { DEAL_NOTE_LABEL, DEAL_STATION_LABEL } from '../constants/dealCopy';
import type { DealStationCopy } from '../hooks/useDealStationCopy';
import type { DealJourneyStage, DealJourneyStatus } from '../utils/dealJourney';
import type { DealStationState } from '../utils/dealStation';
import type { DealTimelineEvent } from '../utils/dealTimelineEvents';
import { DealAnnouncementRow } from './DealAnnouncementRow';
import { JOURNEY_STATUS_LABEL } from './DealJourneyRail';

const BADGE = moderateScale(32);
const EVENT_DOT = moderateScale(8);
const EVENT_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
};

const STATUS_TONE = {
  done: 'success',
  now: 'interactive',
  next: 'neutral',
  later: 'neutral',
} as const satisfies Record<DealJourneyStatus, HueTone>;

export interface DealStageCardProps {
  stages: DealJourneyStage[];
  state: DealStationState;
  selected: number;
  onSelect: (index: number) => void;
  copy: DealStationCopy;
  events: DealTimelineEvent[];
}

const EventRow = memo<{ event: DealTimelineEvent }>(({ event }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ radii, borderWidths }): Record<'dot', ViewStyle> => ({
      dot: {
        width: EVENT_DOT,
        height: EVENT_DOT,
        borderRadius: radii.full,
        backgroundColor: event.isNote
          ? colors.surface.main
          : colors.interactive.main,
        borderWidth: borderWidths.md,
        borderColor: colors.interactive.main,
      },
    }),
    [colors.interactive.main, colors.surface.main, event.isNote],
  );
  return (
    <Box row align="center" gap="md">
      <Box style={styles.dot} />
      <Box flex={1}>
        <Text variant="bodySmall" color={colors.text.primary} numberOfLines={2}>
          {event.note ? t(DEAL_NOTE_LABEL[event.note]) : event.label}
        </Text>
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.deals.stage.eventMeta', {
            actor: event.actor.label,
            time: formatDate(event.at, EVENT_FORMAT, i18n.language),
          })}
        </Text>
      </Box>
    </Box>
  );
});

/**
 * The station picked on the orbit (the current one at first): what it means for the viewer,
 * their part, and what the history recorded there with its times. Neighbours one tap away.
 */
const DealStageCardComponent: React.FC<DealStageCardProps> = ({
  stages,
  state,
  selected,
  onSelect,
  copy,
  events,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const stage = stages[selected];
  const prev = stages[selected - 1];
  const next = stages[selected + 1];
  const goPrev = useCallback(
    () => onSelect(selected - 1),
    [onSelect, selected],
  );
  const goNext = useCallback(
    () => onSelect(selected + 1),
    [onSelect, selected],
  );

  const styles = useStyles(
    ({
      radii,
      spacing,
      shadows,
      borderWidths,
    }): Record<'card' | 'badge' | 'part', ViewStyle> => ({
      card: {
        borderRadius: radii.xl,
        padding: spacing.lg,
        gap: spacing.md,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.card,
      },
      badge: {
        width: BADGE,
        height: BADGE,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.interactive.soft,
      },
      part: {
        borderRadius: radii.md,
        padding: spacing.md,
        backgroundColor: colors.surface.elevated,
        gap: spacing.xs,
      },
    }),
    [
      colors.border.card,
      colors.interactive.soft,
      colors.surface.elevated,
      colors.surface.main,
    ],
  );

  if (!stage) return null;
  const status: DealJourneyStatus = state === 'done' ? 'done' : stage.status;
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Animated.View
      key={stage.key}
      entering={reduceMotion ? undefined : FadeIn}
      style={styles.card}
    >
      <Box row align="center" gap="md">
        <Box style={styles.badge}>
          <Text variant="buttonSmall" color={colors.interactive.text}>
            {formatNumber(selected + 1)}
          </Text>
        </Box>
        <Box flex={1}>
          <Text variant="title" color={colors.text.primary} numberOfLines={1}>
            {copy.name}
          </Text>
        </Box>
        <StatusPill
          label={t(JOURNEY_STATUS_LABEL[status])}
          tone={STATUS_TONE[status]}
          size="sm"
        />
      </Box>

      <Box gap="xs">
        <Text variant="bodyMedium" color={colors.text.primary}>
          {copy.title}
        </Text>
        <Text variant="bodySmall" color={colors.text.secondary}>
          {copy.what}
        </Text>
      </Box>

      <Box style={styles.part}>
        <Text variant="overline" color={colors.text.tertiary}>
          {t('marketplace.journey.yourRole')}
        </Text>
        <Text variant="bodySmall" color={colors.text.primary}>
          {copy.you}
        </Text>
      </Box>

      {events.length > 0 ? (
        <Box gap="md">
          {events.map(event =>
            event.announcement ? (
              <DealAnnouncementRow key={event.id} event={event} />
            ) : (
              <EventRow key={event.id} event={event} />
            ),
          )}
        </Box>
      ) : status === 'done' || status === 'now' ? (
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.deals.stage.noEvents')}
        </Text>
      ) : null}

      <Box row justify="space-between" align="center">
        {prev ? (
          <Pressable
            onPress={goPrev}
            row
            align="center"
            gap="xs"
            minHeight={sizes.button.md}
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.journey.prev')}
          >
            <PrevIcon size={sizes.icon.sm} color={colors.interactive.text} />
            <Text variant="buttonSmall" color={colors.interactive.text}>
              {t(DEAL_STATION_LABEL[prev.key])}
            </Text>
          </Pressable>
        ) : (
          <Box />
        )}
        {next ? (
          <Pressable
            onPress={goNext}
            row
            align="center"
            gap="xs"
            minHeight={sizes.button.md}
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.journey.next')}
          >
            <Text variant="buttonSmall" color={colors.interactive.text}>
              {t(DEAL_STATION_LABEL[next.key])}
            </Text>
            <NextIcon size={sizes.icon.sm} color={colors.interactive.text} />
          </Pressable>
        ) : null}
      </Box>
    </Animated.View>
  );
};

export const DealStageCard = memo(DealStageCardComponent);
