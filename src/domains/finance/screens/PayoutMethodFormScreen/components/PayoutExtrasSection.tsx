import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { Box, CustomInput, FormSection, ListGroup, ListRow, Switch } from '@/shared/ui';
import { PAYOUT_FIELD_LIMITS } from '../../../constants/payoutMethods';
import type { PayoutMethodFormScreenModel } from '../hooks/usePayoutMethodFormScreen';

/** The creator's own name for the method + the primary switch (locked on the first or current primary). */
const PayoutExtrasSectionComponent: React.FC<{ vm: PayoutMethodFormScreenModel }> = ({ vm }) => {
  const { t } = useTranslation();
  const { primary } = vm;

  return (
    <FormSection title={t('finance.payouts.form.extrasSection')}>
      <Box gap="lg">
        <Controller
          control={vm.control}
          name="label"
          render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
            <CustomInput
              ref={ref}
              label={t('finance.payouts.form.label')}
              placeholder={t('finance.payouts.form.labelPlaceholder')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              maxLength={PAYOUT_FIELD_LIMITS.label.max}
              showCount
              hint={t('finance.payouts.form.labelHint')}
              autoComplete="off"
              returnKeyType="done"
              onSubmitEditing={vm.onSave}
              error={fieldState.error?.message}
            />
          )}
        />
        <ListGroup>
          <ListRow
            title={t('finance.payouts.form.primaryTitle')}
            subtitle={primary.caption}
            trailing={
              <Switch
                value={primary.value}
                onValueChange={primary.onToggle}
                disabled={primary.locked || vm.isSaving}
                accessibilityLabel={t('finance.payouts.form.primaryTitle')}
              />
            }
          />
        </ListGroup>
      </Box>
    </FormSection>
  );
};

export const PayoutExtrasSection = memo(PayoutExtrasSectionComponent);
