import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { Layout } from '@/shared/ui/Layout';
import { Box } from '@/shared/ui/primitives/Box';
import { CustomInput } from '@/shared/ui/CustomInput';
import { useChangePassword } from './hooks/useChangePassword';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';

const ChangePasswordScreenComponent: React.FC = () => {
  const { t } = useTranslation();

  const { form, onSubmit, isLoading } = useChangePassword();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  useHideBottomBar();

  const required = t('validation.required');
  const newPassword = watch('new_password');

  return (
    <Layout
      withGradient={false}
      withScroll
      contentPadding={false}
      screenHeader={{
        title: t('account.changePassword.title'),
        fillStatusBar: true,
      }}
      ctaButton={{
        label: t('account.changePassword.changeBtn'),
        onPress: handleSubmit(onSubmit),
        isLoading,
        disabled: isLoading,
        alwaysSolid: true,
      }}
    >
      <Box px="2xl" pt="lg" pb="6xl" gap="md">
        <Controller
          control={control}
          name="current_password"
          rules={{ required }}
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label={t('account.changePassword.currentPassword')}
              value={value}
              onChangeText={onChange}
              isPassword
              error={errors.current_password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="new_password"
          rules={{
            required,
            minLength: {
              value: 8,
              message: t('validation.minLength', { count: 8 }),
            },
          }}
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label={t('account.changePassword.newPassword')}
              value={value}
              onChangeText={onChange}
              isPassword
              error={errors.new_password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirm_password"
          rules={{
            required,
            validate: val =>
              val === newPassword || t('validation.passwordMismatch'),
          }}
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label={t('account.changePassword.confirmPassword')}
              value={value}
              onChangeText={onChange}
              isPassword
              error={errors.confirm_password?.message}
            />
          )}
        />
      </Box>
    </Layout>
  );
};

export const ChangePasswordScreen = memo(ChangePasswordScreenComponent);
