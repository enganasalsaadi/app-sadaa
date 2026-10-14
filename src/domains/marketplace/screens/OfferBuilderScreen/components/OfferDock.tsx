import React, { memo, useCallback } from 'react';
import { Vibration, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { DEFAULT_CURRENCY, HAPTIC_TAP_MS } from '@/core/config';
import type { Money } from '@/core/money';
import { opacity, useStyles, useTheme } from '@/core/theme';
import { Box, MoneyText, Pressable, Text } from '@/shared/ui';
import { countDeliverables } from '../../../utils/offerForm';
import { formatDuration, quotePaceHours } from '../../../utils/offerDuration';
import { useOfferBuilder } from '../OfferBuilderContext';

/** Shown before anything is picked: a dimmed zero, never a computed amount. */
const ZERO: Money = { amount: 0, currency: DEFAULT_CURRENCY };

/**
 * A floating navy bar over the steps: the server total (dimmed zero until a service is picked)
 * with what it covers, and the step's one action. Tapping the total opens the itemised receipt.
 * On the services step the action wakes up only once something is picked.
 */
const OfferDockComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const { quote, isPricing, offer, step, goNext, advancing, openReceipt } =
    useOfferBuilder();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const items = countDeliverables(offer.lines);
  const total = items > 0 ? quote?.total ?? null : null;
  const ready = step !== 'services' || items > 0;

  const styles = useStyles(
    ({
      borderWidths,
      radii,
      spacing,
      shadows,
    }): Record<'wrap' | 'bar' | 'go' | 'goAsleep' | 'asleep', ViewStyle> => {
      const go: ViewStyle = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        minHeight: sizes.button.lg,
        paddingHorizontal: spacing.xl,
        borderRadius: radii.md,
        backgroundColor: colors.button.onBrand.bg,
      };
      return {
        wrap: {
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.sm,
        },
        bar: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          padding: spacing.sm,
          paddingStart: spacing.lg,
          borderRadius: radii.lg,
          backgroundColor: colors.brand.main,
          borderWidth: borderWidths.thin,
          borderColor: colors.glass.border,
          ...shadows.lg,
        },
        go,
        goAsleep: { ...go, opacity: opacity.disabled },
        asleep: { opacity: opacity.disabled },
      };
    },
    [
      colors.brand.main,
      colors.button.onBrand.bg,
      colors.glass.border,
      sizes.button.lg,
    ],
  );

  const onGo = useCallback(() => {
    Vibration.vibrate(HAPTIC_TAP_MS);
    goNext();
  }, [goNext]);

  const summary =
    total && quote
      ? t('marketplace.offer.dock.summary', {
          items: t('marketplace.offer.units.deliverables', { count: items }),
          duration: formatDuration(t, quotePaceHours(quote)),
        })
      : items > 0
      ? t('marketplace.offer.dock.pricing')
      : t('marketplace.offer.dock.empty');
  const label =
    step === 'services'
      ? t('marketplace.offer.dock.next')
      : t('marketplace.offer.dock.review');

  return (
    <Box style={styles.wrap}>
      <Box style={styles.bar}>
        <Pressable
          flex={1}
          gap="xs"
          disabled={!total}
          onPress={openReceipt}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.offer.dock.details')}
        >
          <Box style={total ? undefined : styles.asleep} align="flex-start">
            <MoneyText
              value={total ?? ZERO}
              size="title"
              tone="onBrand"
              animated
            />
          </Box>
          <Text
            variant="caption"
            color={colors.text.onBrandMuted}
            numberOfLines={1}
          >
            {isPricing && total ? t('marketplace.offer.dock.pricing') : summary}
          </Text>
        </Pressable>
        <Pressable
          style={ready ? styles.go : styles.goAsleep}
          scaleOnPress={ready}
          onPress={onGo}
          disabled={!ready || advancing}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled: !ready, busy: advancing }}
        >
          <Text variant="button" color={colors.button.onBrand.text}>
            {label}
          </Text>
          <Chevron size={sizes.icon.sm} color={colors.button.onBrand.text} />
        </Pressable>
      </Box>
    </Box>
  );
};

export const OfferDock = memo(OfferDockComponent);
