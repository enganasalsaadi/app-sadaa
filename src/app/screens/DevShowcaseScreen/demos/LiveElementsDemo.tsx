import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoney, formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import {
  AnimatedNumber,
  Box,
  Card,
  CustomButton,
  GradientSurface,
  LiveDot,
  LiveIsland,
  MoneyFlow,
  SectionHeader,
  SmartBorder,
  StaggerIn,
  Text,
} from '@/shared/ui';
import { useLiveElementsDemo } from './hooks/useLiveElementsDemo';
import { MOCK_DEAL_SUMMARY } from './mockData';

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };

/** Rule 09 §3.1 parts: live dot, live island, rolling numbers, money flow, smart border, stagger rise. */
const LiveElementsDemoComponent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { runId, replay, onIslandPress } = useLiveElementsDemo();

  return (
    <Box gap="xl">
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.live.dotTitle')} />
        <Box row align="center" gap="xl" p="md">
          <LiveDot color={colors.interactive.main} />
          <LiveDot color={colors.money.main} />
          <LiveDot color={colors.status.warning.main} />
          <LiveDot color={colors.status.danger.main} />
        </Box>
      </Box>

      <Box gap="sm">
        <SectionHeader title={t('devShowcase.live.islandTitle')} />
        <GradientSurface variant="live" borderRadius="lg" p="lg" gap="md">
          <LiveIsland
            title={t('devShowcase.live.islandLive')}
            message={t('devShowcase.live.islandLiveBody')}
          />
          <LiveIsland
            title={t('devShowcase.live.islandWarning')}
            message={t('devShowcase.live.islandWarningBody')}
            tone="warning"
            onPress={onIslandPress}
            accessibilityHint={t('devShowcase.live.islandAction')}
          />
          <LiveIsland title={t('devShowcase.live.islandDanger')} tone="danger" onPress={onIslandPress} />
        </GradientSurface>
      </Box>

      <Box key={`numbers-${runId}`} gap="sm">
        <SectionHeader
          title={t('devShowcase.live.numberTitle')}
          action={{ label: t('devShowcase.live.replay'), onPress: replay }}
        />
        <Card p="lg">
          <Box row justify="space-around" align="center">
            <AnimatedNumber value={formatNumber(48200, COMPACT)} variant="h3" />
            <AnimatedNumber value={formatNumber(0.7, { style: 'percent' })} variant="h3" color={colors.interactive.text} />
            <AnimatedNumber
              value={formatMoney(MOCK_DEAL_SUMMARY.payout, i18n.language)}
              variant="title"
              color={colors.money.text}
            />
          </Box>
        </Card>
      </Box>

      <Box gap="sm">
        <SectionHeader title={t('devShowcase.live.flowTitle')} />
        <Card p="lg">
          <Box row align="center" gap="md">
            <Text variant="bodySmall" color={colors.text.secondary}>
              {t('devShowcase.live.flowFrom')}
            </Text>
            <MoneyFlow />
            <Text variant="bodySmall" color={colors.money.text}>
              {t('devShowcase.live.flowTo')}
            </Text>
          </Box>
        </Card>
        <GradientSurface variant="brand" borderRadius="lg" p="lg">
          <MoneyFlow color={colors.glass.iconMoney} />
        </GradientSurface>
      </Box>

      <Box gap="sm">
        <SectionHeader title={t('devShowcase.live.smartTitle')} />
        <SmartBorder>
          <Text variant="bodyMedium">{t('devShowcase.live.smartBody')}</Text>
        </SmartBorder>
      </Box>

      <Box key={`stagger-${runId}`} gap="sm">
        <SectionHeader
          title={t('devShowcase.live.staggerTitle')}
          action={{ label: t('devShowcase.live.replay'), onPress: replay }}
        />
        <StaggerIn gap="sm">
          <Card p="md">
            <Text variant="bodySmall">{t('devShowcase.live.staggerItem', { index: 1 })}</Text>
          </Card>
          <Card p="md">
            <Text variant="bodySmall">{t('devShowcase.live.staggerItem', { index: 2 })}</Text>
          </Card>
          <Card p="md">
            <Text variant="bodySmall">{t('devShowcase.live.staggerItem', { index: 3 })}</Text>
          </Card>
        </StaggerIn>
        <CustomButton title={t('devShowcase.live.replay')} variant="secondary" onPress={replay} />
      </Box>
    </Box>
  );
};

export const LiveElementsDemo = memo(LiveElementsDemoComponent);
