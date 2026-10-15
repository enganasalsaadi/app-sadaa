import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Quote } from 'lucide-react-native';
import { formatDate, formatNumber } from '@/core/i18n';
import { motion, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, RatingStars, Text } from '@/shared/ui';
import type { DealRatingView } from '../utils/dealRating';
import { DealRatingBars } from './DealRatingBars';

export interface DealRatingRevealProps {
  name: string;
  view: DealRatingView;
  mineOpen: boolean;
  onToggleMine: () => void;
}

const formatScore = (value: number) =>
  formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/**
 * Both envelopes open: what the other side said about you comes first and big (the average, the
 * three bars filling, their note), then your own rating of them as one folded row.
 */
const DealRatingRevealComponent: React.FC<DealRatingRevealProps> = ({
  name,
  view,
  mineOpen,
  onToggleMine,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, shadows }): Record<
      'card' | 'quote' | 'mine' | 'open',
      ViewStyle
    > => ({
      card: {
        borderRadius: radii.xl,
        backgroundColor: colors.surface.main,
        padding: spacing.lg,
        gap: spacing.lg,
        ...shadows.lg,
      },
      quote: {
        flexDirection: 'row',
        gap: spacing.sm,
        borderRadius: radii.md,
        backgroundColor: colors.layout.base,
        padding: spacing.md,
      },
      mine: {
        borderRadius: radii.lg,
        backgroundColor: colors.surface.main,
        paddingHorizontal: spacing.lg,
        ...shadows.card,
      },
      open: { transform: [{ rotate: '180deg' }] },
    }),
    [colors.layout.base, colors.surface.main],
  );

  const about = view.theirs.revealed;
  const mine = view.mine.revealed;
  const aboutScore =
    about && !about.skipped && about.overall !== null ? about.overall : null;
  const mineScore =
    mine && !mine.skipped && mine.overall !== null ? mine.overall : null;
  const mineLabel =
    mineScore !== null
      ? formatScore(mineScore)
      : mine?.skipped
        ? t('marketplace.deals.rating.reveal.mineSkipped')
        : t('marketplace.deals.rating.reveal.mineNone');

  return (
    <Box gap="md">
      <Text variant="overline" color={colors.text.tertiary}>
        {t('marketplace.deals.rating.reveal.aboutYou', { name })}
      </Text>
      <Animated.View
        style={styles.card}
        entering={FadeInUp.springify()
          .damping(motion.spring.damping)
          .stiffness(motion.spring.stiffness)}
      >
        {about && aboutScore !== null ? (
          <>
            <Box row align="center" gap="md">
              <Text
                variant="h1"
                color={colors.text.primary}
                accessibilityLabel={t(
                  'marketplace.deals.rating.reveal.overallA11y',
                  { value: formatScore(aboutScore) },
                )}
              >
                {formatScore(aboutScore)}
              </Text>
              <Box gap="xs">
                <RatingStars value={aboutScore} showValue={false} />
                {view.revealedAt !== null ? (
                  <Text variant="caption" color={colors.text.tertiary}>
                    {t('marketplace.deals.rating.reveal.revealedOn', {
                      date: formatDate(view.revealedAt, {
                        day: 'numeric',
                        month: 'long',
                      }),
                    })}
                  </Text>
                ) : null}
              </Box>
            </Box>
            <DealRatingBars criteria={view.theirCriteria} scores={about.scores} />
            {about.comment ? (
              <Box style={styles.quote}>
                <Quote size={sizes.icon.sm} color={colors.interactive.main} />
                <Box flex={1}>
                  <Text variant="body" color={colors.text.primary}>
                    {about.comment}
                  </Text>
                </Box>
              </Box>
            ) : null}
          </>
        ) : (
          <Text variant="bodyMedium" color={colors.text.secondary}>
            {about?.skipped
              ? t('marketplace.deals.rating.reveal.skipped', { name })
              : t('marketplace.deals.rating.reveal.none', { name })}
          </Text>
        )}
      </Animated.View>
      <Box style={styles.mine}>
        <Pressable
          row
          align="center"
          gap="sm"
          py="lg"
          onPress={mineScore !== null ? onToggleMine : undefined}
          disabled={mineScore === null}
          accessibilityRole="button"
          accessibilityState={{ expanded: mineOpen, disabled: mineScore === null }}
        >
          <Box flex={1}>
            <Text variant="bodyMedium" color={colors.text.secondary}>
              {t('marketplace.deals.rating.reveal.mine', { name })}
            </Text>
          </Box>
          <Text variant="buttonSmall" color={colors.text.primary}>
            {mineLabel}
          </Text>
          {mineScore !== null ? (
            <Box style={mineOpen ? styles.open : undefined}>
              <ChevronDown size={sizes.icon.sm} color={colors.icon.secondary} />
            </Box>
          ) : null}
        </Pressable>
        {mine && mineOpen ? (
          <Box pb="lg" gap="md">
            <DealRatingBars criteria={view.criteria} scores={mine.scores} />
            {mine.comment ? (
              <Text variant="bodySmall" color={colors.text.secondary}>
                {mine.comment}
              </Text>
            ) : null}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export const DealRatingReveal = memo(DealRatingRevealComponent);
