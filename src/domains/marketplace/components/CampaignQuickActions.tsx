import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import {
  CalendarPlus,
  CircleStop,
  Copy,
  PencilLine,
  Plus,
  RotateCcw,
  Trash2,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, SectionHeader, Text } from '@/shared/ui';
import {
  CAMPAIGN_QUICK_MAX,
  isDangerQuickAction,
  type CampaignQuickAction,
} from '../utils/campaignQuickActions';

const CIRCLE = moderateScale(58);

const ICON = {
  resume: PencilLine,
  addSeats: Plus,
  extendDeadline: CalendarPlus,
  edit: PencilLine,
  duplicate: Copy,
  close: CircleStop,
  cancel: X,
  delete: Trash2,
  reopen: RotateCcw,
  creators: Users,
} as const satisfies Record<CampaignQuickAction, LucideIcon>;

const LABEL = {
  resume: 'marketplace.campaign.detail.quick.labels.resume',
  addSeats: 'marketplace.campaign.detail.quick.labels.addSeats',
  extendDeadline: 'marketplace.campaign.detail.quick.labels.extendDeadline',
  edit: 'marketplace.campaign.detail.quick.labels.edit',
  duplicate: 'marketplace.campaign.detail.quick.labels.duplicate',
  close: 'marketplace.campaign.detail.quick.labels.close',
  cancel: 'marketplace.campaign.detail.quick.labels.cancel',
  delete: 'marketplace.campaign.detail.quick.labels.delete',
  reopen: 'marketplace.campaign.detail.quick.labels.reopen',
  creators: 'marketplace.campaign.detail.quick.labels.creators',
} as const satisfies Record<CampaignQuickAction, ParseKeys>;

export interface CampaignQuickActionsProps {
  actions: readonly CampaignQuickAction[];
  onAction: (action: CampaignQuickAction) => void;
  /** A lifecycle call is in flight: the circles wait. */
  busy: boolean;
}

/**
 * The few actions of the «⋯» the status makes common, as circles right under the cover: one tap
 * instead of two. A row of four slots, so circles keep one size however many there are.
 */
const CampaignQuickActionsComponent: React.FC<CampaignQuickActionsProps> = ({ actions, onAction, busy }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ borderWidths, shadows }): Record<'circle', ViewStyle> => ({
      circle: {
        width: CIRCLE,
        height: CIRCLE,
        borderRadius: CIRCLE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
        ...shadows.card,
      },
    }),
    [colors.border.card, colors.surface.main],
  );
  if (actions.length === 0) return null;

  const empty = Math.max(0, CAMPAIGN_QUICK_MAX - actions.length);
  return (
    <Box gap="md">
      <SectionHeader title={t('marketplace.campaign.detail.quick.title')} emphasis="strong" />
      <Box row gap="sm">
        {actions.map(action => {
          const Icon = ICON[action];
          const danger = isDangerQuickAction(action);
          const label = t(LABEL[action]);
          return (
            <Pressable
              key={action}
              flex={1}
              align="center"
              gap="sm"
              scaleOnPress
              disabled={busy}
              onPress={() => onAction(action)}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ disabled: busy }}
            >
              <Box style={styles.circle}>
                <Icon
                  size={sizes.icon.md}
                  color={danger ? colors.status.danger.text : colors.brand.text}
                  strokeWidth={iconStroke.regular}
                />
              </Box>
              <Text
                variant="caption"
                align="center"
                numberOfLines={2}
                color={danger ? colors.status.danger.text : colors.text.primary}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
        {Array.from({ length: empty }, (_, index) => (
          <Box key={`slot-${index}`} flex={1} />
        ))}
      </Box>
    </Box>
  );
};

export const CampaignQuickActions = memo(CampaignQuickActionsComponent);
