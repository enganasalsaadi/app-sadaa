import React from 'react';
import { useTranslation } from 'react-i18next';
import { PencilLine } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Layout, LayoutFooter, Pressable, Text } from '@/shared/ui';
import { OtpCodeField } from '../../components/OtpCodeField';
import { useResetOtpScreen } from './hooks/useResetOtpScreen';

/** Password reset, step 2: prove the number is yours. */
export const ResetOtpScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { otp, isVerifying, error, onChangeNumber } = useResetOtpScreen();

  return (
    <Layout
      padding={{ y: '3xl' }}
      footer={
        <LayoutFooter
          primary={{
            label: t('auth.verifyCode'),
            onPress: otp.onSubmit,
            loading: isVerifying,
          }}
        />
      }
    >
      <Box gap="3xl">
        <OtpCodeField otp={otp} error={error?.message} editable={!isVerifying} />

        <Pressable
          onPress={onChangeNumber}
          row
          align="center"
          justify="center"
          gap="sm"
          minHeight={sizes.button.md}
          accessibilityRole="button"
          accessibilityLabel={t('auth.passwordReset.code.changeNumber')}
        >
          <PencilLine size={sizes.icon.sm} color={colors.icon.secondary} />
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('auth.passwordReset.code.changeNumber')}
          </Text>
        </Pressable>
      </Box>
    </Layout>
  );
};
