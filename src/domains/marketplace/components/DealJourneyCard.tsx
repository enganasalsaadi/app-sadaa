import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Check, Clock, Hourglass, PenLine, ShieldCheck, User } from 'lucide-react-native';
import { useCountdown } from '@/core/hooks';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, LiveDot, Text } from '@/shared/ui';
import type { DealJourneyCopy } from '../hooks/useDealJourneyCopy';
import type { DealJourneyActor, DealJourneyStatus } from '../utils/dealJourney';
import { monogramOf } from '../utils/creatorText';
import { JOURNEY_STATUS_LABEL } from './DealJourneyRail';

const RING = moderateScale(78);
const RING_STROKE = 6;
const ACTOR_MARK = moderateScale(24);
const SECONDS_PER_HOUR = 3600;
const pad = (value: number) => formatNumber(value, { minimumIntegerDigits: 2 });

interface ReplyCountdownProps {
  dueAt: number;
  windowHours: number;
}

/** Live reply window: a ring that empties as the creator's time to answer runs out. */
const ReplyCountdown = memo<ReplyCountdownProps>(({ dueAt, windowHours }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    (): Record<'ring', ViewStyle> => ({ ring: { position: 'absolute', transform: [{ rotate: '-90deg' }] } }),
    [],
  );
  const left = useCountdown(dueAt);
  const share = Math.min(1, left / Math.max(1, windowHours * SECONDS_PER_HOUR));
  const radius = (RING - RING_STROKE) / 2;
  const length = 2 * Math.PI * radius;
  const hours = Math.floor(left / SECONDS_PER_HOUR);
  const minutes = Math.floor((left % SECONDS_PER_HOUR) / 60);
  const seconds = left % 60;
  const clock = `${formatNumber(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return (
    <Box row align="center" gap="lg" mt="xs" accessibilityRole="timer" accessibilityLabel={`${t('marketplace.journey.countdown')} ${clock}`}>
      <Box width={RING} height={RING} align="center" justify="center">
        <Svg width={RING} height={RING} style={styles.ring}>
          <Circle cx={RING / 2} cy={RING / 2} r={radius} stroke={colors.surface.elevated} strokeWidth={RING_STROKE} fill="none" />
          <Circle
            cx={RING / 2}
            cy={RING / 2}
            r={radius}
            stroke={colors.interactive.main}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={`${length} ${length}`}
            strokeDashoffset={length * (1 - share)}
            fill="none"
          />
        </Svg>
        <Hourglass size={sizes.icon.md} color={colors.interactive.main} />
      </Box>
      <Box>
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.journey.countdown')}
        </Text>
        <Text variant="amountLarge" color={colors.text.primary} writingDirection="ltr">
          {clock}
        </Text>
      </Box>
    </Box>
  );
});

export interface DealJourneyCardProps {
  copy: DealJourneyCopy;
  status: DealJourneyStatus;
  actor: DealJourneyActor;
  creatorName: string;
  /** Live reply station: the creator's answer deadline, ticking. */
  replyDueAt: number | null;
  replyWindowHours: number;
}

/** The selected station in full: status, who moves, when, what happens, your part, if late. */
const DealJourneyCardComponent: React.FC<DealJourneyCardProps> = ({
  copy,
  status,
  actor,
  creatorName,
  replyDueAt,
  replyWindowHours,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, shadows }): Record<'card' | 'chip' | 'mark' | 'tile', ViewStyle> => ({
      card: { borderRadius: radii.xl, backgroundColor: colors.layout.base, padding: spacing.lg, gap: spacing.sm },
      chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radii.full,
      },
      mark: {
        width: ACTOR_MARK,
        height: ACTOR_MARK,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
      },
      tile: {
        flex: 1,
        minWidth: '45%',
        borderRadius: radii.lg,
        padding: spacing.md,
        gap: spacing.xs,
        backgroundColor: colors.surface.main,
        ...shadows.sm,
      },
    }),
    [colors.layout.base, colors.surface.main],
  );

  const hue =
    status === 'done'
      ? colors.status.success
      : status === 'now'
        ? colors.interactive
        : status === 'next'
          ? colors.status.info
          : colors.status.neutral;
  const actorName =
    actor === 'you' ? t('marketplace.journey.you') : actor === 'sada' ? t('marketplace.journey.sada') : creatorName;
  const actorBg =
    actor === 'you' ? colors.brand.soft : actor === 'sada' ? colors.money.soft : colors.interactive.soft;
  const showCountdown = status === 'now' && replyDueAt !== null;

  return (
    <Box style={styles.card}>
      <Box row align="center" justify="space-between" gap="sm">
        <Box style={styles.chip} bg={hue.soft}>
          {status === 'done' ? (
            <Check size={sizes.icon.xs} color={hue.main} />
          ) : status === 'now' ? (
            <LiveDot color={hue.main} />
          ) : (
            <Box width={sizes.icon.xs / 2} height={sizes.icon.xs / 2} borderRadius="full" bg={hue.main} />
          )}
          <Text variant="buttonSmall" color={hue.text}>
            {t(JOURNEY_STATUS_LABEL[status])}
          </Text>
        </Box>
        <Box row align="center" gap="xs">
          <Box style={styles.mark} bg={actorBg}>
            {actor === 'you' ? (
              <User size={sizes.icon.xs} color={colors.brand.text} />
            ) : actor === 'sada' ? (
              <ShieldCheck size={sizes.icon.xs} color={colors.money.text} />
            ) : (
              <Text variant="caption" color={colors.interactive.text}>
                {monogramOf(creatorName)}
              </Text>
            )}
          </Box>
          <Text variant="label" color={colors.text.secondary} numberOfLines={1}>
            {actorName}
          </Text>
        </Box>
      </Box>
      <Text variant="title" color={colors.text.primary} mt="xs">
        {copy.title}
      </Text>
      {showCountdown && replyDueAt !== null ? (
        <ReplyCountdown dueAt={replyDueAt} windowHours={replyWindowHours} />
      ) : (
        <Box row align="center" gap="xs">
          <Clock size={sizes.icon.xs} color={colors.interactive.main} />
          <Text variant="label" color={colors.interactive.text}>
            {copy.when}
          </Text>
        </Box>
      )}
      <Text variant="bodySmall" color={colors.text.secondary}>
        {copy.what}
      </Text>
      <Box row wrap gap="sm" mt="xs">
        <Box style={styles.tile}>
          <Box row align="center" gap="xs">
            <PenLine size={sizes.icon.xs} color={colors.interactive.main} />
            <Text variant="overline" color={colors.interactive.text}>
              {t('marketplace.journey.yourRole')}
            </Text>
          </Box>
          <Text variant="bodySmall" color={colors.text.primary}>
            {copy.you}
          </Text>
        </Box>
        {copy.ifLate ? (
          <Box style={styles.tile}>
            <Box row align="center" gap="xs">
              <Hourglass size={sizes.icon.xs} color={colors.status.warning.main} />
              <Text variant="overline" color={colors.status.warning.text}>
                {t('marketplace.journey.ifLate')}
              </Text>
            </Box>
            <Text variant="bodySmall" color={colors.text.primary}>
              {copy.ifLate}
            </Text>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export const DealJourneyCard = memo(DealJourneyCardComponent);
