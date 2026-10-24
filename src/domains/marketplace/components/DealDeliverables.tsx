import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Clapperboard } from 'lucide-react-native';
import { moderateScale, resolveHue, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, SocialPlatformIcon, Text } from '@/shared/ui';
import { isSocialPlatform } from '@/shared/utils';
import { DEAL_ITEM_STATUS_ICON } from '../constants/statusIcons';
import { useClock } from '../hooks/useClock';
import type { DealItem, DealRole } from '../types';
import {
  dealDeliverableAction,
  dealRounds,
  type DealDeliverableAction,
} from '../utils/dealDrafts';
import { getDealItemStatusMeta } from '../utils/dealStatus';
import { formatRemaining, timerSecondsLeft } from '../utils/dealTimer';
import { DealRoundBars } from './DealRoundBars';

const TILE = moderateScale(44);
const MINUTE_MS = 60_000;

const ACTION_LABEL = {
  submit: 'marketplace.deals.drafts.deliverables.action.submit',
  review: 'marketplace.deals.drafts.deliverables.action.review',
  approveAsIs: 'marketplace.deals.drafts.deliverables.action.approveAsIs',
  publish: 'marketplace.deals.publish.deliverables.publish',
  verify: 'marketplace.deals.publish.deliverables.verify',
  view: 'marketplace.deals.drafts.deliverables.action.view',
} as const satisfies Record<DealDeliverableAction, ParseKeys>;

export interface DealDeliverablesProps {
  items: DealItem[];
  role: DealRole;
  /** Account hold: rows open read-only and no clock runs. */
  held?: boolean;
  onOpen: (itemId: string) => void;
}

/**
 * «Due in…» for the side that must act; the brand's review and verify windows end in an automatic
 * approval / verification.
 */
const useDueLine = (item: DealItem, action: DealDeliverableAction | null, held: boolean) => {
  const { t } = useTranslation();
  const now = useClock(MINUTE_MS);
  if (held) return t('marketplace.deals.timer.held');
  if (item.timerPaused)
    return t('marketplace.deals.drafts.deliverables.paused');
  if (item.dueAt === null || action === null || action === 'view') return null;
  const left = formatRemaining(t, timerSecondsLeft(item.dueAt, now));
  if (action === 'review') return t('marketplace.deals.drafts.deliverables.autoApprove', { time: left });
  if (action === 'verify') return t('marketplace.deals.publish.deliverables.autoVerify', { time: left });
  return t('marketplace.deals.drafts.deliverables.due', { time: left });
};

const DeliverableRow = memo<{
  item: DealItem;
  role: DealRole;
  held: boolean;
  onOpen: (itemId: string) => void;
}>(({ item, role, held, onOpen }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const action = dealDeliverableAction(item, role, held);
  const due = useDueLine(item, action, held);
  const hue = resolveHue(colors, getDealItemStatusMeta(item.status.key).tone);
  const StatusIcon = item.status.key
    ? DEAL_ITEM_STATUS_ICON[item.status.key]
    : Clapperboard;
  const mine = action !== null && action !== 'view';
  const styles = useStyles(
    ({
      radii,
      spacing,
      shadows,
      borderWidths,
    }): Record<'row' | 'tile', ViewStyle> => ({
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radii.xl,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: mine ? colors.interactive.main : colors.border.card,
        ...shadows.card,
      },
      tile: {
        width: TILE,
        height: TILE,
        borderRadius: radii.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface.elevated,
      },
    }),
    [
      colors.border.card,
      colors.interactive.main,
      colors.surface.elevated,
      colors.surface.main,
      mine,
    ],
  );
  const open = useCallback(() => onOpen(item.id), [item.id, onOpen]);

  return (
    <Box style={styles.row}>
      <Box style={styles.tile}>
        {item.platform && isSocialPlatform(item.platform) ? (
          <SocialPlatformIcon platform={item.platform} size={sizes.icon.md} color={colors.brand.text} />
        ) : (
          <Clapperboard size={sizes.icon.md} color={colors.icon.secondary} />
        )}
      </Box>
      <Box flex={1} gap="xs">
        <Text
          variant="bodyMedium"
          color={colors.text.primary}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Box row align="center" gap="xs">
          <StatusIcon size={sizes.icon.xs} color={hue.main} />
          <Text variant="caption" color={hue.text} numberOfLines={1}>
            {item.status.label}
          </Text>
        </Box>
        <Box row align="center" gap="sm">
          <DealRoundBars rounds={dealRounds(item)} />
          {due ? (
            <Text
              variant="caption"
              color={colors.text.tertiary}
              numberOfLines={1}
            >
              {due}
            </Text>
          ) : null}
        </Box>
      </Box>
      {action ? (
        <CustomButton
          title={t(ACTION_LABEL[action], { round: dealRounds(item).current })}
          size="sm"
          variant={mine ? 'primary' : 'secondary'}
          onPress={open}
          accessibilityLabel={t('marketplace.deals.drafts.deliverables.a11y', {
            action: t(ACTION_LABEL[action], {
              round: dealRounds(item).current,
            }),
            title: item.title,
          })}
        />
      ) : null}
    </Box>
  );
});

/**
 * «مسار التسليم» (P6, approved 2026-10-15): one card per deliverable while the work is on — its
 * server status, the round bars, the clock of whoever must act, and the button into the round.
 */
const DealDeliverablesComponent: React.FC<DealDeliverablesProps> = ({
  items,
  role,
  held = false,
  onOpen,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  if (items.length === 0) return null;
  return (
    <Box gap="md">
      <Text variant="overline" color={colors.text.tertiary}>
        {t('marketplace.deals.drafts.deliverables.title')}
      </Text>
      {items.map(item => (
        <DeliverableRow key={item.id} item={item} role={role} held={held} onOpen={onOpen} />
      ))}
    </Box>
  );
};

export const DealDeliverables = memo(DealDeliverablesComponent);
