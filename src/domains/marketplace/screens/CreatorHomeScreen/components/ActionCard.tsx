import React, { memo, useCallback } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Pause } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, StatusPill, Text } from '@/shared/ui';
import { DealFace } from '../../../components/DealFace';
import {
  CREATOR_DEAL_ACTION_CTA,
  UNKNOWN_CREATOR_DEAL_ACTION_CTA,
} from '../../../constants/creatorHomeDeals';
import { DEAL_STATUS_META, UNKNOWN_DEAL_STATUS_META } from '../../../constants/dealStatus';
import { useClock } from '../../../hooks/useClock';
import type { CreatorActiveDeal } from '../../../types';
import { creatorDealClock } from '../../../utils/creatorHomeDeals';
import { formatRemaining } from '../../../utils/dealTimer';
import { ClockBar } from './ClockBar';

const FACE = moderateScale(44);
/** An urgent card is washed in amber down to about here. */
const WASH = moderateScale(120);
const MINUTE = 60_000;

interface ActionCardProps {
  deal: CreatorActiveDeal;
  onOpen: (id: string) => void;
}

/**
 * One deal waiting on the creator: who, what to do (the server's label, big), what it is worth,
 * how long is left, and the one button that opens it. Under 12 hours the card is washed amber.
 */
const ActionCardComponent: React.FC<ActionCardProps> = ({ deal, onOpen }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const now = useClock(MINUTE);
  const clock = creatorDealClock(deal.dueAt, now);
  const open = useCallback(() => onOpen(deal.id), [deal.id, onOpen]);

  const statusKey = deal.status.key;
  const tone = (statusKey ? DEAL_STATUS_META[statusKey] : UNKNOWN_DEAL_STATUS_META).tone;
  const action = deal.action?.label ?? deal.status.label;
  const ctaKey = deal.action?.key ? CREATOR_DEAL_ACTION_CTA[deal.action.key] : UNKNOWN_CREATOR_DEAL_ACTION_CTA;
  const name = deal.brand.name ?? '';
  const amount = formatMoney(deal.total);
  const late = clock.kind === 'left' && clock.late;
  const clockText =
    clock.kind === 'left'
      ? t('marketplace.creatorHome.deals.left', { time: formatRemaining(t, clock.seconds) })
      : t('marketplace.creatorHome.deals.paused');

  const styles = useStyles(
    ({ radii }): Record<'card' | 'wash', ViewStyle> => ({
      card: { borderRadius: radii.xl, overflow: 'hidden' },
      wash: { ...StyleSheet.absoluteFill, bottom: undefined, height: WASH },
    }),
    [],
  );

  return (
    <Box style={styles.card} bg={colors.surface.main} p="lg" gap="md">
      {late ? (
        <LinearGradient
          colors={[colors.status.warning.soft, colors.layout.transparent]}
          style={styles.wash}
          pointerEvents="none"
        />
      ) : null}
      <Box row align="center" gap="md">
        <DealFace party={deal.brand} size={FACE} />
        <Box flex={1}>
          <Text variant="bodyMedium" numberOfLines={1}>
            {name}
          </Text>
          <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
            {deal.title}
          </Text>
        </Box>
        <StatusPill label={deal.stage?.label ?? deal.status.label} tone={tone} size="sm" />
      </Box>
      <Box gap="xs">
        <Text variant="h2" numberOfLines={2}>
          {action}
        </Text>
        <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
          {amount}
        </Text>
      </Box>
      <Box row align="center" gap="md" importantForAccessibility="no-hide-descendants">
        {clock.kind === 'paused' ? <Pause size={sizes.icon.xs} color={colors.text.tertiary} /> : null}
        <Text
          variant="buttonSmall"
          color={late ? colors.status.warning.text : colors.text.secondary}
          numberOfLines={1}
        >
          {clockText}
        </Text>
        {clock.kind === 'left' ? <ClockBar share={clock.share} hot={clock.late} /> : null}
      </Box>
      <CustomButton
        title={t(ctaKey)}
        onPress={open}
        fullWidth
        rightIcon={isRTL ? <ArrowLeft /> : <ArrowRight />}
        accessibilityLabel={t('marketplace.creatorHome.deals.cardLabel', { name, action })}
      />
    </Box>
  );
};

export const ActionCard = memo(ActionCardComponent);
