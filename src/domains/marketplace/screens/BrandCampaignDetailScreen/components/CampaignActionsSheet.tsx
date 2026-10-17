import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { CalendarPlus, CircleStop, Copy, PencilLine, Plus, Trash2, X, type LucideIcon } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { BottomSheet, Box, ListRow, Text } from '@/shared/ui';
import { CAMPAIGN_MONEY_LIMITS } from '../../../constants/campaignMoney';
import type { CampaignDetail } from '../../../types/campaign';
import type { CampaignMenuAction } from '../../../utils/campaignLifecycle';
import type { CampaignLifecycleModel } from '../hooks/useCampaignLifecycle';

interface RowLook {
  icon: LucideIcon;
  danger: boolean;
  title: ParseKeys;
}

const ROW_LOOK = {
  resume: { icon: PencilLine, danger: false, title: 'marketplace.campaign.detail.menu.resume' },
  addSeats: { icon: Plus, danger: false, title: 'marketplace.campaign.detail.menu.addSeats' },
  extendDeadline: { icon: CalendarPlus, danger: false, title: 'marketplace.campaign.detail.menu.extend' },
  edit: { icon: PencilLine, danger: false, title: 'marketplace.campaign.detail.menu.edit' },
  duplicate: { icon: Copy, danger: false, title: 'marketplace.campaign.detail.menu.duplicate' },
  close: { icon: CircleStop, danger: true, title: 'marketplace.campaign.detail.menu.close' },
  cancel: { icon: X, danger: true, title: 'marketplace.campaign.detail.menu.cancel' },
  delete: { icon: Trash2, danger: true, title: 'marketplace.campaign.detail.menu.delete' },
} as const satisfies Record<CampaignMenuAction, RowLook>;

export interface CampaignActionsSheetProps {
  campaign: CampaignDetail;
  lifecycle: CampaignLifecycleModel;
  termsLocked: boolean;
}

/**
 * The campaign's «⋯»: what the status allows, one row each. A row that can't run says why instead
 * of disappearing (seats at the cap, no later deadline allowed), and the edit row says up front
 * what is locked. Ending is a single row whose words follow the taken seats.
 */
const CampaignActionsSheetComponent: React.FC<CampaignActionsSheetProps> = ({ campaign, lifecycle, termsLocked }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { rows, menuVisible, close, onMenuDismissed, choose, isDuplicating } = lifecycle;

  const subtitle = (action: CampaignMenuAction, disabled: boolean): string => {
    switch (action) {
      case 'resume':
        return t('marketplace.campaign.list.draftSheet.resumeHint');
      case 'addSeats':
        return t(
          disabled ? 'marketplace.campaign.detail.menu.addSeatsFull' : 'marketplace.campaign.detail.menu.addSeatsHint',
          { max: CAMPAIGN_MONEY_LIMITS.seatsMax },
        );
      case 'extendDeadline':
        return t(disabled ? 'marketplace.campaign.detail.menu.extendNone' : 'marketplace.campaign.detail.menu.extendHint');
      case 'edit':
        return t(termsLocked ? 'marketplace.campaign.detail.menu.editLocked' : 'marketplace.campaign.detail.menu.editHint');
      case 'duplicate':
        return t('marketplace.campaign.list.draftSheet.duplicateHint');
      case 'close':
        return t('marketplace.campaign.detail.menu.closeHint', { seats: formatNumber(campaign.counters.seatsOccupied) });
      case 'cancel':
        return t('marketplace.campaign.detail.menu.cancelHint');
      case 'delete':
        return t('marketplace.campaign.list.draftSheet.deleteHint');
      default: {
        const _exhaustive: never = action;
        return _exhaustive;
      }
    }
  };

  return (
    <BottomSheet visible={menuVisible} onClose={close} onDismissed={onMenuDismissed}>
      <Box px="xl" pb="xl" gap="sm">
        <Text variant="h4" color={colors.text.primary} numberOfLines={1}>
          {t('marketplace.campaign.detail.menu.title')}
        </Text>
        {rows.map(({ action, disabled }) => {
          const look = ROW_LOOK[action];
          return (
            <ListRow
              key={action}
              icon={look.icon}
              iconTone={look.danger ? undefined : 'interactive'}
              tone={look.danger ? 'danger' : undefined}
              title={t(look.title)}
              subtitle={subtitle(action, disabled)}
              onPress={() => choose(action)}
              disabled={disabled}
              loading={action === 'duplicate' && isDuplicating}
            />
          );
        })}
      </Box>
    </BottomSheet>
  );
};

export const CampaignActionsSheet = memo(CampaignActionsSheetComponent);
