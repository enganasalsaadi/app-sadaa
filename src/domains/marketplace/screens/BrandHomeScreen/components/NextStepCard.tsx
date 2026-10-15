import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clock, Pause } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, GradientSurface, Pressable, Text } from '@/shared/ui';
import { DealFace } from '../../../components/DealFace';
import {
  BRAND_DEAL_ACTION_CTA,
  NEXT_STEP_HOT_SECONDS,
  UNKNOWN_BRAND_DEAL_ACTION_CTA,
} from '../../../constants/brandHomeDeals';
import { useClock } from '../../../hooks/useClock';
import type { BrandActiveDeal } from '../../../types';
import { formatRemaining, timerSecondsLeft } from '../../../utils/dealTimer';

const FACE = moderateScale(48);
const ACTION_HEIGHT = moderateScale(54);
const DASH = moderateScale(14);
const DASH_ON = moderateScale(24);
const DASH_HEIGHT = moderateScale(4);
/** Dashes beyond this would crowd the corner; the «1 of 3» text still counts them all. */
const MAX_DASHES = 6;
const MINUTE = 60_000;

interface NextStepCardProps {
  deal: BrandActiveDeal;
  index: number;
  count: number;
  onOpen: (id: string) => void;
  /** `undefined` with a single deal: no arrow. */
  onNext?: () => void;
}

/** Time left on the action, amber under a day; `null` due = the server paused it. */
const DueChip = memo<{ dueAt: number | null }>(({ dueAt }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const now = useClock(MINUTE);
  const seconds = dueAt === null ? null : timerSecondsLeft(dueAt, now);
  const hot = seconds !== null && seconds < NEXT_STEP_HOT_SECONDS;
  const tint = hot ? colors.glass.iconWarning : colors.text.onBrandMuted;
  const Icon = seconds === null ? Pause : Clock;

  return (
    <Box
      row
      align="center"
      gap="xs"
      alignSelf="flex-start"
      px="md"
      py="xs"
      borderRadius="full"
      bg={hot ? colors.live.warnFill : colors.glass.fill}
    >
      <Icon size={sizes.icon.xs} color={tint} />
      <Text variant="buttonSmall" color={tint}>
        {seconds === null
          ? t('marketplace.brandHome.deals.next.paused')
          : t('marketplace.brandHome.deals.next.left', { time: formatRemaining(t, seconds) })}
      </Text>
    </Box>
  );
});

/**
 * The navy «your next step» card: who, what and for how much, the server's action in big type,
 * the time left, and one button that names the action and opens the deal there. The arrow
 * beside it throws the card for the next deal.
 */
const NextStepCardComponent: React.FC<NextStepCardProps> = ({ deal, index, count, onOpen, onNext }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const open = useCallback(() => onOpen(deal.id), [deal.id, onOpen]);
  const name = deal.creator.name ?? '';
  const action = deal.action?.label ?? deal.status.label;
  const ctaKey = deal.action?.key ? BRAND_DEAL_ACTION_CTA[deal.action.key] : UNKNOWN_BRAND_DEAL_ACTION_CTA;
  const amount = formatMoney(deal.total);

  const styles = useStyles(
    ({ radii }): Record<'arrow' | 'action' | 'nextButton', ViewStyle> => ({
      arrow: { transform: [{ scaleX: isRTL ? -1 : 1 }] },
      action: { height: ACTION_HEIGHT, borderRadius: radii.md },
      nextButton: { width: ACTION_HEIGHT, height: ACTION_HEIGHT, borderRadius: radii.md },
    }),
    [isRTL],
  );

  return (
    <GradientSurface variant="live" borderRadius="xl" p="lg">
      <Box row align="center" justify="space-between">
        <Text variant="buttonSmall" color={colors.text.onBrandMuted}>
          {t('marketplace.brandHome.deals.next.label')}
        </Text>
        {count > 1 ? (
          <Box row align="center" gap="sm" importantForAccessibility="no-hide-descendants">
            <Text variant="caption" color={colors.text.onBrandMuted}>
              {t('marketplace.brandHome.deals.next.position', { index: index + 1, count })}
            </Text>
            <Box row gap="xs">
              {Array.from({ length: Math.min(count, MAX_DASHES) }, (_, dash) => (
                <Box
                  key={dash}
                  width={dash === index ? DASH_ON : DASH}
                  height={DASH_HEIGHT}
                  borderRadius="full"
                  bg={dash === index ? colors.glass.iconInteractive : colors.glass.progressTrack}
                />
              ))}
            </Box>
          </Box>
        ) : null}
      </Box>

      <Box row align="center" gap="md" mt="lg">
        <DealFace party={deal.creator} size={FACE} surface="brand" rim />
        <Box flex={1}>
          <Text variant="title" color={colors.text.onBrand} numberOfLines={1}>
            {name}
          </Text>
          <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
            {`${deal.title} · ${amount}`}
          </Text>
        </Box>
      </Box>

      <Text variant="h2" color={colors.text.onBrand} numberOfLines={2} mt="md">
        {action}
      </Text>
      <Box mt="sm">
        <DueChip dueAt={deal.dueAt} />
      </Box>

      <Box row gap="sm" mt="lg">
        <Pressable
          flex={1}
          row
          align="center"
          justify="center"
          gap="sm"
          bg={colors.button.onBrand.bg}
          style={styles.action}
          onPress={open}
          scaleOnPress
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.brandHome.deals.next.cardLabel', { name, action })}
          accessibilityHint={t(ctaKey, { amount })}
        >
          <Text variant="button" color={colors.button.onBrand.text} numberOfLines={1}>
            {t(ctaKey, { amount })}
          </Text>
          <Box style={styles.arrow}>
            <ArrowRight size={sizes.icon.sm} color={colors.button.onBrand.text} />
          </Box>
        </Pressable>
        {onNext ? (
          <Pressable
            align="center"
            justify="center"
            bg={colors.glass.fill}
            borderWidth="thin"
            borderColor={colors.glass.border}
            style={styles.nextButton}
            onPress={onNext}
            scaleOnPress
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.brandHome.deals.next.nextLabel')}
          >
            <Box style={styles.arrow}>
              <ArrowRight size={sizes.icon.md} color={colors.text.onBrand} />
            </Box>
          </Pressable>
        ) : null}
      </Box>
    </GradientSurface>
  );
};

export const NextStepCard = memo(NextStepCardComponent);
