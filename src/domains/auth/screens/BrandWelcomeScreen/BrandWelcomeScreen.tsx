import React from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Clock, ShieldCheck } from 'lucide-react-native';
import { motion, useTheme } from '@/core/theme';
import { Box, CustomButton, HeroBackdrop, Layout, Text } from '@/shared/ui';
import { PushPromptSheet } from '../../components/PushPromptSheet';
import { WelcomeEchoCanvas } from '../../components/WelcomeEchoCanvas';
import { useBrandWelcomeScreen } from './hooks/useBrandWelcomeScreen';

const CANVAS_WIDTH_RATIO = 0.82;
const enterAt = (order: number) =>
  FadeInDown.delay(motion.duration.slow + order * motion.duration.fast)
    .duration(motion.duration.slow)
    .springify();

export const BrandWelcomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { width } = useWindowDimensions();
  const { companyName, isUnderReview, onStart, pushPrompt } = useBrandWelcomeScreen();
  const StatusIcon = isUnderReview ? Clock : ShieldCheck;

  return (
    <Box flex={1} bg={colors.brand.main}>
      <HeroBackdrop />
      <Layout
        mode="static"
        surface="transparent"
        statusBar="light"
        padding={{ x: '2xl' }}
      >
        <Box flex={1} justify="center" gap="3xl">
          <WelcomeEchoCanvas size={width * CANVAS_WIDTH_RATIO} />

          <Box gap="md" align="center">
            <Animated.View entering={enterAt(0)}>
              <Text
                variant="h1"
                align="center"
                color={colors.text.onBrand}
                accessibilityRole="header"
              >
                {companyName
                  ? t('auth.brandOnboarding.welcome.titleNamed', { name: companyName })
                  : t('auth.brandOnboarding.welcome.title')}
              </Text>
            </Animated.View>
            <Animated.View entering={enterAt(1)}>
              <Text variant="body" align="center" color={colors.text.onBrandMuted}>
                {t('auth.brandOnboarding.welcome.subtitle')}
              </Text>
            </Animated.View>
            <Animated.View entering={enterAt(2)}>
              <Box
                row
                align="center"
                gap="sm"
                px="md"
                py="sm"
                borderRadius="full"
                bg={colors.glass.badge}
                borderWidth="thin"
                borderColor={colors.glass.border}
              >
                <StatusIcon size={sizes.icon.xs} color={colors.glass.iconInteractive} />
                <Text variant="caption" color={colors.text.onBrand}>
                  {isUnderReview
                    ? t('auth.brandOnboarding.welcome.underReview')
                    : t('auth.brandOnboarding.welcome.verifyLater')}
                </Text>
              </Box>
            </Animated.View>
          </Box>
        </Box>

        <Animated.View entering={enterAt(3)}>
          <CustomButton
            title={t('auth.brandOnboarding.welcome.start')}
            variant="onBrand"
            onPress={onStart}
            fullWidth
          />
        </Animated.View>
      </Layout>
      <PushPromptSheet role="brand" {...pushPrompt} />
    </Box>
  );
};
