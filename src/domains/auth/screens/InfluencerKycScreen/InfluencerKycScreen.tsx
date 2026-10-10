import React from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Clock, Handshake } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import {
  Box,
  FilePickerCard,
  InlineError,
  Layout,
  LayoutFooter,
  Text,
} from '@/shared/ui';
import { useInfluencerKycScreen } from './hooks/useInfluencerKycScreen';

const BENEFITS = [
  { icon: BadgeCheck, key: 'auth.influencerOnboarding.kyc.benefits.badge' },
  { icon: Handshake, key: 'auth.influencerOnboarding.kyc.benefits.trust' },
  { icon: Clock, key: 'auth.influencerOnboarding.kyc.benefits.review' },
] as const;

export const InfluencerKycScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const {
    front,
    back,
    canUpload,
    onUpload,
    onSkip,
    isUploading,
    isSkipping,
    isBusy,
    error,
  } = useInfluencerKycScreen();

  return (
    <Layout
      padding={{ y: '2xl' }}
      footer={
        <LayoutFooter
          top={
            <Text variant="caption" align="center" color={colors.text.secondary}>
              {t('auth.influencerOnboarding.kyc.skipHint')}
            </Text>
          }
          primary={{
            label: t('auth.influencerOnboarding.kyc.submit'),
            onPress: onUpload,
            loading: isUploading,
            disabled: !canUpload || isBusy,
          }}
          secondary={{
            label: t('auth.influencerOnboarding.kyc.skip'),
            onPress: onSkip,
            loading: isSkipping,
            disabled: isBusy && !isSkipping,
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
          <Text variant="title">{t('auth.influencerOnboarding.kyc.benefitsTitle')}</Text>
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

        <Box gap="lg">
          <FilePickerCard
            file={front.file}
            onPick={front.onPick}
            onRemove={front.onRemove}
            title={t('auth.influencerOnboarding.kyc.pickFront')}
            hint={t('auth.influencerOnboarding.kyc.pickHint')}
            error={front.error}
            disabled={isBusy}
          />
          <FilePickerCard
            file={back.file}
            onPick={back.onPick}
            onRemove={back.onRemove}
            title={t('auth.influencerOnboarding.kyc.pickBack')}
            hint={t('auth.influencerOnboarding.kyc.pickHint')}
            error={back.error}
            disabled={isBusy}
          />
        </Box>

        <InlineError error={error} />
      </Box>
    </Layout>
  );
};
