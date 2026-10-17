import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, PencilLine, Trash2 } from 'lucide-react-native';
import { BottomSheet, Box, ConfirmSheet, ListRow, Text } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import type { Campaign } from '../types';

export interface CampaignDraftSheetProps {
  campaign: Campaign | null;
  actionsVisible: boolean;
  deleteVisible: boolean;
  /** 20 drafts already: a copy would be refused. */
  atLimit: boolean;
  isDuplicating: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onResume: () => void;
  onDuplicate: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

/** A draft's «⋯»: continue, copy, or delete (which asks once more). */
const CampaignDraftSheetComponent: React.FC<CampaignDraftSheetProps> = ({
  campaign,
  actionsVisible,
  deleteVisible,
  atLimit,
  isDuplicating,
  isDeleting,
  onClose,
  onResume,
  onDuplicate,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const title = campaign?.title.trim() || t('marketplace.campaign.list.untitled');

  return (
    <>
      <BottomSheet visible={actionsVisible} onClose={onClose}>
        <Box px="xl" pb="xl" gap="sm">
          <Text variant="h4" color={colors.text.primary} numberOfLines={1}>
            {title}
          </Text>
          <ListRow
            icon={PencilLine}
            iconTone="interactive"
            title={t('marketplace.campaign.list.draftSheet.resume')}
            subtitle={t('marketplace.campaign.list.draftSheet.resumeHint')}
            onPress={onResume}
          />
          <ListRow
            icon={Copy}
            iconTone="interactive"
            title={t('marketplace.campaign.list.draftSheet.duplicate')}
            subtitle={t(atLimit ? 'marketplace.campaign.list.draftSheet.limitHint' : 'marketplace.campaign.list.draftSheet.duplicateHint')}
            onPress={onDuplicate}
            disabled={atLimit}
            loading={isDuplicating}
          />
          <ListRow
            icon={Trash2}
            tone="danger"
            title={t('marketplace.campaign.list.draftSheet.delete')}
            subtitle={t('marketplace.campaign.list.draftSheet.deleteHint')}
            onPress={onAskDelete}
          />
        </Box>
      </BottomSheet>
      <ConfirmSheet
        visible={deleteVisible}
        onClose={onCancelDelete}
        title={t('marketplace.campaign.list.draftSheet.deleteTitle')}
        body={t('marketplace.campaign.list.draftSheet.deleteBody', { title })}
        confirmLabel={t('marketplace.campaign.list.draftSheet.deleteConfirm')}
        confirmVariant="danger"
        confirmLoading={isDeleting}
        onConfirm={onConfirmDelete}
        cancelLabel={t('marketplace.campaign.list.draftSheet.keep')}
      />
    </>
  );
};

export const CampaignDraftSheet = memo(CampaignDraftSheetComponent);
