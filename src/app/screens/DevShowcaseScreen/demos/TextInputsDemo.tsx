import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react-native';
import type { CountryCode } from 'libphonenumber-js';
import { Box, Text, Card, CustomInput, PhoneInput } from '@/shared/ui';
import { useTheme } from '@/core/theme';

interface InputsSectionProps {
  defaultValue: string;
  onChangeDefault: (value: string) => void;
  focusValue: string;
  onChangeFocus: (value: string) => void;
  errorValue: string;
  onChangeError: (value: string) => void;
  searchValue: string;
  onChangeSearch: (value: string) => void;
  phoneValue: string;
  onChangePhone: (value: string) => void;
  phoneCountry: CountryCode;
  onChangePhoneCountry: (code: CountryCode) => void;
}

const InputsSectionComponent: React.FC<InputsSectionProps> = ({
  defaultValue,
  onChangeDefault,
  focusValue,
  onChangeFocus,
  errorValue,
  onChangeError,
  searchValue,
  onChangeSearch,
  phoneValue,
  onChangePhone,
  phoneCountry,
  onChangePhoneCountry,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Card>
      <Box gap="lg">
        <Text variant="title">{t('devShowcase.sections.inputs')}</Text>

        <CustomInput
          label={t('devShowcase.inputs.defaultLabel')}
          placeholder={t('devShowcase.inputs.defaultPlaceholder')}
          value={defaultValue}
          onChangeText={onChangeDefault}
        />

        <CustomInput
          label={t('devShowcase.inputs.focusLabel')}
          placeholder={t('devShowcase.inputs.focusPlaceholder')}
          value={focusValue}
          onChangeText={onChangeFocus}
        />

        <CustomInput
          label={t('devShowcase.inputs.errorLabel')}
          placeholder={t('devShowcase.inputs.errorPlaceholder')}
          value={errorValue}
          onChangeText={onChangeError}
          error={t('devShowcase.inputs.errorMessage')}
        />

        <CustomInput
          label={t('devShowcase.inputs.searchLabel')}
          placeholder={t('devShowcase.inputs.searchPlaceholder')}
          value={searchValue}
          onChangeText={onChangeSearch}
          leftIcon={
            <Search color={colors.icon.secondary} size={sizes.icon.sm} />
          }
          returnKeyType="search"
        />

        <PhoneInput
          label={t('devShowcase.inputs.phoneLabel')}
          placeholder={t('devShowcase.inputs.phonePlaceholder')}
          value={phoneValue}
          onChangeText={onChangePhone}
          countryCode={phoneCountry}
          onChangeCountry={onChangePhoneCountry}
        />
      </Box>
    </Card>
  );
};

export const InputsSection = memo(InputsSectionComponent);
