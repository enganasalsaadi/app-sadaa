import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleX, Gavel } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import type { Money } from '@/core/money';
import { useTheme } from '@/core/theme';
import { Box, Countdown, CustomButton, MoneyText, Notice, Text } from '@/shared/ui';
import type { DealCancelModel } from '../hooks/useDealCancel';
import type { Deal } from '../types';
import { DealHoldToSign } from './DealHoldToSign';
import { DealReasonFields } from './DealReasonFields';
import { DealSettlementBar } from './DealSettlementBar';
import { DealSheetFrame } from './DealSheetFrame';

export interface DealCancelSheetProps {
  cancel: DealCancelModel;
  deal: Deal;
}

/**
 * The brand ending a running deal (M8), on the server's current terms: «التسوية» shows where the
 * held money goes (wallet, compensation, fee), then a reason and a press-and-hold. Dispute-only
 * terms explain why there is no button (the dispute flow ships with P9.1). New terms arriving
 * mid-sheet show the old and new compensation before the brand confirms again.
 */
const DealCancelSheetComponent: React.FC<DealCancelSheetProps> = ({ cancel, deal }) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const { terms, changedFrom } = cancel;
  const outcomeKey = terms?.outcome.key ?? null;
  const signable = outcomeKey === 'free' || outcomeKey === 'kill_fee';
  const name = deal.creator.name ?? '';
  const fee: Money | null = terms?.killFee ?? null;
  const changedTo: Money = fee ?? { amount: 0, currency: deal.total.currency };

  const footer = signable ? (
    <DealHoldToSign
      label={
        outcomeKey === 'kill_fee' && fee
          ? t('marketplace.deals.changes.cancel.holdPay', { amount: formatMoney(fee, i18n.language) })
          : t('marketplace.deals.changes.cancel.holdFree')
      }
      caption={t(
        outcomeKey === 'kill_fee'
          ? 'marketplace.deals.changes.cancel.captionPay'
          : 'marketplace.deals.changes.cancel.captionFree',
      )}
      hint={t('marketplace.deals.respond.hold.hint')}
      accessibilityLabel={t('marketplace.deals.changes.cancel.title')}
      accessibilityHint={t('marketplace.deals.respond.hold.a11yHint')}
      tone="danger"
      icon={CircleX}
      onComplete={cancel.onConfirm}
    />
  ) : (
    <CustomButton
      title={t('marketplace.deals.changes.cancel.back')}
      variant="secondary"
      size="lg"
      fullWidth
      onPress={cancel.close}
    />
  );

  return (
    <DealSheetFrame
      visible={cancel.visible}
      onClose={cancel.close}
      onDismissed={cancel.onDismissed}
      title={t('marketplace.deals.changes.cancel.title')}
      body={t('marketplace.deals.changes.cancel.body', { name })}
      footer={footer}
    >
      {changedFrom ? (
        <Notice
          tone="warning"
          title={t('marketplace.deals.changes.cancel.changedTitle')}
          message={t('marketplace.deals.changes.cancel.changedBody', {
            from: formatMoney(changedFrom, i18n.language),
            to: formatMoney(changedTo, i18n.language),
          })}
        />
      ) : null}
      {signable && terms ? (
        <>
          <DealSettlementBar
            held={deal.total}
            outcomeLabel={terms.outcome.label}
            parts={cancel.parts}
            creatorName={name}
          />
          {outcomeKey === 'free' ? (
            <Box gap="sm" align="flex-start">
              {terms.freeUntil ? (
                <Countdown
                  endsAt={terms.freeUntil}
                  label={t('marketplace.deals.changes.cancel.freeFor')}
                  size="sm"
                />
              ) : null}
              <Text variant="bodySmall" color={colors.text.secondary}>
                {t('marketplace.deals.changes.cancel.freeBody', { name })}
              </Text>
            </Box>
          ) : null}
          <DealReasonFields control={cancel.control} reasons={cancel.reasons} defs={cancel.reasonDefs} />
        </>
      ) : (
        <Box p="lg" gap="md" bg={colors.surface.main} borderRadius="xl" shadow="card">
          <Box row gap="md" align="center">
            <Gavel size={sizes.icon.lg} color={colors.icon.secondary} />
            <Box flex={1}>
              <Text variant="bodyMedium" color={colors.text.primary}>
                {t('marketplace.deals.changes.cancel.disputeTitle')}
              </Text>
            </Box>
          </Box>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.deals.changes.cancel.disputeBody')}
          </Text>
          <Box row align="center" justify="space-between" gap="md">
            <Box flex={1} gap="xs">
              <Text variant="label" color={colors.text.secondary}>
                {t('marketplace.deals.changes.cancel.disputeHeld')}
              </Text>
              <Text variant="caption" color={colors.text.tertiary}>
                {t('marketplace.deals.changes.cancel.disputeHeldCaption')}
              </Text>
            </Box>
            <MoneyText value={deal.total} size="lg" />
          </Box>
        </Box>
      )}
    </DealSheetFrame>
  );
};

export const DealCancelSheet = memo(DealCancelSheetComponent);
