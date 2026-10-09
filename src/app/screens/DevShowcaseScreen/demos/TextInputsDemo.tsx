import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PHONE_COUNTRY } from '@/core/config';
import { Box, CustomInput, PhoneInput } from '@/shared/ui';
import { useTextInputsDemo } from './hooks/useTextInputsDemo';

const MULTILINE_LINES = 4;
const BIO_MAX_LENGTH = 160;

const TextInputsDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const demo = useTextInputsDemo();

  return (
    <Box gap="lg">
      <CustomInput
        label={t('devShowcase.inputs.defaultLabel')}
        placeholder={t('devShowcase.inputs.defaultPlaceholder')}
        value={demo.defaultValue}
        onChangeText={demo.setDefaultValue}
      />

      <CustomInput
        label={t('devShowcase.inputs.errorLabel')}
        placeholder={t('devShowcase.inputs.errorPlaceholder')}
        value={demo.errorValue}
        onChangeText={demo.setErrorValue}
        error={t('devShowcase.inputs.errorMessage')}
      />

      <CustomInput
        label={t('devShowcase.inputs.hintLabel')}
        placeholder={t('devShowcase.inputs.hintPlaceholder')}
        value={demo.hintValue}
        onChangeText={demo.setHintValue}
        hint={t('devShowcase.inputs.hintText')}
      />

      <CustomInput
        label={t('devShowcase.inputs.hintSuccessLabel')}
        value={t('devShowcase.inputs.hintSuccessValue')}
        hint={t('devShowcase.inputs.hintSuccessText')}
        hintTone="success"
        editable={false}
      />

      <CustomInput
        label={t('devShowcase.inputs.disabledLabel')}
        value={t('devShowcase.inputs.disabledValue')}
        editable={false}
      />

      <CustomInput
        label={t('devShowcase.inputs.passwordLabel')}
        placeholder={t('devShowcase.inputs.passwordPlaceholder')}
        value={demo.secureValue}
        onChangeText={demo.setSecureValue}
        isPassword
      />

      <CustomInput
        label={t('devShowcase.inputs.multilineLabel')}
        placeholder={t('devShowcase.inputs.multilinePlaceholder')}
        value={demo.multilineValue}
        onChangeText={demo.setMultilineValue}
        multiline
        numberOfLines={MULTILINE_LINES}
      />

      <CustomInput
        label={t('devShowcase.inputs.counterLabel')}
        placeholder={t('devShowcase.inputs.counterPlaceholder')}
        value={demo.bioValue}
        onChangeText={demo.setBioValue}
        multiline
        numberOfLines={MULTILINE_LINES}
        maxLength={BIO_MAX_LENGTH}
        showCount
      />

      <PhoneInput
        label={t('devShowcase.inputs.phoneLabel')}
        placeholder={t('devShowcase.inputs.phonePlaceholder')}
        value={demo.phoneValue}
        onChangeText={demo.setPhoneValue}
        countryCode={demo.phoneCountry}
        onChangeCountry={demo.setPhoneCountry}
      />

      <PhoneInput
        label={t('devShowcase.inputs.phoneLockedLabel')}
        placeholder={t('devShowcase.inputs.phoneLockedPlaceholder')}
        value={demo.lockedPhoneValue}
        onChangeText={demo.setLockedPhoneValue}
        countryCode={DEFAULT_PHONE_COUNTRY}
        onChangeCountry={demo.ignoreCountry}
        countryLocked
      />
    </Box>
  );
};

export const TextInputsDemo = memo(TextInputsDemoComponent);
