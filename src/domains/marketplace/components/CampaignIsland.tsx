import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PauseCircle, Users } from 'lucide-react-native';
import type { ParseKeys } from 'i18next';
import { formatNumber } from '@/core/i18n';
import { resolveHue, useStyles, useTheme } from '@/core/theme';
import type { HueTone } from '@/core/theme';
import { Box, CustomButton, Text } from '@/shared/ui';
import { CAMPAIGN_COUNTDOWN_UNIT } from '../constants/campaignDetail';
import { useClock } from '../hooks/useClock';
import type { CampaignDetail } from '../types/campaign';
import {
  campaignCountdown,
  campaignIsland,
  type CampaignIsland as Island,
} from '../utils/campaignDetail';
import { campaignIslandActions, type CampaignIslandAction } from '../utils/campaignLifecycle';
import { formatCampaignDate } from '../utils/campaignSchedule';
import { CampaignRing } from './CampaignRing';

const RING = 62;
const RING_STROKE = 5;

const ISLAND_TONE = {
  suspended: 'warning',
  ghost: 'warning',
  zeroApplicants: 'info',
  seatFreed: 'interactive',
} as const satisfies Record<Island['kind'], HueTone>;

const ACTION_LABEL = {
  reopen: 'marketplace.campaign.detail.island.actions.reopen',
  reopenSeat: 'marketplace.campaign.detail.island.actions.reopenSeat',
  reduce: 'marketplace.campaign.detail.island.actions.reduce',
  extend: 'marketplace.campaign.detail.island.actions.extend',
  edit: 'marketplace.campaign.detail.island.actions.edit',
  cancel: 'marketplace.campaign.detail.island.actions.cancel',
} as const satisfies Record<CampaignIslandAction, ParseKeys>;

export interface CampaignIslandProps {
  campaign: CampaignDetail;
  onAction: (action: CampaignIslandAction) => void;
  /** An action is in flight: the buttons wait. */
  busy: boolean;
}

/**
 * The one thing a live campaign waits on, lifted over the cover's edge: a ring draining toward the
 * automatic consequence (suspension, cancellation) and what it means. Ticks each minute on its
 * own, with the decisions the server offers as buttons (reopen, +4 days, drop a freed seat…).
 */
const CampaignIslandComponent: React.FC<CampaignIslandProps> = ({
  campaign,
  onAction,
  busy,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const now = useClock(60_000);
  const island = campaignIsland(campaign, now);
  const tone = island ? ISLAND_TONE[island.kind] : 'neutral';
  const hue = resolveHue(colors, tone);
  const styles = useStyles(
    ({ radii, borderWidths, shadows }): Record<'island', ViewStyle> => ({
      island: {
        borderRadius: radii.xl,
        borderWidth: borderWidths.md,
        borderColor: hue.main,
        backgroundColor: colors.surface.main,
        ...shadows.lg,
      },
    }),
    [hue.main, colors.surface.main],
  );
  if (!island) return null;

  const dueAt = island.kind === 'seatFreed' ? null : island.dueAt;
  const countdown =
    island.kind === 'seatFreed' || dueAt === null
      ? null
      : campaignCountdown(dueAt, island.windowMs, now);
  const date = dueAt === null ? null : formatCampaignDate(dueAt);

  const copy = ((): { title: string; body: string } => {
    switch (island.kind) {
      case 'suspended':
        return {
          title: t('marketplace.campaign.detail.island.suspended.title'),
          body:
            date === null
              ? t('marketplace.campaign.detail.island.suspended.bodyNoDate')
              : t('marketplace.campaign.detail.island.suspended.body', {
                  date,
                }),
        };
      case 'zeroApplicants':
        return {
          title: t('marketplace.campaign.detail.island.zeroApplicants.title'),
          body: t('marketplace.campaign.detail.island.zeroApplicants.body', {
            date: date ?? '',
          }),
        };
      case 'ghost':
        return {
          title: t('marketplace.campaign.detail.island.ghost.title'),
          body: t('marketplace.campaign.detail.island.ghost.body'),
        };
      case 'seatFreed':
        return {
          title: t('marketplace.campaign.detail.island.seatFreed.title', {
            count: island.freeSeats,
          }),
          body: t('marketplace.campaign.detail.island.seatFreed.body'),
        };
      default: {
        const _exhaustive: never = island;
        return _exhaustive;
      }
    }
  })();

  const actions = campaignIslandActions(island, campaign);
  const unit = countdown ? t(CAMPAIGN_COUNTDOWN_UNIT[countdown.unit]) : '';
  const Icon = island.kind === 'seatFreed' ? Users : PauseCircle;

  return (
    <Box mb="lg">
      <Box gap="lg" p="lg" style={styles.island}>
        <Box row align="center" gap="lg">
          <CampaignRing
            progress={countdown ? countdown.remaining : 1}
            color={hue.main}
            trackColor={hue.soft}
            size={RING}
            strokeWidth={RING_STROKE}
            accessibilityLabel={
              countdown
                ? t('marketplace.campaign.detail.island.ringA11y', {
                    value: countdown.value,
                    unit,
                  })
                : copy.title
            }
          >
            {countdown ? (
              <Box align="center">
                <Text variant="bodyMedium" color={colors.text.primary}>
                  {formatNumber(countdown.value)}
                </Text>
                <Text variant="overline" color={colors.text.tertiary}>
                  {unit}
                </Text>
              </Box>
            ) : (
              <Icon size={sizes.icon.lg} color={hue.main} />
            )}
          </CampaignRing>
          <Box flex={1} gap="xs">
            <Text variant="bodyMedium" color={colors.text.primary}>
              {copy.title}
            </Text>
            <Text variant="caption" color={colors.text.secondary}>
              {copy.body}
            </Text>
          </Box>
        </Box>
        {actions.length > 0 ? (
          <Box row wrap gap="sm">
            {actions.map((action, index) => (
              <CustomButton
                key={action}
                title={t(ACTION_LABEL[action])}
                onPress={() => onAction(action)}
                variant={index === 0 ? 'primary' : 'secondary'}
                size="sm"
                disabled={busy}
              />
            ))}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export const CampaignIsland = memo(CampaignIslandComponent);
