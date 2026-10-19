import React, { memo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react-native';
import { CustomInput, Notice, SheetFrame } from '@/shared/ui';
import { isolateText } from '@/shared/utils';
import { DEAL_RESPOND_LIMITS } from '../constants/dealOffer';
import type { DealBriefExitModel } from '../hooks/useDealBriefExit';
import type { Deal } from '../types';
import { DealHoldToSign } from './DealHoldToSign';

export interface DealBriefExitSheetProps {
  exit: DealBriefExitModel;
  deal: Deal;
}

/**
 * Leaving a linked deal after reading its brief (PC6.2). It says what the exit is — no strike, the
 * brand refunded in full, the seat back to the campaign — then asks for an optional note and a
 * press-and-hold. Binding, so no tap or slide.
 */
const DealBriefExitSheetComponent: React.FC<DealBriefExitSheetProps> = ({ exit, deal }) => {
  const { t } = useTranslation();
  const name = isolateText(deal.brand.name ?? '');
  return (
    <SheetFrame
      visible={exit.visible}
      onClose={exit.close}
      title={t('marketplace.deals.briefExit.sheet.title')}
      body={t('marketplace.deals.briefExit.sheet.body', { name })}
      footer={
        <DealHoldToSign
          label={t('marketplace.deals.briefExit.sheet.hold')}
          caption={t('marketplace.deals.briefExit.sheet.holdCaption', { name })}
          hint={t('marketplace.deals.respond.hold.hint')}
          accessibilityLabel={t('marketplace.deals.briefExit.sheet.title')}
          accessibilityHint={t('marketplace.deals.respond.hold.a11yHint')}
          tone="danger"
          icon={LogOut}
          onComplete={exit.onConfirm}
        />
      }
    >
      <Notice
        tone="success"
        title={t('marketplace.deals.briefExit.sheet.cleanTitle')}
        message={t('marketplace.deals.briefExit.sheet.cleanBody')}
      />
      <Controller
        control={exit.control}
        name="note"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.deals.changes.noteLabel')}
            placeholder={t('marketplace.deals.changes.notePlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={3}
            showCount
            maxLength={DEAL_RESPOND_LIMITS.maxNoteLength}
            error={fieldState.error?.message}
          />
        )}
      />
    </SheetFrame>
  );
};

export const DealBriefExitSheet = memo(DealBriefExitSheetComponent);
