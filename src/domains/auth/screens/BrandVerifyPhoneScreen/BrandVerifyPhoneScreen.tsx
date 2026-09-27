import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircleWarning } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, ConfirmSheet, Layout, LayoutFooter, Pressable, Text } from '@/shared/ui';
import { OtpCodeField } from '../../components/OtpCodeField';
import { useBrandVerifyPhoneScreen } from './hooks/useBrandVerifyPhoneScreen';

export const BrandVerifyPhoneScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const {
    otp,
    isVerifying,
    error,
    supportVisible,
    openSupport,
    closeSupport,
    onContactSupport,
    supportNumber,
  } = useBrandVerifyPhoneScreen();

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
          onPress={openSupport}
          row
          align="center"
          justify="center"
          gap="sm"
          minHeight={sizes.button.md}
          accessibilityRole="button"
          accessibilityLabel={t('auth.brandOnboarding.phone.wrongNumber.link')}
        >
          <MessageCircleWarning size={sizes.icon.sm} color={colors.icon.secondary} />
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('auth.brandOnboarding.phone.wrongNumber.link')}
          </Text>
        </Pressable>
      </Box>

      <ConfirmSheet
        visible={supportVisible}
        onClose={closeSupport}
        icon={<MessageCircleWarning size={sizes.icon.lg} color={colors.interactive.main} />}
        title={t('auth.brandOnboarding.phone.wrongNumber.title')}
        body={t('auth.brandOnboarding.phone.wrongNumber.body')}
        confirmLabel={t('auth.brandOnboarding.phone.wrongNumber.contact')}
        onConfirm={onContactSupport}
        cancelLabel={t('common.cancel')}
      >
        <Box align="center" py="md" borderRadius="lg" bg={colors.surface.elevated}>
          <Text variant="title" color={colors.text.primary}>
            {supportNumber}
          </Text>
        </Box>
      </ConfirmSheet>
    </Layout>
  );
};
