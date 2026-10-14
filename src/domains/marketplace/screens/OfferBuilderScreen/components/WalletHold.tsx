import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Check, Wallet } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { motion, useStyles, useTheme } from '@/core/theme';
import { Box, MoneyText, Text } from '@/shared/ui';
import { formatDuration } from '../../../utils/offerDuration';
import { useOfferBuilder } from '../OfferBuilderContext';

/**
 * Nothing is charged now: the quote's total is held only once the creator accepts. The bar shows
 * how much of it the balance already covers; short is a heads-up (top up after sending), never a block.
 */
const WalletHoldComponent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const { quote } = useOfferBuilder();
  const wallet = quote?.wallet;
  const short = wallet ? !wallet.isSufficient : false;
  const hue = short ? colors.status.warning : colors.money;
  // Display share only (the server decides what is sufficient).
  const cover =
    quote && wallet && quote.total.amount > 0 ? Math.min(1, Math.max(0, wallet.balance.amount / quote.total.amount)) : 1;

  const fill = useSharedValue(reduceMotion ? cover : 0);
  useEffect(() => {
    fill.value = reduceMotion
      ? cover
      : withTiming(cover, { duration: motion.duration.draw, easing: Easing.out(Easing.cubic) });
  }, [cover, fill, reduceMotion]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  const styles = useStyles(
    ({ radii, spacing, shadows }): Record<'card' | 'mark' | 'track' | 'fill', ViewStyle> => ({
      card: { borderRadius: radii.xl, padding: spacing.lg, gap: spacing.md, backgroundColor: colors.surface.main, ...shadows.card },
      mark: {
        width: sizes.icon.xl,
        height: sizes.icon.xl,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: hue.soft,
      },
      track: { height: spacing.sm, borderRadius: radii.full, backgroundColor: colors.surface.elevated, overflow: 'hidden' },
      fill: { height: '100%', borderRadius: radii.full, backgroundColor: hue.main },
    }),
    [colors.surface.elevated, colors.surface.main, hue.main, hue.soft, sizes.icon.xl],
  );
  if (!quote || !wallet) return null;

  return (
    <Box style={styles.card}>
      <Box row gap="md">
        <Box style={styles.mark}>
          <Wallet size={sizes.icon.sm} color={hue.main} />
        </Box>
        <Box flex={1} gap="xs">
          <Text variant="bodyMedium" color={colors.text.primary}>
            {t('marketplace.offer.review.walletTitle')}
          </Text>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.offer.review.walletBody', { amount: formatMoney(quote.total, i18n.language) })}
          </Text>
        </Box>
      </Box>
      <Box style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </Box>
      <Box row align="center" justify="space-between" gap="sm">
        <Box row align="center" gap="xs">
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.offer.review.balance')}
          </Text>
          <MoneyText value={wallet.balance} size="sm" />
        </Box>
        {short ? (
          <Text variant="label" color={colors.status.warning.text}>
            {t('marketplace.offer.review.short', { amount: formatMoney(wallet.shortfall, i18n.language) })}
          </Text>
        ) : (
          <Box row align="center" gap="xs">
            <Check size={sizes.icon.xs} color={colors.status.success.main} />
            <Text variant="label" color={colors.status.success.text}>
              {t('marketplace.offer.review.enough')}
            </Text>
          </Box>
        )}
      </Box>
      {short ? (
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.offer.review.later', { duration: formatDuration(t, quote.windows.paymentTopUpHours) })}
        </Text>
      ) : null}
    </Box>
  );
};

export const WalletHold = memo(WalletHoldComponent);
