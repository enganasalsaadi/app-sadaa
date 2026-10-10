import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { Globe, Mail } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomInput, Notice, Text } from '@/shared/ui';
import { VERIFICATION_FIELD_MAX_LENGTH } from '../../../constants/verification';
import type { DomainEmailFormModel } from '../hooks/useDomainEmailScreen';

/** Board 7: domain + an email on it; public providers are refused before and by the server. */
const DomainEmailFormComponent: React.FC<{ form: DomainEmailFormModel }> = ({
  form,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box gap="2xl">
      <Box gap="sm">
        <Text variant="h2">{t('account.verification.domain.form.heading')}</Text>
        <Text variant="body" color={colors.text.secondary}>
          {t('account.verification.domain.form.subtitle')}
        </Text>
      </Box>
      <Box gap="lg">
        <Controller
          control={form.control}
          name="domain"
          render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
            <CustomInput
              ref={ref}
              label={t('account.verification.domain.form.domainLabel')}
              placeholder={t('account.verification.domain.form.domainPlaceholder')}
              value={value}
              onChangeText={onChange}
              onBlur={() => {
                onBlur();
                form.onDomainBlur();
              }}
              error={fieldState.error?.message}
              hint={t('account.verification.domain.form.domainHint')}
              leftIcon={<Globe size={sizes.icon.sm} />}
              keyboardType="url"
              textContentType="URL"
              autoComplete="url"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={form.focusEmail}
              maxLength={VERIFICATION_FIELD_MAX_LENGTH}
            />
          )}
        />
        <Controller
          control={form.control}
          name="email"
          render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
            <CustomInput
              ref={ref}
              label={t('account.verification.domain.form.emailLabel')}
              placeholder={t('account.verification.domain.form.emailPlaceholder')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              leftIcon={<Mail size={sizes.icon.sm} />}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={form.onSubmit}
              maxLength={VERIFICATION_FIELD_MAX_LENGTH}
            />
          )}
        />
      </Box>
      <Notice tone="info" message={t('account.verification.domain.form.publicNotice')} />
    </Box>
  );
};

export const DomainEmailForm = memo(DomainEmailFormComponent);
