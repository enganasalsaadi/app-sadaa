import React, { memo } from 'react';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Users } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, motion, resolveHue, useTheme, type HueTone } from '@/core/theme';
import { Box, Card, Pressable, ProgressBar, Text } from '@/shared/ui';
import { CAMPAIGN_COUNTDOWN_UNIT } from '../constants/campaignDetail';
import { CAMPAIGN_STATION_LABEL } from '../constants/campaignStatus';
import type { JourneyPanel, JourneyStation } from '../utils/campaignJourney';

const NODE = 30;
const HALO = 40;

export interface CampaignJourneyStationProps {
  station: JourneyStation;
  index: number;
  last: boolean;
  tone: HueTone;
  open: boolean;
  onToggle: (key: JourneyStation['key']) => void;
  onOpenApplicants: () => void;
}

/** One stop of the journey: its node on the spine, the name with a one-line summary, and a panel that opens on a tap. */
const CampaignJourneyStationComponent: React.FC<CampaignJourneyStationProps> = ({
  station,
  index,
  last,
  tone,
  open,
  onToggle,
  onOpenApplicants,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const reduceMotion = useReducedMotion();
  const hue = resolveHue(colors, tone);
  const { state, key } = station;
  const done = state === 'done';
  const current = state === 'current';
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const name = t(CAMPAIGN_STATION_LABEL[key]);
  const summary = t(station.summary.key, station.summary.params);

  const renderPanel = (panel: JourneyPanel) => {
    if (panel.kind === 'text') {
      return (
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t(panel.copy.key, panel.copy.params)}
        </Text>
      );
    }
    const { window, applicants } = panel;
    const label = window
      ? t(window.label === 'deadline' ? 'marketplace.campaign.detail.journey.panel.deadline' : 'marketplace.campaign.detail.journey.panel.cancelAt')
      : null;
    return (
      <Box gap="md">
        {window && label ? (
          <ProgressBar
            value={window.remaining}
            tone={window.label === 'cancelAt' ? 'warning' : 'interactive'}
            size="md"
            label={label}
            valueLabel={
              window.timeLeft
                ? t('marketplace.campaign.detail.journey.panel.left', {
                    value: formatNumber(window.timeLeft.value),
                    unit: t(CAMPAIGN_COUNTDOWN_UNIT[window.timeLeft.unit]),
                  })
                : undefined
            }
            accessibilityLabel={label}
          />
        ) : null}
        {applicants > 0 ? (
          <Pressable
            row
            align="center"
            gap="md"
            p="md"
            borderRadius="lg"
            bg={colors.status.warning.soft}
            minHeight={sizes.button.xl}
            scaleOnPress
            onPress={onOpenApplicants}
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.campaign.detail.seats.applications')}
          >
            <Users size={sizes.icon.md} color={colors.status.warning.text} strokeWidth={iconStroke.regular} />
            <Box flex={1}>
              <Text variant="bodyMedium" color={colors.text.primary}>
                {t('marketplace.campaign.detail.seats.applications')}
              </Text>
              <Text variant="caption" color={colors.text.secondary}>
                {t('marketplace.campaign.detail.now.todo.applicantsSub')}
              </Text>
            </Box>
            <Text variant="amountTitle" color={colors.status.warning.text}>
              {formatNumber(applicants)}
            </Text>
            <Chevron size={sizes.icon.sm} color={colors.icon.secondary} />
          </Pressable>
        ) : null}
      </Box>
    );
  };

  return (
    <Box row gap="md">
      <Box width={HALO} align="center">
        <Box width={HALO} height={HALO} borderRadius="full" align="center" justify="center" bg={current ? hue.soft : undefined}>
          <Box
            width={NODE}
            height={NODE}
            borderRadius="full"
            align="center"
            justify="center"
            bg={done ? colors.interactive.main : current ? hue.main : colors.surface.main}
            borderWidth={done || current ? 'none' : 'md'}
            borderColor={colors.border.default}
          >
            {done ? (
              <Check size={sizes.icon.sm} color={colors.text.onBrand} strokeWidth={iconStroke.bold} />
            ) : (
              <Text variant="buttonSmall" color={current ? colors.text.onBrand : colors.text.tertiary}>
                {formatNumber(index + 1)}
              </Text>
            )}
          </Box>
        </Box>
        {last ? null : <Box flex={1} width={3} minHeight={sizes.icon.md} borderRadius="full" bg={done ? colors.interactive.main : colors.border.default} />}
      </Box>
      <Box flex={1} pb={last ? undefined : 'md'}>
        <Pressable
          row
          align="center"
          gap="sm"
          minHeight={sizes.button.md}
          onPress={() => onToggle(key)}
          accessibilityRole="button"
          accessibilityLabel={`${name}. ${summary}`}
          accessibilityState={{ expanded: open }}
        >
          <Box flex={1}>
            <Text variant="bodyMedium" color={state === 'next' ? colors.text.secondary : colors.text.primary}>
              {name}
            </Text>
            <Text variant="caption" color={current ? hue.text : colors.text.secondary}>
              {summary}
            </Text>
          </Box>
          <Box style={open ? OPEN : undefined}>
            <ChevronDown size={sizes.icon.sm} color={colors.icon.secondary} />
          </Box>
        </Pressable>
        {open ? (
          <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(motion.duration.base)}>
            <Card p="md" shadow={state === 'next' ? 'none' : 'card'} borderRadius="lg" bg={state === 'next' ? colors.layout.base : undefined}>
              {renderPanel(station.panel)}
            </Card>
          </Animated.View>
        ) : null}
      </Box>
    </Box>
  );
};

const OPEN = { transform: [{ rotate: '180deg' }] } as const;

export const CampaignJourneyStation = memo(CampaignJourneyStationComponent);
