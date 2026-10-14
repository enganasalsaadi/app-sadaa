import React, { memo, useCallback } from 'react';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Text as SvgText } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Check, Clock, Hourglass } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { FONT_FAMILY, moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { GuideActor } from '../hooks/useDealGuideCopy';
import type { GuideChapterView } from '../hooks/useDealGuideScreen';

const MARK = moderateScale(48);
const NUMBER_SIZE = moderateScale(78);
const NUMBER_BOX = moderateScale(110);
const RISE = 26;
/** A chapter shows once its top passes this share of the viewport. */
const REVEAL_LINE = 0.92;

interface GuideChapterProps {
  chapter: GuideChapterView;
  index: number;
  who: Record<GuideActor, string>;
  scrollY: SharedValue<number>;
  viewport: SharedValue<number>;
  onLayout: (index: number, event: LayoutChangeEvent) => void;
}

/**
 * One station as a chapter: a big outlined number, who acts (color per actor), how long, what
 * happens, key points, and what if it doesn't happen on time. Rises in once scrolled to.
 */
const GuideChapterComponent: React.FC<GuideChapterProps> = ({ chapter, index, who, scrollY, viewport, onLayout }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const top = useSharedValue(-1);
  const seen = useSharedValue(reduceMotion ? 1 : 0);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      top.value = event.nativeEvent.layout.y;
      onLayout(index, event);
    },
    [index, onLayout, top],
  );

  const revealStyle = useAnimatedStyle(() => {
    if (seen.value === 0 && top.value >= 0 && viewport.value > 0 && top.value < scrollY.value + viewport.value * REVEAL_LINE) {
      seen.value = withTiming(1, { duration: motion.duration.rise });
    }
    return { opacity: seen.value, transform: [{ translateY: (1 - seen.value) * RISE }] };
  });

  const actorDot = chapter.actor === 'you' ? colors.interactive.main : chapter.actor === 'sada' ? colors.money.main : colors.brand.main;
  const styles = useStyles(
    ({ radii, spacing, shadows }): Record<'card' | 'mark' | 'number' | 'chip' | 'optional' | 'late' | 'dot', ViewStyle> => ({
      card: { borderRadius: radii.xl, backgroundColor: colors.surface.main, padding: spacing.lg, gap: spacing.md, overflow: 'hidden', ...shadows.card },
      mark: {
        width: MARK,
        height: MARK,
        borderRadius: radii.lg,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: chapter.actor === 'you' ? colors.interactive.soft : colors.money.soft,
      },
      number: { position: 'absolute', top: -spacing.xs, end: spacing.md },
      chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radii.full,
        backgroundColor: colors.surface.elevated,
      },
      optional: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radii.full,
        backgroundColor: colors.premium.soft,
      },
      late: {
        flexDirection: 'row',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radii.lg,
        backgroundColor: colors.status.warning.soft,
      },
      dot: { width: spacing.sm, height: spacing.sm, borderRadius: radii.full, backgroundColor: actorDot },
    }),
    [actorDot, chapter.actor, colors],
  );

  const Icon = chapter.icon;
  const iconColor =
    chapter.actor === 'you' ? colors.interactive.text : chapter.actor === 'sada' ? colors.money.text : colors.text.onBrand;
  const number = formatNumber(index + 1, { minimumIntegerDigits: 2 });

  return (
    <Animated.View style={revealStyle} onLayout={handleLayout}>
      <Box style={styles.card}>
        <Box style={styles.number} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Svg width={NUMBER_BOX} height={NUMBER_SIZE}>
            <SvgText
              x={NUMBER_BOX}
              y={NUMBER_SIZE * 0.82}
              textAnchor="end"
              fontSize={NUMBER_SIZE}
              fontFamily={FONT_FAMILY.extraBold}
              fill="none"
              stroke={colors.border.strong}
              strokeWidth={1.5}
            >
              {number}
            </SvgText>
          </Svg>
        </Box>
        <Box row align="center" gap="md">
          <Box style={styles.mark}>
            {chapter.actor === 'other' ? (
              <LinearGradient colors={colors.gradients.hero} style={styles.mark}>
                <Icon size={sizes.icon.md} color={iconColor} />
              </LinearGradient>
            ) : (
              <Icon size={sizes.icon.md} color={iconColor} />
            )}
          </Box>
          <Box flex={1} gap="xs">
            <Box row align="center" gap="xs">
              <Box style={styles.dot} />
              <Text variant="overline" color={colors.text.tertiary}>
                {who[chapter.actor]}
              </Text>
            </Box>
            <Text variant="title" color={colors.text.primary} accessibilityRole="header">
              {chapter.title}
            </Text>
          </Box>
        </Box>
        <Box row wrap gap="xs">
          <Box style={styles.chip}>
            <Clock size={sizes.icon.xs} color={colors.text.secondary} />
            <Text variant="label" color={colors.text.secondary}>
              {chapter.time}
            </Text>
          </Box>
          {chapter.optional ? (
            <Box style={styles.optional}>
              <Text variant="label" color={colors.premium.text}>
                {t('marketplace.guide.optional')}
              </Text>
            </Box>
          ) : null}
        </Box>
        <Text variant="body" color={colors.text.secondary}>
          {chapter.body}
        </Text>
        {chapter.points.length > 0 ? (
          <Box gap="sm">
            {chapter.points.map(point => (
              <Box key={point} row gap="sm">
                <Check size={sizes.icon.sm} color={colors.status.success.text} />
                <Box flex={1}>
                  <Text variant="bodySmall" color={colors.text.primary}>
                    {point}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>
        ) : null}
        {chapter.ifLate ? (
          <Box style={styles.late}>
            <Hourglass size={sizes.icon.sm} color={colors.status.warning.main} />
            <Box flex={1}>
              <Text variant="bodySmall" color={colors.status.warning.text}>
                {chapter.ifLate}
              </Text>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Animated.View>
  );
};

export const GuideChapter = memo(GuideChapterComponent);
