import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Card, MoneyText, Pressable, Text } from '@/shared/ui';
import { DEAL_NEXT_STEP_COPY } from '../constants/dealCopy';
import { useClock } from '../hooks/useClock';
import { useDealStationCopy } from '../hooks/useDealStationCopy';
import type { Deal, DealRole } from '../types';
import type { DealJourneyStageKey } from '../utils/dealJourney';
import { dealNextStep } from '../utils/dealNextStep';
import { dealStation } from '../utils/dealStation';
import { dealTimeView, formatRemaining } from '../utils/dealTimer';
import { getDealStatusMeta } from '../utils/dealStatus';
import { DealCampaignChip } from './DealCampaignChip';
import { DealFace } from './DealFace';
import { DealStepTipBody, DealStepper } from './DealStepper';
import { DealTimerBar, type DealTimerBarTime } from './DealTimerBar';

const FACE = moderateScale(44);
const MINUTE = 60_000;

export interface DealTicketProps {
  deal: Deal;
  /** Viewer's side: brands see the creator, creators see the brand. */
  role: DealRole;
  onPress: (dealId: string) => void;
}

const StationTip = memo<{
  deal: Deal;
  role: DealRole;
  station: DealJourneyStageKey;
}>(({ deal, role, station }) => {
  const copy = useDealStationCopy(deal, role)[station];
  return <DealStepTipBody title={copy.name} body={copy.what} />;
});

/**
 * A deal in the list, read in three lines: who and how much · the server's status with the time
 * left filling behind it · every station by name (tap or slide for a bubble), then what happens
 * next and who moves. Tapping anywhere but the stations opens the deal.
 */
const DealTicketComponent: React.FC<DealTicketProps> = ({
  deal,
  role,
  onPress,
}) => {
  const now = useClock(MINUTE);
  const { t, i18n } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const party = role === 'brand' ? deal.creator : deal.brand;
  const station = useMemo(() => dealStation(deal), [deal]);
  const next = useMemo(() => dealNextStep(deal, role), [deal, role]);
  const meta = getDealStatusMeta(deal.status.key);
  const open = useCallback(() => onPress(deal.id), [deal.id, onPress]);

  const view = useMemo(() => dealTimeView(deal, now), [deal, now]);
  const time: DealTimerBarTime = useMemo(() => {
    switch (view.kind) {
      case 'closed':
        return view.at === null
          ? { kind: 'none' }
          : {
              kind: 'closed',
              text: t('marketplace.deals.timer.closedOn', {
                date: formatDate(
                  view.at,
                  { day: 'numeric', month: 'short' },
                  i18n.language,
                ),
              }),
            };
      case 'left':
        return {
          kind: 'left',
          text: formatRemaining(t, view.seconds),
          late: view.late,
        };
      default:
        return view;
    }
  }, [i18n.language, t, view]);
  const share = view.kind === 'left' ? view.share : null;

  const renderTip = useCallback(
    (key: DealJourneyStageKey) => (
      <StationTip deal={deal} role={role} station={key} />
    ),
    [deal, role],
  );

  const summary = deal.items.map(item => item.title).join(' · ');
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Card p="lg">
      <Box gap="md">
        <Pressable
          onPress={open}
          gap="md"
          accessibilityRole="button"
          accessibilityLabel={party.name ?? summary}
        >
          <Box row align="center" gap="md">
            <DealFace party={party} size={FACE} />
            <Box flex={1} gap="xs">
              <Text
                variant="bodyMedium"
                color={colors.text.primary}
                numberOfLines={1}
              >
                {party.name ?? ''}
              </Text>
              <Text
                variant="caption"
                color={colors.text.tertiary}
                numberOfLines={1}
              >
                {summary}
              </Text>
            </Box>
            <MoneyText value={deal.total} size="sm" />
          </Box>
          {deal.campaign ? (
            <DealCampaignChip campaign={deal.campaign} surface="soft" />
          ) : null}
          <DealTimerBar
            label={deal.status.label}
            tone={meta.tone}
            share={share}
            time={time}
          />
        </Pressable>

        <DealStepper
          stages={station.stages}
          state={station.state}
          warn={meta.tone === 'warning'}
          renderTip={renderTip}
        />

        {next ? (
          <Pressable
            onPress={open}
            row
            align="center"
            gap="sm"
            pt="md"
            borderTopWidth="thin"
            borderColor={colors.border.default}
            accessibilityRole="button"
            accessibilityLabel={`${t('marketplace.deals.nextLabel')}: ${t(
              DEAL_NEXT_STEP_COPY[next.key].title,
              { name: party.name ?? '' },
            )}`}
          >
            <Box px="sm" py="xs" borderRadius="sm" bg={colors.interactive.soft}>
              <Text variant="caption" color={colors.interactive.text}>
                {t('marketplace.deals.nextLabel')}
              </Text>
            </Box>
            <Box flex={1}>
              <Text
                variant="bodySmall"
                color={colors.text.primary}
                numberOfLines={2}
              >
                {t(DEAL_NEXT_STEP_COPY[next.key].title, {
                  name: party.name ?? '',
                })}
              </Text>
            </Box>
            <Chevron size={sizes.icon.sm} color={colors.icon.secondary} />
          </Pressable>
        ) : null}
      </Box>
    </Card>
  );
};

export const DealTicket = memo(DealTicketComponent);
