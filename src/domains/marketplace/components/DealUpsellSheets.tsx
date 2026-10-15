import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Undo2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, ConfirmSheet, CustomButton, Text } from '@/shared/ui';
import type { DealUpsellsModel } from '../hooks/useDealUpsells';
import { DEAL_UPSELL_DECLINE_REASON, type Deal } from '../types';
import { DealReasonFields } from './DealReasonFields';
import { DealSheetFrame } from './DealSheetFrame';

export interface DealUpsellSheetsProps {
  deal: Deal;
  upsells: DealUpsellsModel;
}

/** The creator's decline sheet and the brand's «pull it back» confirm; the model decides which one is up. */
const DealUpsellSheetsComponent: React.FC<DealUpsellSheetsProps> = ({ deal, upsells }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { sheet } = upsells;
  return (
    <>
      <DealSheetFrame
        visible={sheet === 'decline'}
        onClose={upsells.close}
        title={t('marketplace.deals.changes.upsells.decline.title')}
        body={t('marketplace.deals.changes.upsells.paper.from', { name: deal.brand.name ?? '' })}
        footer={
          <Box gap="sm">
            <CustomButton
              title={t('marketplace.deals.changes.upsells.decline.submit')}
              variant="danger"
              size="lg"
              fullWidth
              loading={upsells.declining}
              onPress={upsells.onDecline}
            />
            <Text variant="caption" color={colors.text.secondary} align="center">
              {t('marketplace.deals.changes.upsells.decline.caption')}
            </Text>
          </Box>
        }
      >
        <DealReasonFields
          control={upsells.declineControl}
          reasons={DEAL_UPSELL_DECLINE_REASON}
          defs={upsells.declineReasonDefs}
        />
      </DealSheetFrame>
      <ConfirmSheet
        visible={sheet === 'withdraw'}
        onClose={upsells.close}
        title={t('marketplace.deals.changes.upsells.withdrawTitle')}
        body={t('marketplace.deals.changes.upsells.withdrawBody', { name: deal.creator.name ?? '' })}
        icon={<Undo2 size={sizes.icon.lg} color={colors.interactive.main} />}
        confirmLabel={t('marketplace.deals.changes.upsells.withdrawConfirm')}
        confirmLoading={upsells.withdrawing}
        onConfirm={upsells.onWithdraw}
        cancelLabel={t('marketplace.deals.changes.upsells.keep')}
      />
    </>
  );
};

export const DealUpsellSheets = memo(DealUpsellSheetsComponent);
