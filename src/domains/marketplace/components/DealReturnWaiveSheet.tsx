import React, { memo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Gift } from 'lucide-react-native';
import { CustomInput, Notice } from '@/shared/ui';
import { isolateText } from '@/shared/utils';
import { DEAL_RETURN_LIMITS } from '../constants/dealReturn';
import type { DealReturnAnswerModel } from '../hooks/useDealReturnAnswer';
import type { Deal } from '../types';
import { DealHoldToSign } from './DealHoldToSign';
import { DealSheetFrame } from './DealSheetFrame';

export interface DealReturnWaiveSheetProps {
  deal: Deal;
  answer: DealReturnAnswerModel;
}

/**
 * Let the sample go (PC9.0 frame 4): the creator keeps it and is unlocked at once; an optional
 * reason (≤ 500) reaches them on the return ticket. Only before receipt is confirmed. A
 * press-and-hold: there is no taking it back.
 */
const DealReturnWaiveSheetComponent: React.FC<DealReturnWaiveSheetProps> = ({ deal, answer }) => {
  const { t } = useTranslation();
  const creator = isolateText(deal.creator.name ?? '');
  return (
    <DealSheetFrame
      visible={answer.sheet === 'waive'}
      onClose={answer.close}
      title={t('marketplace.deals.return.answer.waive.title')}
      body={t('marketplace.deals.return.answer.waive.body', { name: creator })}
      footer={
        <DealHoldToSign
          label={t('marketplace.deals.return.answer.waive.hold')}
          caption={t('marketplace.deals.return.answer.waive.holdCaption', { name: creator })}
          hint={t('marketplace.deals.respond.hold.hint')}
          accessibilityLabel={t('marketplace.deals.return.answer.waive.title')}
          accessibilityHint={t('marketplace.deals.respond.hold.a11yHint')}
          tone="danger"
          icon={Gift}
          onComplete={answer.onWaive}
        />
      }
    >
      <Notice
        tone="info"
        title={t('marketplace.deals.return.answer.waive.noticeTitle')}
        message={t('marketplace.deals.return.answer.waive.noticeBody', { name: creator })}
      />
      <Controller
        control={answer.waiveControl}
        name="note"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.deals.return.answer.waive.noteLabel')}
            placeholder={t('marketplace.deals.return.answer.waive.notePlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={3}
            showCount
            maxLength={DEAL_RETURN_LIMITS.waiveNote}
            error={fieldState.error?.message}
          />
        )}
      />
    </DealSheetFrame>
  );
};

export const DealReturnWaiveSheet = memo(DealReturnWaiveSheetComponent);
