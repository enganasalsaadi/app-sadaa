import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Minus,
  PencilLine,
  RotateCcw,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { CAMPAIGN_COUNTDOWN_UNIT } from '../constants/campaignDetail';
import { CAMPAIGN_MISSING_LABEL } from '../constants/campaignWizard';
import type { CampaignNowTodo, CampaignNowUrgency } from '../utils/campaignNow';
import type { CampaignIslandAction } from '../utils/campaignLifecycle';

interface Look {
  icon: LucideIcon;
  title: ParseKeys;
  subtitle: ParseKeys;
}

const DECISION_LOOK = {
  reopen: {
    icon: RotateCcw,
    title: 'marketplace.campaign.detail.island.actions.reopen',
    subtitle: 'marketplace.campaign.detail.now.todo.sub.reopen',
  },
  reopenSeat: {
    icon: RotateCcw,
    title: 'marketplace.campaign.detail.island.actions.reopenSeat',
    subtitle: 'marketplace.campaign.detail.now.todo.sub.reopenSeat',
  },
  reduce: {
    icon: Minus,
    title: 'marketplace.campaign.detail.island.actions.reduce',
    subtitle: 'marketplace.campaign.detail.now.todo.sub.reduce',
  },
  extend: {
    icon: CalendarPlus,
    title: 'marketplace.campaign.detail.island.actions.extend',
    subtitle: 'marketplace.campaign.detail.now.todo.sub.extend',
  },
  edit: {
    icon: PencilLine,
    title: 'marketplace.campaign.detail.island.actions.edit',
    subtitle: 'marketplace.campaign.detail.now.todo.sub.edit',
  },
  cancel: {
    icon: X,
    title: 'marketplace.campaign.detail.island.actions.cancel',
    subtitle: 'marketplace.campaign.detail.now.todo.sub.cancel',
  },
} as const satisfies Record<CampaignIslandAction, Look>;

const lookOf = (todo: CampaignNowTodo): Look => {
  switch (todo.kind) {
    case 'applicants':
      return {
        icon: Users,
        title: 'marketplace.campaign.detail.seats.review',
        subtitle: 'marketplace.campaign.detail.now.todo.applicantsSub',
      };
    case 'extend':
      return {
        icon: CalendarPlus,
        title: 'marketplace.campaign.detail.menu.extend',
        subtitle: 'marketplace.campaign.detail.menu.extendHint',
      };
    case 'missing':
      return {
        icon: PencilLine,
        title: CAMPAIGN_MISSING_LABEL[todo.missing],
        subtitle: 'marketplace.campaign.detail.now.todo.missingSub',
      };
    case 'edit':
      return {
        icon: PencilLine,
        title: 'marketplace.campaign.detail.dock.resubmit',
        subtitle: 'marketplace.campaign.detail.now.todo.editSub',
      };
    case 'decision':
      return DECISION_LOOK[todo.action];
    default: {
      const _exhaustive: never = todo;
      return _exhaustive;
    }
  }
};

const urgencyOf = (todo: CampaignNowTodo): CampaignNowUrgency | null =>
  todo.kind === 'applicants' || todo.kind === 'decision' ? todo.urgency : null;

export interface CampaignNowTodoRowProps {
  todo: CampaignNowTodo;
  onPress: (todo: CampaignNowTodo) => void;
  busy: boolean;
}

/** One thing the campaign waits on: a lit row when it is pressing, with the time left before the system acts. */
const CampaignNowTodoRowComponent: React.FC<CampaignNowTodoRowProps> = ({ todo, onPress, busy }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const look = lookOf(todo);
  const urgency = urgencyOf(todo);
  const warning = colors.status.warning;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const title = t(look.title);
  const urgent = urgency
    ? t(
        urgency.kind === 'stop'
          ? 'marketplace.campaign.detail.now.todo.urgentStop'
          : 'marketplace.campaign.detail.now.todo.urgentCancel',
        { value: formatNumber(urgency.value), unit: t(CAMPAIGN_COUNTDOWN_UNIT[urgency.unit]) },
      )
    : null;
  const Icon = look.icon;

  return (
    <Pressable
      row
      align="center"
      gap="md"
      p="md"
      borderRadius="lg"
      bg={todo.hot ? warning.soft : colors.layout.base}
      minHeight={sizes.button.xl}
      scaleOnPress
      disabled={busy}
      onPress={() => onPress(todo)}
      accessibilityRole="button"
      accessibilityLabel={urgent ? `${title}. ${urgent}` : title}
      accessibilityState={{ disabled: busy }}
    >
      <Box
        width={sizes.icon.xl}
        height={sizes.icon.xl}
        borderRadius="md"
        align="center"
        justify="center"
        bg={todo.hot ? warning.main : colors.surface.main}
      >
        <Icon
          size={sizes.icon.md}
          color={todo.hot ? colors.text.onBrand : colors.brand.text}
          strokeWidth={iconStroke.regular}
        />
      </Box>
      <Box flex={1} gap="xs">
        <Text variant="bodyMedium" color={colors.text.primary}>
          {title}
        </Text>
        <Text variant="caption" color={colors.text.secondary}>
          {t(look.subtitle)}
        </Text>
        {urgent ? (
          <Box row align="center" gap="xs" alignSelf="flex-start" px="sm" py="xs" borderRadius="full" bg={colors.surface.main}>
            <Clock size={sizes.icon.xs} color={warning.text} strokeWidth={iconStroke.bold} />
            <Text variant="caption" color={warning.text}>
              {urgent}
            </Text>
          </Box>
        ) : null}
      </Box>
      {todo.kind === 'applicants' ? (
        <Box minWidth={sizes.badge.md} height={sizes.badge.md} px="xs" borderRadius="full" align="center" justify="center" bg={warning.main}>
          <Text variant="caption" color={colors.text.onBrand}>
            {formatNumber(todo.count)}
          </Text>
        </Box>
      ) : null}
      <Chevron size={sizes.icon.sm} color={colors.icon.secondary} />
    </Pressable>
  );
};

export const CampaignNowTodoRow = memo(CampaignNowTodoRowComponent);
