import React from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { useTheme } from '@/core/theme';
import { Box, InlineError, Layout, LayoutFooter, PhoneInput, Text } from '@/shared/ui';
import { useForgotPasswordScreen } from './hooks/useForgotPasswordScreen';

/** Password reset, step 1: where to send the code. */
export const ForgotPasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { control, onSubmit, isSubmitting, apiError } =
    useForgotPasswordScreen();

  return (
    <Layout
      padding={{ y: '3xl' }}
      footer={
        <LayoutFooter
          primary={{
            label: t('auth.passwordReset.phone.submit'),
            onPress: onSubmit,
            loading: isSubmitting,
            testID: 'reset.phone.submit',
          }}
        />
      }
    >
      <Box gap="xl">
        <Controller
          control={control}
          name="phone"
          render={({ field: { ref, value, onChange }, fieldState }) => (
            <Box gap="xs">
              <PhoneInput
                ref={ref}
                label={t('auth.phone')}
                placeholder={t('auth.phonePlaceholder')}
                value={value}
                onChangeText={onChange}
                returnKeyType="send"
                onSubmitEditing={onSubmit}
                error={fieldState.error?.message}
                testID="reset.phone"
              />
              <Text variant="caption" color={colors.text.secondary}>
                {t('auth.passwordReset.phone.hint')}
              </Text>
            </Box>
          )}
        />
        <InlineError error={apiError} testID="reset.phone.error" />
      </Box>
    </Layout>
  );
};
