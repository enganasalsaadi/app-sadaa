import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller } from 'react-hook-form';
import { useTheme, moderateScale } from '@/core/theme';
import { Layout, LayoutFooter } from '@/shared/ui/Layout';
import { Box } from '@/shared/ui/primitives/Box';
import { Text } from '@/shared/ui/primitives/Text';
import { CustomInput } from '@/shared/ui/CustomInput';
import { useEditAccount } from './hooks/useEditAccount';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';

const EditAccountScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { form, onSubmit, isLoading, user } = useEditAccount();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const required = t('validation.required');

  useHideBottomBar();
  return (
    <Layout
      padding={{ x: '2xl' }}
      header={{ title: t('account.editAccount.title') }}
      footer={
        <LayoutFooter
          primary={{
            label: t('common.save'),
            onPress: handleSubmit(onSubmit),
            loading: isLoading,
          }}
        />
      }
    >
      <Box gap="md">
        <Controller
          control={control}
          name="full_name"
          rules={{ required }}
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label={t('account.editAccount.fullName')}
              value={value}
              onChangeText={onChange}
              error={errors.full_name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          rules={{ required }}
          render={({ field: { onChange, value } }) => (
            <CustomInput
              label={t('account.editAccount.phone')}
              value={value}
              onChangeText={onChange}
              keyboardType="phone-pad"
              error={errors.phone?.message}
            />
          )}
        />

        {/* Email — read-only (mirrors the web form) */}
        <Box>
          <Text variant="bodySmall" color={colors.form.input.label} mb="xs">
            {t('account.editAccount.email')}
          </Text>
          <Box
            px="lg"
            py="md"
            borderRadius="lg"
            bg={colors.surface.elevated}
            minHeight={moderateScale(48)}
            justify="center"
          >
            <Text variant="body" color={colors.text.tertiary}>
              {user?.email || '—'}
            </Text>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export const EditAccountScreen = memo(EditAccountScreenComponent);
