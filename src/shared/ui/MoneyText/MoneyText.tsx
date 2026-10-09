import React, { memo, useMemo } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatMoneyParts } from '@/core/i18n';
import type { MoneyCurrencyDisplay, MoneyNotation, MoneyPrecision } from '@/core/i18n';
import type { Money, MoneyRounding } from '@/core/money';
import { useStyles, useTheme } from '@/core/theme';
import type { TypographyVariant } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { AnimatedNumber } from '../AnimatedNumber';

export type MoneyTextSize = 'sm' | 'md' | 'title' | 'lg' | 'hero' | 'display';
/**
 * `money` only for money flow (balance, earning, payout, rule 08); `default` for prices, totals and debits;
 * `onBrand` on the navy hero.
 */
export type MoneyTextTone = 'default' | 'money' | 'muted' | 'onBrand';

export interface MoneyTextProps {
  value: Money;
  /**
   * `sm` 14 · `md` 16 · `title` 22 (card totals, pinned header balance) · `lg` 32 · `hero` 44 ·
   * `display` 58 (wallet balance), all tabular. Default `md`.
   */
  size?: MoneyTextSize;
  tone?: MoneyTextTone;
  /** `+$50.00` / `-$50.00` (ledger lines). */
  showSign?: boolean;
  /** Client-side preview, not a server figure (rule 06): `≈` + "estimate". */
  estimate?: boolean;
  /** `compact` (1.2K) only in stat tiles, chips and KPI strips (rule 09 §2.1). */
  notation?: MoneyNotation;
  precision?: MoneyPrecision;
  /** Balances use `down`: never show more than the user has. */
  rounding?: MoneyRounding;
  currencyDisplay?: MoneyCurrencyDisplay;
  /** Renders the fraction (`.40`) a step smaller: hero balances. */
  splitFraction?: boolean;
  /** Balance privacy toggle: a mask, announced as "Amount hidden". */
  hidden?: boolean;
  /** Cancelled / rejected ledger lines. */
  strikethrough?: boolean;
  /**
   * Digits roll up once on first show (balances, rule 09 §3.1); later values snap.
   * Laid out left to right; not combined with `estimate` or `strikethrough`.
   */
  animated?: boolean;
  align?: TextStyle['textAlign'];
}

const SIZE_VARIANT: Record<MoneyTextSize, TypographyVariant> = {
  sm: 'amountSmall',
  md: 'amount',
  title: 'amountTitle',
  lg: 'amountLarge',
  hero: 'amountHero',
  display: 'amountDisplay',
};

const FRACTION_VARIANT: Record<MoneyTextSize, TypographyVariant> = {
  sm: 'caption',
  md: 'bodySmall',
  title: 'title',
  lg: 'title',
  hero: 'h3',
  display: 'h2',
};

/** With `splitFraction`, the currency after the amount; only the display size shrinks it. */
const TAIL_VARIANT: Record<MoneyTextSize, TypographyVariant> = {
  ...SIZE_VARIANT,
  display: 'h2',
};

const HIDDEN_MASK = '••••••';

/** The one way to render an amount: formatted from minor units, tabular digits. */
const MoneyTextComponent: React.FC<MoneyTextProps> = ({
  value,
  size = 'md',
  tone = 'default',
  showSign = false,
  estimate = false,
  notation,
  precision,
  rounding,
  currencyDisplay,
  splitFraction = false,
  hidden = false,
  strikethrough = false,
  animated = false,
  align,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    (): { ltrRow: ViewStyle } => ({
      // Amount, fraction and currency keep their reading order in Arabic too.
      ltrRow: { flexDirection: 'row', direction: 'ltr', alignItems: 'flex-end' },
    }),
  );
  const { amount, currency } = value;

  const parts = useMemo(
    () =>
      formatMoneyParts({ amount, currency }, i18n.language, {
        signDisplay: showSign ? 'exceptZero' : 'auto',
        notation,
        precision,
        rounding,
        currencyDisplay,
      }),
    [amount, currency, i18n.language, showSign, notation, precision, rounding, currencyDisplay],
  );

  const color = {
    default: colors.text.primary,
    money: colors.money.text,
    muted: colors.text.secondary,
    onBrand: colors.text.onBrand,
  }[tone];
  const subtleColor = tone === 'onBrand' ? colors.text.onBrandMuted : colors.text.tertiary;

  const head = estimate ? t('common.money.approx', { amount: parts.head }) : parts.head;
  const fullText = `${head}${parts.fraction}${parts.tail}`;
  const showFraction = splitFraction && parts.fraction !== '';
  const fractionColor = tone === 'onBrand' ? subtleColor : color;

  if (animated && !hidden && !estimate && !strikethrough) {
    return (
      <Box style={styles.ltrRow} accessible accessibilityRole="text" accessibilityLabel={fullText}>
        <AnimatedNumber
          value={showFraction ? head : fullText}
          variant={SIZE_VARIANT[size]}
          color={color}
        />
        {showFraction ? (
          <Text variant={FRACTION_VARIANT[size]} color={fractionColor}>
            {parts.fraction}
          </Text>
        ) : null}
        {showFraction && parts.tail ? (
          <Text variant={TAIL_VARIANT[size]} color={color}>
            {parts.tail}
          </Text>
        ) : null}
      </Box>
    );
  }

  const text = (
    <Text
      variant={SIZE_VARIANT[size]}
      color={color}
      align={align}
      decoration={strikethrough ? 'line-through' : undefined}
      accessibilityLabel={hidden ? t('common.money.hidden') : undefined}
    >
      {hidden ? HIDDEN_MASK : showFraction ? head : fullText}
      {!hidden && showFraction ? (
        <Text variant={FRACTION_VARIANT[size]} color={fractionColor}>
          {parts.fraction}
        </Text>
      ) : null}
      {!hidden && showFraction && parts.tail ? (
        <Text variant={TAIL_VARIANT[size]} color={color}>
          {parts.tail}
        </Text>
      ) : null}
    </Text>
  );

  if (!estimate || hidden) return text;

  return (
    <Box
      row
      align="baseline"
      gap="xs"
      accessible
      accessibilityLabel={`${fullText} ${t('common.money.estimate')}`}
    >
      {text}
      <Text variant="caption" color={subtleColor}>
        {t('common.money.estimate')}
      </Text>
    </Box>
  );
};

export const MoneyText = memo(MoneyTextComponent);
