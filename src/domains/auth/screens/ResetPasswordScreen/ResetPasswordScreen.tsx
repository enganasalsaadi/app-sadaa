import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { Box, CustomInput, InlineError, Layout, LayoutFooter } from '@/shared/ui';
import { PasswordStrengthMeter } from '../../components/PasswordStrengthMeter';
import type { NewPasswordFormValues } from '../../schemas';
import { useResetPasswordScreen } from './hooks/useResetPasswordScreen';

// Subscribes to the password alone, so typing it doesn't re-render the form.
const WatchedPasswordStrength: React.FC<{ control: Control<NewPasswordFormValues> }> =
  memo(({ control }) => {
    const password = useWatch({ control, name: 'password' });
    return <PasswordStrengthMeter password={password} />;
  });

/** Password reset, step 3: the new password. */
export const ResetPasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const { control, setFocus, onSubmit, isSubmitting, apiError } = useResetPasswordScreen();

  return (
    <Layout
      padding={{ y: '3xl' }}
      footer={
        <LayoutFooter
          primary={{
            label: t('auth.passwordReset.password.submit'),
            onPress: onSubmit,
            loading: isSubmitting,
          }}
        />
      }
    >
      <Box gap="xl">
        <Controller
          control={control}
          name="password"
          render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
            <Box gap="sm">
              <CustomInput
                ref={ref}
                label={t('auth.passwordReset.password.label')}
                placeholder={t('auth.passwordReset.password.placeholder')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                isPassword
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="newPassword"
                autoComplete="new-password"
                returnKeyType="next"
                onSubmitEditing={() => setFocus('passwordConfirmation')}
                error={fieldState.error?.message}
              />
              <WatchedPasswordStrength control={control} />
            </Box>
          )}
        />
        <Controller
          control={control}
          name="passwordConfirmation"
          render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
            <CustomInput
              ref={ref}
              label={t('auth.passwordReset.password.confirmLabel')}
              placeholder={t('auth.passwordReset.password.placeholder')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              isPassword
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={onSubmit}
              error={fieldState.error?.message}
            />
          )}
        />
        <InlineError error={apiError} />
      </Box>
    </Layout>
  );
};
