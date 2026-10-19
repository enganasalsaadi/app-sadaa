import React, { memo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react-native';
import { CustomInput, Notice, SheetFrame } from '@/shared/ui';
import { isolateText } from '@/shared/utils';
import { DEAL_RETURN_LIMITS } from '../constants/dealReturn';
import type { DealReturnAnswerModel } from '../hooks/useDealReturnAnswer';
import type { Deal } from '../types';
import { DealHoldToSign } from './DealHoldToSign';
import { DealPhotoSlots } from './DealPhotoSlots';

export interface DealReturnIssueSheetProps {
  deal: Deal;
  answer: DealReturnAnswerModel;
}

/**
 * Report a problem with the returned sample (PC9.0 frame 3): what arrived (5–1000 characters) and up
 * to five photos, then a press-and-hold. It goes to Sada's team, adds no automatic penalty for the
 * creator and cannot be edited once sent. The hold checks the note first and gives the button back
 * when something is missing.
 */
const DealReturnIssueSheetComponent: React.FC<DealReturnIssueSheetProps> = ({ deal, answer }) => {
  const { t } = useTranslation();
  const creator = isolateText(deal.creator.name ?? '');
  return (
    <SheetFrame
      visible={answer.sheet === 'issue'}
      onClose={answer.close}
      title={t('marketplace.deals.return.answer.issue.title')}
      body={t('marketplace.deals.return.answer.issue.body', { name: creator })}
      footer={
        <DealHoldToSign
          label={t('marketplace.deals.return.answer.issue.hold')}
          caption={t('marketplace.deals.return.answer.issue.holdCaption')}
          hint={t('marketplace.deals.respond.hold.hint')}
          accessibilityLabel={t('marketplace.deals.return.answer.issue.title')}
          accessibilityHint={t('marketplace.deals.respond.hold.a11yHint')}
          tone="danger"
          icon={ShieldAlert}
          onComplete={answer.onIssue}
        />
      }
    >
      <Controller
        control={answer.issueControl}
        name="note"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.deals.return.answer.issue.noteLabel')}
            placeholder={t('marketplace.deals.return.answer.issue.notePlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={4}
            showCount
            maxLength={DEAL_RETURN_LIMITS.issueNoteMax}
            error={fieldState.error?.message}
          />
        )}
      />
      <DealPhotoSlots
        photos={answer.photos}
        max={DEAL_RETURN_LIMITS.issuePhotos}
        required={false}
        hint={t('marketplace.deals.return.answer.issue.photosHint')}
        error={answer.photosError}
        onPick={answer.pickPhotos}
        onRemove={answer.removePhoto}
      />
      <Notice
        tone="info"
        title={t('marketplace.deals.return.answer.issue.noticeTitle')}
        message={t('marketplace.deals.return.answer.issue.noticeBody')}
      />
    </SheetFrame>
  );
};

export const DealReturnIssueSheet = memo(DealReturnIssueSheetComponent);
