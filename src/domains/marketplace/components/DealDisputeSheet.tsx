import React, { memo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Flag, LifeBuoy } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, CustomInput, Notice, Text, SheetFrame } from '@/shared/ui';
import { DEAL_DISPUTE_CLOSED_COPY, DEAL_DISPUTE_CLOSED_FALLBACK, DEAL_DISPUTE_LIMITS } from '../constants/dealDispute';
import type { DealDisputeModel } from '../hooks/useDealDispute';
import type { Deal, DealRole } from '../types';
import { DealHoldToSign } from './DealHoldToSign';
import { DealReasonTiles } from './DealReasonTiles';

export interface DealDisputeSheetProps {
  dispute: DealDisputeModel;
  deal: Deal;
  role: DealRole;
}

/**
 * Opening a dispute (M9). It says first what changes (the brand: timers and money freeze; the
 * creator: losing records a strike, with the active count), then the side's own reasons and the
 * statement, then press-and-hold. With the window shut it explains why and offers support instead.
 */
const DealDisputeSheetComponent: React.FC<DealDisputeSheetProps> = ({ dispute, deal, role }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const brand = role === 'brand';
  const other = (brand ? deal.creator.name : deal.brand.name) ?? '';

  if (!dispute.canOpen) {
    const reason = dispute.closedReason;
    return (
      <SheetFrame
        visible={dispute.visible}
        onClose={dispute.close}
        onDismissed={dispute.onDismissed}
        title={t('marketplace.deals.dispute.open.closedTitle')}
        footer={
          <CustomButton
            title={t('marketplace.deals.dispute.open.support')}
            variant="outline"
            size="lg"
            fullWidth
            leftIcon={<LifeBuoy size={sizes.icon.sm} color={colors.interactive.main} />}
            onPress={dispute.goSupport}
          />
        }
      >
        <Notice
          message={t((reason && DEAL_DISPUTE_CLOSED_COPY[reason]) || DEAL_DISPUTE_CLOSED_FALLBACK, {
            count: dispute.disputesLeft,
            remaining: formatNumber(dispute.disputesLeft),
          })}
        />
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('marketplace.deals.dispute.open.closedSupport')}
        </Text>
      </SheetFrame>
    );
  }

  const active = dispute.strikes?.activeCount ?? null;

  return (
    <SheetFrame
      visible={dispute.visible}
      onClose={dispute.close}
      onDismissed={dispute.onDismissed}
      title={t('marketplace.deals.dispute.open.title')}
      body={t(brand ? 'marketplace.deals.dispute.open.bodyBrand' : 'marketplace.deals.dispute.open.bodyCreator')}
      footer={
        <DealHoldToSign
          label={t('marketplace.deals.dispute.open.hold')}
          caption={t('marketplace.deals.dispute.open.holdCaption', { name: other })}
          hint={t('marketplace.deals.respond.hold.hint')}
          accessibilityLabel={t('marketplace.deals.dispute.open.title')}
          accessibilityHint={t('marketplace.deals.respond.hold.a11yHint')}
          tone="danger"
          icon={Flag}
          sending={dispute.sending}
          onComplete={dispute.onConfirm}
        />
      }
    >
      {brand ? (
        <Notice tone="warning" message={t('marketplace.deals.dispute.open.freeze')} />
      ) : (
        <Notice
          tone="danger"
          title={t('marketplace.deals.dispute.open.strikeTitle')}
          message={
            active === null
              ? t('marketplace.deals.dispute.open.strikeBodyPlain')
              : t('marketplace.deals.dispute.open.strikeBody', { count: active, active: formatNumber(active) })
          }
        />
      )}
      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('marketplace.deals.dispute.open.reasonLabel')}
        </Text>
        <Controller
          control={dispute.control}
          name="reason"
          render={({ field: { value, onChange }, fieldState }) => (
            <DealReasonTiles
              reasons={dispute.reasons}
              defs={dispute.reasonDefs}
              value={value}
              onChange={onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      </Box>
      <Controller
        control={dispute.control}
        name="statement"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.deals.dispute.open.statementLabel')}
            placeholder={t('marketplace.deals.dispute.open.statementPlaceholder')}
            hint={t('marketplace.deals.dispute.open.statementHint', {
              count: DEAL_DISPUTE_LIMITS.minStatement,
              min: formatNumber(DEAL_DISPUTE_LIMITS.minStatement),
            })}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={5}
            showCount
            maxLength={DEAL_DISPUTE_LIMITS.maxStatement}
            error={fieldState.error?.message}
          />
        )}
      />
      <Text variant="caption" color={colors.text.tertiary}>
        {t('marketplace.deals.dispute.open.later', { hours: formatNumber(DEAL_DISPUTE_LIMITS.evidenceHours) })}
      </Text>
    </SheetFrame>
  );
};

export const DealDisputeSheet = memo(DealDisputeSheetComponent);
