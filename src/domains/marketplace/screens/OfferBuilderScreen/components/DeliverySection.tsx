import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useAnimatedStyle, useReducedMotion } from 'react-native-reanimated';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CalendarClock, Lightbulb, Zap } from 'lucide-react-native';
import { toastService } from '@/core/toast';
import { motion, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text, useLayoutInView, useLoopClock } from '@/shared/ui';
import { formatDuration, quotePaceHours } from '../../../utils/offerDuration';
import { useOfferBuilder } from '../OfferBuilderContext';

/** Ready deadlines, in days from the start of work; shown only when longer than the fastest. */
const PRESET_DAYS = { twoWeeks: 14, month: 30 } as const;

interface PaceChipProps {
  label: string;
  on: boolean;
  onPress: () => void;
}

const PaceChip = memo<PaceChipProps>(({ label, on, onPress }) => {
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ borderWidths, radii, spacing }): Record<'chip', ViewStyle> => ({
      chip: {
        minHeight: sizes.button.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.full,
        justifyContent: 'center',
        borderWidth: borderWidths.md,
        borderColor: on ? colors.button.primary.bg : colors.border.default,
        backgroundColor: on ? colors.button.primary.bg : colors.surface.main,
      },
    }),
    [colors, on, sizes.button.md],
  );
  return (
    <Pressable style={styles.chip} onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={label}>
      <Text variant={on ? 'buttonSmall' : 'bodySmall'} color={on ? colors.button.primary.text : colors.text.primary}>
        {label}
      </Text>
    </Pressable>
  );
});

/** The rush offer, wrapped in a slowly turning teal → mustard edge: a suggestion, not a warning. */
const RushOffer = memo<{ fast: string; normal: string; onPress: () => void }>(({ fast, normal, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const { ref, onLayout, visible } = useLayoutInView({ track: true });
  const clock = useLoopClock(motion.loop.sheen, visible && !reduceMotion);
  const styles = useStyles(
    ({ borderWidths, radii, spacing, shadows }): Record<'edge' | 'spin' | 'inner' | 'mark', ViewStyle> => ({
      edge: { borderRadius: radii.lg, padding: borderWidths.sm, overflow: 'hidden', ...shadows.card },
      spin: { position: 'absolute', top: '-75%', bottom: '-75%', start: '-25%', end: '-25%' },
      inner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radii.lg - borderWidths.sm,
        backgroundColor: colors.surface.main,
      },
      mark: {
        width: sizes.icon.xl,
        height: sizes.icon.xl,
        borderRadius: radii.sm,
        backgroundColor: colors.premium.soft,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
    [colors.premium.soft, colors.surface.main, sizes.icon.xl],
  );
  const turn = useAnimatedStyle(() => ({ transform: [{ rotate: `${clock.value * 360}deg` }] }));
  return (
    <Animated.View ref={ref} onLayout={onLayout}>
    <Pressable style={styles.edge} onPress={onPress} accessibilityRole="button" accessibilityLabel={t('marketplace.offer.delivery.rushTitle')}>
      <Animated.View style={[styles.spin, turn]} pointerEvents="none">
        <LinearGradient
          colors={[colors.interactive.main, colors.premium.main, colors.interactive.soft]}
          style={styles.spin}
        />
      </Animated.View>
      <Box style={styles.inner}>
        <Box style={styles.mark}>
          <Zap size={sizes.icon.sm} color={colors.premium.text} />
        </Box>
        <Box flex={1}>
          <Text variant="bodyMedium" color={colors.text.primary}>
            {t('marketplace.offer.delivery.rushTitle')}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.offer.delivery.rushBody', { fast, normal })}
          </Text>
        </Box>
      </Box>
    </Pressable>
    </Animated.View>
  );
});

/**
 * «When do you need it?»: the pace as one big duration (never a date), the creator's fastest by
 * default, ready longer deadlines and «other…» (a sheet), and rush delivery when every picked
 * card offers it.
 */
const DeliverySectionComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { form, quote, lines, setRequestedDays, openDeliverySheet } = useOfferBuilder();
  const requested = useWatch({ control: form.control, name: 'requestedDeliveryDays' });
  const { rushPlan, rushOn, setRush } = lines;

  const turnRushOn = useCallback(() => {
    if (!rushPlan) return;
    setRush(true);
    toastService.success(t('marketplace.offer.delivery.rushToast', { fast: formatDuration(t, rushPlan.hours) }));
  }, [rushPlan, setRush, t]);

  if (!quote) {
    return (
      <Box gap="xs">
        <Text variant="h4" color={colors.text.primary}>
          {t('marketplace.offer.delivery.title')}
        </Text>
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('marketplace.offer.delivery.emptyBody')}
        </Text>
      </Box>
    );
  }

  const minDays = quote.minDeliveryDays;
  const presets = (Object.keys(PRESET_DAYS) as (keyof typeof PRESET_DAYS)[]).filter(key => PRESET_DAYS[key] > minDays);
  const isPreset = presets.some(key => PRESET_DAYS[key] === requested);
  const caption = rushOn
    ? t('marketplace.offer.delivery.rushed')
    : requested !== null
      ? t('marketplace.offer.delivery.requested')
      : t('marketplace.offer.delivery.fastest');

  return (
    <Box gap="md">
      <Box>
        <Text variant="h4" color={colors.text.primary}>
          {t('marketplace.offer.delivery.title')}
        </Text>
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('marketplace.offer.delivery.body')}
        </Text>
      </Box>
      <Box p="lg" gap="md" borderRadius="xl" bg={colors.surface.main} shadow="card">
        <Box row align="center" wrap gap="sm" accessibilityLiveRegion="polite">
          <CalendarClock size={sizes.icon.md} color={colors.interactive.main} />
          <Text variant="h2" color={colors.text.primary}>
            {formatDuration(t, quotePaceHours(quote))}
          </Text>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {caption}
          </Text>
        </Box>
        {rushOn ? (
          <Box row align="center" justify="space-between" gap="sm" ps="md" borderRadius="md" bg={colors.premium.soft}>
            <Box row align="center" gap="xs" flex={1}>
              <Zap size={sizes.icon.xs} color={colors.premium.text} />
              <Text variant="bodySmall" color={colors.premium.text}>
                {t('marketplace.offer.delivery.rushOn')}
              </Text>
            </Box>
            <Pressable
              minHeight={sizes.button.md}
              px="md"
              justify="center"
              onPress={() => setRush(false)}
              accessibilityRole="button"
              accessibilityLabel={t('marketplace.offer.delivery.rushOff')}
            >
              <Text variant="bodySmall" color={colors.premium.text} decoration="underline">
                {t('marketplace.offer.delivery.rushOff')}
              </Text>
            </Pressable>
          </Box>
        ) : (
          <Box row wrap gap="sm" accessibilityRole="radiogroup">
            <PaceChip label={t('marketplace.offer.delivery.asap')} on={requested === null} onPress={() => setRequestedDays(null)} />
            {presets.map(key => (
              <PaceChip
                key={key}
                label={t(key === 'twoWeeks' ? 'marketplace.offer.delivery.twoWeeks' : 'marketplace.offer.delivery.month')}
                on={requested === PRESET_DAYS[key]}
                onPress={() => setRequestedDays(PRESET_DAYS[key])}
              />
            ))}
            <PaceChip
              label={requested !== null && !isPreset ? formatDuration(t, requested * 24) : t('marketplace.offer.delivery.other')}
              on={requested !== null && !isPreset}
              onPress={openDeliverySheet}
            />
          </Box>
        )}
        {!rushOn && requested === null ? (
          <Box row align="center" gap="xs">
            <Lightbulb size={sizes.icon.xs} color={colors.text.tertiary} />
            <Box flex={1}>
              <Text variant="caption" color={colors.text.tertiary}>
                {t('marketplace.offer.delivery.tip')}
              </Text>
            </Box>
          </Box>
        ) : null}
      </Box>
      {rushPlan && !rushOn && requested === null ? (
        <RushOffer
          fast={formatDuration(t, rushPlan.hours)}
          normal={formatDuration(t, minDays * 24)}
          onPress={turnRushOn}
        />
      ) : null}
    </Box>
  );
};

export const DeliverySection = memo(DeliverySectionComponent);
