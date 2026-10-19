import React, { memo } from 'react';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CustomButton, CustomInput, SheetFrame } from '@/shared/ui';
import { DEAL_DRAFT_KIND_LABEL, DEAL_DRAFT_LIMITS } from '../../../constants/dealDrafts';
import type { DealPinFormValues } from '../../../schemas/dealDraftSchema';
import { formatTimecode } from '../../../utils/dealDrafts';

export interface ReviewPinSheetProps {
  visible: boolean;
  onClose: () => void;
  /** 1-based file number and kind of the pinned file. */
  file: number;
  kind: 'video' | 'image';
  /** `null` = a note on the whole file. */
  atSecond: number | null;
  control: Control<DealPinFormValues>;
  onAdd: () => void;
}

/** One pinned note: at a video second («Note at 0:12») or on the whole file. */
const ReviewPinSheetComponent: React.FC<ReviewPinSheetProps> = ({
  visible,
  onClose,
  file,
  kind,
  atSecond,
  control,
  onAdd,
}) => {
  const { t } = useTranslation();
  return (
    <SheetFrame
      visible={visible}
      onClose={onClose}
      title={
        atSecond === null
          ? t('marketplace.deals.drafts.review.pinSheet.titleWhole', { file })
          : t('marketplace.deals.drafts.review.pinSheet.titleAt', { time: formatTimecode(atSecond) })
      }
      body={t('marketplace.deals.drafts.review.pinSheet.body', { file, kind: t(DEAL_DRAFT_KIND_LABEL[kind]) })}
      footer={<CustomButton title={t('marketplace.deals.drafts.review.pinSheet.add')} size="lg" fullWidth onPress={onAdd} />}
    >
      <Controller
        control={control}
        name="note"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            accessibilityLabel={t('marketplace.deals.drafts.review.pinSheet.placeholder')}
            placeholder={t('marketplace.deals.drafts.review.pinSheet.placeholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={3}
            showCount
            maxLength={DEAL_DRAFT_LIMITS.pinNote}
            error={fieldState.error?.message}
            autoFocus
          />
        )}
      />
    </SheetFrame>
  );
};

export const ReviewPinSheet = memo(ReviewPinSheetComponent);
