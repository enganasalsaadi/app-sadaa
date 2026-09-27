import React from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Clock, Eye } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import {
  Box,
  CustomButton,
  FilePickerCard,
  InlineError,
  Layout, LayoutFooter,
  Text,
} from '@/shared/ui';
import { useBrandKycScreen } from './hooks/useBrandKycScreen';

const BENEFITS = [
  { icon: BadgeCheck, key: 'auth.brandOnboarding.kyc.benefits.badge' },
  { icon: Eye, key: 'auth.brandOnboarding.kyc.benefits.visibility' },
  { icon: Clock, key: 'auth.brandOnboarding.kyc.benefits.review' },
] as const;

export const BrandKycScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const {
    document,
    pickErrorMessage,
    onPick,
    onRemove,
    onUpload,
    onSkip,
    isUploading,
    isSkipping,
    isBusy,
    error,
  } = useBrandKycScreen();

  return (
    <Layout
      padding={{ y: '2xl' }}
      footer={
        <LayoutFooter
          primary={{
            label: t('auth.brandOnboarding.kyc.submit'),
            onPress: onUpload,
            loading: isUploading,
            disabled: !document || isBusy,
          }}
        />
      }
    >
      <Box gap="2xl">
        <Box
          gap="md"
          p="lg"
          borderRadius="lg"
          borderWidth="thin"
          borderColor={colors.border.default}
          bg={colors.surface.elevated}
        >
          <Text variant="title">{t('auth.brandOnboarding.kyc.benefitsTitle')}</Text>
          {BENEFITS.map(({ icon: Icon, key }, index) => (
            <Box key={key} row align="center" gap="md">
              {/* Verified = distinction → the premium mark (icon only, rule 08). */}
              <Icon
                size={sizes.icon.sm}
                color={index === 0 ? colors.premium.main : colors.interactive.main}
              />
              <Box flex={1}>
                <Text variant="bodySmall" color={colors.text.secondary}>
                  {t(key)}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>

        <FilePickerCard
          file={document}
          onPick={onPick}
          onRemove={onRemove}
          title={t('auth.brandOnboarding.kyc.pickDocument')}
          hint={t('auth.brandOnboarding.kyc.pickHint')}
          error={pickErrorMessage}
          disabled={isBusy}
        />

        <InlineError error={error} />

        <Box gap="xs" align="center">
          <CustomButton
            title={t('auth.brandOnboarding.kyc.skip')}
            onPress={onSkip}
            variant="ghost"
            loading={isSkipping}
            disabled={isBusy}
            fullWidth
          />
          <Text variant="caption" color={colors.text.tertiary} align="center">
            {t('auth.brandOnboarding.kyc.skipHint')}
          </Text>
        </Box>
      </Box>
    </Layout>
  );
};
