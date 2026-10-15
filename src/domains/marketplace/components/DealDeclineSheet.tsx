import React, { memo } from 'react';
import { Controller, useWatch, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, CustomInput, Text } from '@/shared/ui';
import { DEAL_DECLINE_REASON_DEF } from '../constants/dealRespond';
import { DEAL_RESPOND_LIMITS } from '../constants/dealOffer';
import type { DealDeclineFormValues } from '../schemas/dealRespondSchema';
import { DEAL_DECLINE_REASON } from '../types';
import { DealReasonTiles } from './DealReasonTiles';
import { DealSheetFrame } from './DealSheetFrame';

export interface DealDeclineSheetProps {
  visible: boolean;
  onClose: () => void;
  brandName: string;
  control: Control<DealDeclineFormValues>;
  onSubmit: () => void;
  submitting: boolean;
}

/** The note field only exists for «other»; it watches the reason so the tiles don't re-render on typing. */
const OtherNote = memo<{ control: Control<DealDeclineFormValues> }>(
  ({ control }) => {
    const { t } = useTranslation();
    const reason = useWatch({ control, name: 'reason' });
    if (reason !== 'other') return null;
    return (
      <Controller
        control={control}
        name="note"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.deals.respond.decline.noteLabel')}
            placeholder={t('marketplace.deals.respond.decline.notePlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={3}
            showCount
            maxLength={DEAL_RESPOND_LIMITS.maxNoteLength}
            error={fieldState.error?.message}
            autoFocus
          />
        )}
      />
    );
  },
);

/**
 * Turning an offer down: four reason tiles (a tap picks one), «other» asks a few words; sent
 * as is, no second confirm. Declining before accepting records no strike.
 */
const DealDeclineSheetComponent: React.FC<DealDeclineSheetProps> = ({
  visible,
  onClose,
  brandName,
  control,
  onSubmit,
  submitting,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <DealSheetFrame
      visible={visible}
      onClose={onClose}
      title={t('marketplace.deals.respond.decline.title')}
      body={t('marketplace.deals.respond.decline.body', { name: brandName })}
      footer={
        <CustomButton
          title={t('marketplace.deals.respond.decline.submit')}
          variant="danger"
          size="lg"
          fullWidth
          loading={submitting}
          onPress={onSubmit}
        />
      }
    >
      <Controller
        control={control}
        name="reason"
        render={({ field: { value, onChange }, fieldState }) => (
          <DealReasonTiles
            reasons={DEAL_DECLINE_REASON}
            defs={DEAL_DECLINE_REASON_DEF}
            value={value}
            onChange={onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <OtherNote control={control} />
      <Box
        row
        gap="sm"
        align="center"
        p="md"
        bg={colors.surface.main}
        borderRadius="md"
      >
        <Info size={sizes.icon.sm} color={colors.icon.secondary} />
        <Box flex={1}>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.deals.respond.decline.noStrike')}
          </Text>
        </Box>
      </Box>
    </DealSheetFrame>
  );
};

export const DealDeclineSheet = memo(DealDeclineSheetComponent);
