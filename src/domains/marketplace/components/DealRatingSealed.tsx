import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Text } from '@/shared/ui';
import type { DealRatingSeal } from '../hooks/useDealRating';
import { ratingHoursLeft } from '../utils/dealRating';
import { formatDuration } from '../utils/offerDuration';
import { DealRatingClock } from './DealRatingClock';
import { DealRatingEnvelope } from './DealRatingEnvelope';
import { DealRatingWax } from './DealRatingWax';

const ENVELOPE_HEIGHT = moderateScale(150);
const WAX = moderateScale(82);

export interface DealRatingSealedProps {
  name: string;
  seal: DealRatingSeal;
  dueAt: number | null;
  now: number;
  onDone: () => void;
}

/**
 * The moment after sending: the wax seal presses onto your envelope (your average in it), the
 * other side's envelope waits beside it, and the clock says when both open at the latest.
 */
const DealRatingSealedComponent: React.FC<DealRatingSealedProps> = ({
  name,
  seal,
  dueAt,
  now,
  onDone,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ radii, spacing }): Record<'timer', ViewStyle> => ({
      timer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        borderRadius: radii.lg,
        backgroundColor: colors.surface.main,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
      },
    }),
    [colors.surface.main],
  );
  const hours = ratingHoursLeft(dueAt, now);
  return (
    <Animated.View entering={FadeIn.duration(motion.duration.base)}>
      <Box align="center" gap="xs">
        <Text
          variant="h3"
          color={colors.text.primary}
          align="center"
          accessibilityRole="header"
        >
          {t('marketplace.deals.rating.sealed.title')}
        </Text>
        <Text variant="body" color={colors.text.secondary} align="center">
          {seal.theirsAnswered
            ? t('marketplace.deals.rating.sealed.bodyBoth')
            : t('marketplace.deals.rating.sealed.body', { name })}
        </Text>
      </Box>
      <Box row gap="md" mt="xl">
        <DealRatingEnvelope
          state="sealed"
          height={ENVELOPE_HEIGHT}
          title={t('marketplace.deals.rating.envelope.mine')}
          caption={t('marketplace.deals.rating.envelope.sealed')}
          seal={<DealRatingWax size={WAX} value={seal.overall} stamp />}
        />
        <DealRatingEnvelope
          state={seal.theirsAnswered ? 'sealed' : 'waiting'}
          height={ENVELOPE_HEIGHT}
          title={t('marketplace.deals.rating.envelope.theirs', { name })}
          caption={
            seal.theirsAnswered
              ? t('marketplace.deals.rating.envelope.arrived')
              : t('marketplace.deals.rating.envelope.waiting')
          }
        />
      </Box>
      {!seal.theirsAnswered && hours !== null ? (
        <Box style={styles.timer} mt="md">
          <DealRatingClock dueAt={dueAt} now={now} size="sm" />
          <Box flex={1}>
            <Text variant="buttonSmall" color={colors.text.primary}>
              {t('marketplace.deals.rating.sealed.timer', {
                duration: formatDuration(t, hours),
              })}
            </Text>
            <Text variant="caption" color={colors.text.secondary}>
              {t('marketplace.deals.rating.sealed.timerBody')}
            </Text>
          </Box>
        </Box>
      ) : null}
      <Box mt="xl">
        <CustomButton
          title={t('marketplace.deals.rating.sealed.done')}
          onPress={onDone}
          fullWidth
        />
      </Box>
    </Animated.View>
  );
};

export const DealRatingSealed = memo(DealRatingSealedComponent);
