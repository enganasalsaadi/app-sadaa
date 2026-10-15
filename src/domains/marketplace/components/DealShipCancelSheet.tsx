import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleX } from 'lucide-react-native';
import type { Money } from '@/core/money';
import { useTheme } from '@/core/theme';
import { Box, Card, MoneyText, Text } from '@/shared/ui';
import { DealHoldToSign } from './DealHoldToSign';
import { DealSheetFrame } from './DealSheetFrame';

export interface DealShipCancelSheetProps {
  visible: boolean;
  onClose: () => void;
  creatorName: string;
  /** The server's refund (`cancellation.brand.refund`); `null` = the full held amount, unstated. */
  refund: Money | null;
  onCancel: () => Promise<boolean>;
}

/**
 * The brand ending the deal over a shipping problem (M5): the held money comes back to the wallet
 * (the server's figure, in mint) and the creator's rating is untouched. Hold to confirm.
 */
const DealShipCancelSheetComponent: React.FC<DealShipCancelSheetProps> = ({
  visible,
  onClose,
  creatorName,
  refund,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <DealSheetFrame
      visible={visible}
      onClose={onClose}
      title={t('marketplace.deals.shipping.cancel.title')}
      body={t('marketplace.deals.shipping.cancel.body', { name: creatorName })}
      footer={
        <DealHoldToSign
          label={t('marketplace.deals.shipping.cancel.hold')}
          caption={t('marketplace.deals.shipping.cancel.holdCaption')}
          hint={t('marketplace.deals.respond.hold.hint')}
          accessibilityLabel={t('marketplace.deals.shipping.cancel.hold')}
          accessibilityHint={t('marketplace.deals.shipping.holdA11y')}
          tone="danger"
          icon={CircleX}
          onComplete={onCancel}
        />
      }
    >
      <Card p="lg">
        <Box row align="center" justify="space-between" gap="md">
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.deals.shipping.cancel.back')}
          </Text>
          {refund ? (
            <MoneyText value={refund} size="lg" tone="money" />
          ) : (
            <Text variant="title" color={colors.money.text}>
              {t('marketplace.deals.shipping.cancel.full')}
            </Text>
          )}
        </Box>
      </Card>
    </DealSheetFrame>
  );
};

export const DealShipCancelSheet = memo(DealShipCancelSheetComponent);
