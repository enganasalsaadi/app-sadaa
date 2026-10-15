import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { ShieldCheck } from 'lucide-react-native';
import type { Money } from '@/core/money';
import { formatNumber } from '@/core/i18n';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, MoneyText, Text } from '@/shared/ui';

const NOTCH = moderateScale(20);
const BULLET = moderateScale(24);

export interface DealCommitLine {
  key: string;
  title: string;
  detail?: string;
}

export interface DealCommitSlipProps {
  amount: Money;
  /** Trust badge beside the amount («محجوز لدى صدى قبل أن تبدأ»). */
  badge: string;
  caption: string;
  lines: readonly DealCommitLine[];
  /** The surface the slip sits on: the notches are cut in this color. */
  notchColor: string;
}

/**
 * The slip being signed: the server's amount with an escrow badge, a perforation with a notch on
 * each side, then each commitment numbered and ticking in one after another.
 */
const DealCommitSlipComponent: React.FC<DealCommitSlipProps> = ({
  amount,
  badge,
  caption,
  lines,
  notchColor,
}) => {
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({
      radii,
      spacing,
      shadows,
      borderWidths,
    }): Record<
      'slip' | 'badge' | 'perforation' | 'dash' | 'notch' | 'bullet',
      ViewStyle
    > => ({
      slip: {
        borderRadius: radii.lg,
        padding: spacing.lg,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.card,
      },
      badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radii.full,
        backgroundColor: colors.money.soft,
        flexShrink: 1,
      },
      perforation: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
        marginHorizontal: -(spacing.lg + NOTCH / 2),
      },
      dash: {
        flex: 1,
        marginHorizontal: spacing.sm,
        borderTopWidth: borderWidths.md,
        borderStyle: 'dashed',
        borderColor: colors.border.default,
      },
      notch: {
        width: NOTCH,
        height: NOTCH,
        borderRadius: radii.full,
        backgroundColor: notchColor,
      },
      bullet: {
        width: BULLET,
        height: BULLET,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.interactive.soft,
      },
    }),
    [
      colors.border.card,
      colors.border.default,
      colors.interactive.soft,
      colors.money.soft,
      colors.surface.main,
      notchColor,
    ],
  );

  return (
    <Box style={styles.slip}>
      <Box row align="center" justify="space-between" gap="sm">
        <MoneyText value={amount} size="lg" />
        <Box style={styles.badge}>
          <ShieldCheck size={sizes.icon.xs} color={colors.money.main} />
          <Text variant="caption" color={colors.money.text} numberOfLines={1}>
            {badge}
          </Text>
        </Box>
      </Box>
      <Text variant="bodySmall" color={colors.text.tertiary}>
        {caption}
      </Text>
      <Box style={styles.perforation} pointerEvents="none">
        <Box style={styles.notch} />
        <Box style={styles.dash} />
        <Box style={styles.notch} />
      </Box>
      <Box gap="md">
        {lines.map((line, index) => (
          <Animated.View
            key={line.key}
            entering={FadeInRight.delay(index * motion.stagger * 2)}
          >
            <Box row gap="sm" align="flex-start">
              <Box style={styles.bullet}>
                <Text variant="buttonSmall" color={colors.interactive.text}>
                  {formatNumber(index + 1)}
                </Text>
              </Box>
              <Box flex={1}>
                <Text variant="bodyMedium" color={colors.text.primary}>
                  {line.title}
                </Text>
                {line.detail ? (
                  <Text variant="caption" color={colors.text.tertiary}>
                    {line.detail}
                  </Text>
                ) : null}
              </Box>
            </Box>
          </Animated.View>
        ))}
      </Box>
    </Box>
  );
};

export const DealCommitSlip = memo(DealCommitSlipComponent);
