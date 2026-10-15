import React, { memo } from 'react';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, CustomInput, Text } from '@/shared/ui';
import type { DealReasonDef } from '../constants/dealChanges';
import { DEAL_RESPOND_LIMITS } from '../constants/dealOffer';
import type { DealReasonFormValues } from '../schemas/dealCancelSchema';
import { DealReasonTiles } from './DealReasonTiles';

export interface DealReasonFieldsProps {
  control: Control<DealReasonFormValues>;
  reasons: readonly string[];
  defs: Readonly<Record<string, DealReasonDef>>;
}

/** «Reason» tiles and an optional note: the body of every M8 reason sheet. */
const DealReasonFieldsComponent: React.FC<DealReasonFieldsProps> = ({ control, reasons, defs }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <>
      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('marketplace.deals.changes.reasonLabel')}
        </Text>
        <Controller
          control={control}
          name="reason"
          render={({ field: { value, onChange }, fieldState }) => (
            <DealReasonTiles
              reasons={reasons}
              defs={defs}
              value={value}
              onChange={onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      </Box>
      <Controller
        control={control}
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
    </>
  );
};

export const DealReasonFields = memo(DealReasonFieldsComponent);
