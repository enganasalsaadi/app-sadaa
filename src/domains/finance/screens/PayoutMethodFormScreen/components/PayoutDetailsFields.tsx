import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import type { TextInputProps } from 'react-native';
import { Controller } from 'react-hook-form';
import { DEFAULT_PHONE_COUNTRY } from '@/core/config';
import { Box, ChipGroup, CustomInput, FormSection, PhoneInput } from '@/shared/ui';
import { PAYOUT_FIELD_LIMITS, type PayoutField } from '../../../constants/payoutMethods';
import type { PayoutMethodFormScreenModel } from '../hooks/usePayoutMethodFormScreen';

type InputField = Exclude<PayoutField, 'phone' | 'governorate'>;

interface InputDef {
  label: ParseKeys;
  placeholder: ParseKeys;
  maxLength: number;
  hint?: ParseKeys;
  input: Pick<TextInputProps, 'autoComplete' | 'textContentType' | 'autoCapitalize' | 'autoCorrect'>;
}

const INPUT_DEF = {
  holderName: {
    label: 'finance.payouts.form.holderName',
    placeholder: 'finance.payouts.form.holderNamePlaceholder',
    maxLength: PAYOUT_FIELD_LIMITS.holderName.max,
    input: { autoComplete: 'name', textContentType: 'name', autoCapitalize: 'words' },
  },
  city: {
    label: 'finance.payouts.form.city',
    placeholder: 'finance.payouts.form.cityPlaceholder',
    maxLength: PAYOUT_FIELD_LIMITS.city.max,
    input: { autoComplete: 'off', textContentType: 'addressCity' },
  },
  bankName: {
    label: 'finance.payouts.form.bankName',
    placeholder: 'finance.payouts.form.bankNamePlaceholder',
    maxLength: PAYOUT_FIELD_LIMITS.bankName.max,
    input: { autoComplete: 'off', textContentType: 'organizationName' },
  },
  accountNumber: {
    label: 'finance.payouts.form.accountNumber',
    placeholder: 'finance.payouts.form.accountNumberPlaceholder',
    // Room for the spaces people type between groups; stripped before sending.
    maxLength: PAYOUT_FIELD_LIMITS.accountNumber.max * 2,
    input: { autoComplete: 'off', textContentType: 'none', autoCapitalize: 'characters', autoCorrect: false },
  },
  iban: {
    label: 'finance.payouts.form.iban',
    placeholder: 'finance.payouts.form.ibanPlaceholder',
    maxLength: PAYOUT_FIELD_LIMITS.iban.max + Math.ceil(PAYOUT_FIELD_LIMITS.iban.max / 4),
    hint: 'finance.payouts.form.ibanHint',
    input: { autoComplete: 'off', textContentType: 'none', autoCapitalize: 'characters', autoCorrect: false },
  },
} as const satisfies Record<InputField, InputDef>;

// Payout phones are Syrian only: the field shows +963 without a picker.
const ignoreCountry = () => undefined;

interface FieldProps {
  vm: PayoutMethodFormScreenModel;
  field: InputField;
}

const InputFieldRow = memo<FieldProps>(({ vm, field }) => {
  const { t } = useTranslation();
  const def: InputDef = INPUT_DEF[field];
  const hint = field === 'holderName' ? vm.holderHint : def.hint ? t(def.hint) : undefined;
  const { focusNext } = vm;
  const next = useCallback(() => focusNext(field), [field, focusNext]);

  return (
    <Controller
      control={vm.control}
      name={field}
      render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
        <CustomInput
          ref={ref}
          label={t(def.label)}
          placeholder={t(def.placeholder)}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          maxLength={def.maxLength}
          {...def.input}
          hint={hint}
          returnKeyType="next"
          onSubmitEditing={next}
          error={fieldState.error?.message}
        />
      )}
    />
  );
});

const PhoneField = memo<{ vm: PayoutMethodFormScreenModel }>(({ vm }) => {
  const { t } = useTranslation();
  const { focusNext } = vm;
  const next = useCallback(() => focusNext('phone'), [focusNext]);
  return (
    <Controller
      control={vm.control}
      name="phone"
      render={({ field: { ref, value, onChange }, fieldState }) => (
        <PhoneInput
          ref={ref}
          label={t('finance.payouts.form.phone')}
          placeholder={t('finance.payouts.form.phonePlaceholder')}
          value={value}
          onChangeText={onChange}
          countryCode={DEFAULT_PHONE_COUNTRY}
          onChangeCountry={ignoreCountry}
          countryLocked
          returnKeyType="next"
          onSubmitEditing={next}
          error={fieldState.error?.message}
        />
      )}
    />
  );
});

const GovernorateField = memo<{ vm: PayoutMethodFormScreenModel }>(({ vm }) => {
  const { t } = useTranslation();
  return (
    <Controller
      control={vm.control}
      name="governorate"
      render={({ field: { value, onChange }, fieldState }) => (
        <FormSection
          title={t('finance.payouts.form.governorate')}
          description={t('finance.payouts.form.governorateHint')}
          error={fieldState.error?.message}
        >
          <ChipGroup
            items={vm.governorates.items}
            value={value || null}
            onChange={onChange}
            loading={vm.governorates.isLoading}
            skeletonCount={8}
            disabled={vm.isSaving}
            accessibilityLabel={t('finance.payouts.form.governorate')}
          />
        </FormSection>
      )}
    />
  );
});

/** The picked channel's details in handoff order; Next moves on to the label below. */
const PayoutDetailsFieldsComponent: React.FC<{ vm: PayoutMethodFormScreenModel }> = ({ vm }) => (
  <FormSection title={vm.sectionTitle}>
    <Box gap="lg">
      {vm.fields.map(field => {
        switch (field) {
          case 'phone':
            return <PhoneField key={field} vm={vm} />;
          case 'governorate':
            return <GovernorateField key={field} vm={vm} />;
          default:
            return <InputFieldRow key={field} vm={vm} field={field} />;
        }
      })}
    </Box>
  </FormSection>
);

export const PayoutDetailsFields = memo(PayoutDetailsFieldsComponent);
