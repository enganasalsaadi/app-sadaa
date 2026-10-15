import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Snowflake, Zap, type LucideIcon } from 'lucide-react-native';
import { useCountdown } from '@/core/hooks';
import { formatMoney } from '@/core/i18n';
import type { Money } from '@/core/money';
import {
  moderateScale,
  motion,
  useStyles,
  useTheme,
  type HueTone,
  resolveHue,
} from '@/core/theme';
import { Box, MoneyText, Text } from '@/shared/ui';
import { DEFAULT_DEAL_WINDOWS } from '../constants/dealOffer';
import type { DealFunding } from '../types';
import type { DealFundingState } from '../utils/dealRespond';
import { formatClock } from '../utils/dealTimer';
import { DealStripes } from './DealStripes';

const VESSEL = moderateScale(16);
const DIAL = moderateScale(46);
const DIAL_STROKE = 5;
const DIAL_R = (DIAL - DIAL_STROKE) / 2;
const DIAL_LENGTH = 2 * Math.PI * DIAL_R;
const SECONDS_PER_HOUR = 3600;

export interface DealFundingCardProps {
  funding: DealFunding | null;
  state: DealFundingState;
  total: Money;
  dueAt: number | null;
  canTopUp: boolean;
}

/** The payment window as a draining dial beside the clock. */
const PaymentClock = memo<{ dueAt: number | null }>(({ dueAt }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const seconds = useCountdown(dueAt);
  if (dueAt === null || seconds <= 0) return null;
  const left = Math.min(
    1,
    seconds / (DEFAULT_DEAL_WINDOWS.paymentTopUpHours * SECONDS_PER_HOUR),
  );
  return (
    <Box row align="center" gap="md" accessible>
      <Svg width={DIAL} height={DIAL}>
        <Circle
          cx={DIAL / 2}
          cy={DIAL / 2}
          r={DIAL_R}
          stroke={colors.surface.elevated}
          strokeWidth={DIAL_STROKE}
          fill="none"
        />
        <Circle
          cx={DIAL / 2}
          cy={DIAL / 2}
          r={DIAL_R}
          stroke={colors.status.warning.main}
          strokeWidth={DIAL_STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={DIAL_LENGTH}
          strokeDashoffset={DIAL_LENGTH * (1 - left)}
          transform={`rotate(-90 ${DIAL / 2} ${DIAL / 2})`}
        />
      </Svg>
      <Box flex={1}>
        <Text variant="title" color={colors.text.primary}>
          {formatClock(seconds)}
        </Text>
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.deals.respond.funding.clock')}
        </Text>
      </Box>
    </Box>
  );
});

/** Covered (mint, pours in once) against what's missing (amber stripes). Drawing only: the numbers are the server's. */
const Vessel = memo<{ covered: number }>(({ covered }) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const fill = useSharedValue(reduceMotion ? covered : 0);
  useEffect(() => {
    fill.value = reduceMotion
      ? covered
      : withTiming(covered, {
          duration: motion.duration.draw,
          easing: Easing.out(Easing.cubic),
        });
  }, [covered, fill, reduceMotion]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));
  const styles = useStyles(
    ({ radii }): Record<'vessel' | 'fill', ViewStyle> => ({
      vessel: {
        height: VESSEL,
        borderRadius: radii.full,
        overflow: 'hidden',
        backgroundColor: colors.status.warning.soft,
      },
      fill: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        start: 0,
        borderRadius: radii.full,
        backgroundColor: colors.money.main,
      },
    }),
    [colors.money.main, colors.status.warning.soft],
  );
  return (
    <Box style={styles.vessel} pointerEvents="none">
      <DealStripes color={colors.status.warning.main} stripe={4} />
      <Animated.View style={[styles.fill, fillStyle]} />
    </Box>
  );
});

const Note = memo<{ icon: LucideIcon; tone: HueTone; text: string }>(
  ({ icon: Icon, tone, text }) => {
    const { colors, sizes } = useTheme();
    const hue = resolveHue(colors, tone);
    return (
      <Box row align="center" gap="sm" p="md" borderRadius="md" bg={hue.soft}>
        <Icon size={sizes.icon.sm} color={hue.main} />
        <Box flex={1}>
          <Text variant="bodySmall" color={colors.text.primary}>
            {text}
          </Text>
        </Box>
      </Box>
    );
  },
);

/**
 * «The vessel» (approved 2026-10-15): the brand's unfunded deal. What the wallet still lacks is
 * the headline, the vessel shows covered against missing, the dial drains the 24-hour window.
 * A frozen wallet says so plainly (support in the bar below); top-ups fund the deal on their own.
 */
const DealFundingCardComponent: React.FC<DealFundingCardProps> = ({
  funding,
  state,
  total,
  dueAt,
  canTopUp,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const missing = funding?.missing ?? null;
  const covered =
    missing && total.amount > 0
      ? Math.min(1, Math.max(0, (total.amount - missing.amount) / total.amount))
      : 1;

  const styles = useStyles(
    ({ radii, spacing, shadows, borderWidths }): Record<'card', ViewStyle> => ({
      card: {
        padding: spacing.xl,
        gap: spacing.lg,
        borderRadius: radii.lg,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.lg,
      },
    }),
    [colors.border.card, colors.surface.main],
  );

  const headline =
    state === 'frozen'
      ? t('marketplace.deals.respond.funding.frozenTitle')
      : state === 'short'
      ? t('marketplace.deals.respond.funding.short')
      : t('marketplace.deals.respond.funding.ready');

  return (
    <Box style={styles.card}>
      <Box gap="xs">
        <Text
          variant="bodySmall"
          color={
            state === 'ready'
              ? colors.text.secondary
              : colors.status.warning.text
          }
        >
          {headline}
        </Text>
        <MoneyText
          value={state === 'short' && missing ? missing : total}
          size="hero"
        />
        {state === 'short' ? (
          <Text variant="caption" color={colors.text.tertiary}>
            {t('marketplace.deals.respond.funding.of', {
              amount: formatMoney(total, i18n.language),
            })}
          </Text>
        ) : null}
      </Box>
      {state === 'short' ? (
        <Box gap="xs">
          <Vessel covered={covered} />
          <Box row justify="space-between">
            <Text variant="caption" color={colors.money.text}>
              {t('marketplace.deals.respond.funding.covered')}
            </Text>
            <Text variant="caption" color={colors.status.warning.text}>
              {t('marketplace.deals.respond.funding.missing')}
            </Text>
          </Box>
        </Box>
      ) : null}
      <PaymentClock dueAt={dueAt} />
      {state === 'frozen' ? (
        <Note
          icon={Snowflake}
          tone="danger"
          text={t('marketplace.deals.respond.funding.frozen')}
        />
      ) : state === 'short' ? (
        <Note
          icon={Zap}
          tone={canTopUp ? 'money' : 'neutral'}
          text={
            canTopUp
              ? t('marketplace.deals.respond.funding.auto')
              : t('marketplace.deals.respond.funding.topUpLocked')
          }
        />
      ) : (
        <Note
          icon={Zap}
          tone="info"
          text={t('marketplace.deals.respond.funding.readyBody')}
        />
      )}
    </Box>
  );
};

export const DealFundingCard = memo(DealFundingCardComponent);
