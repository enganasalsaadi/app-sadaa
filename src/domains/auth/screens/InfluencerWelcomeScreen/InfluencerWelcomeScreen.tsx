import React from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Crown, Tag } from 'lucide-react-native';
import { motion, useTheme } from '@/core/theme';
import { Box, CustomButton, HeroBackdrop, Layout, Text } from '@/shared/ui';
import { CreatorOrbitScene } from '../../components/CreatorOrbitScene';
import { GlassPill } from '../../components/GlassPill';
import { useInfluencerWelcomeScreen } from './hooks/useInfluencerWelcomeScreen';

// Stage is square: width-bound on phones, height-bound on short screens.
const STAGE_WIDTH_RATIO = 0.86;
const STAGE_HEIGHT_RATIO = 0.44;
const enterAt = (order: number) =>
  FadeInDown.delay(motion.duration.slow + order * motion.duration.fast)
    .duration(motion.duration.slow)
    .springify();

export const InfluencerWelcomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const { name, tierLabel, isTopTier, platforms, niches, hasRates, onStart } =
    useInfluencerWelcomeScreen();

  return (
    <Box flex={1} bg={colors.brand.main}>
      <HeroBackdrop />
      <Layout mode="static" surface="transparent" statusBar="light" padding={{ x: '2xl' }}>
        <Box flex={1} justify="center" gap="3xl">
          <CreatorOrbitScene
            size={Math.min(width * STAGE_WIDTH_RATIO, height * STAGE_HEIGHT_RATIO)}
            platforms={platforms}
            niches={niches}
            isTopTier={isTopTier}
          />

          <Box gap="md" align="center">
            <Animated.View entering={enterAt(0)}>
              <Text
                variant="h1"
                align="center"
                color={colors.text.onBrand}
                accessibilityRole="header"
              >
                {name
                  ? t('auth.influencerOnboarding.welcome.titleNamed', { name })
                  : t('auth.influencerOnboarding.welcome.title')}
              </Text>
            </Animated.View>
            <Animated.View entering={enterAt(1)}>
              <Text variant="body" align="center" color={colors.text.onBrandMuted}>
                {t('auth.influencerOnboarding.welcome.subtitle')}
              </Text>
            </Animated.View>
            <Animated.View entering={enterAt(2)}>
              <Box row wrap justify="center" gap="sm">
                {tierLabel ? (
                  <GlassPill
                    icon={isTopTier ? Crown : BadgeCheck}
                    iconColor={isTopTier ? colors.premium.main : colors.glass.iconInteractive}
                    label={t('auth.influencerOnboarding.welcome.tier', { tier: tierLabel })}
                  />
                ) : null}
                <GlassPill
                  icon={Tag}
                  iconColor={colors.glass.iconInteractive}
                  label={
                    hasRates
                      ? t('auth.influencerOnboarding.welcome.ratesSet')
                      : t('auth.influencerOnboarding.welcome.ratesLater')
                  }
                />
              </Box>
            </Animated.View>
          </Box>
        </Box>

        <Animated.View entering={enterAt(3)}>
          <CustomButton
            title={t('auth.influencerOnboarding.welcome.start')}
            variant="onBrand"
            onPress={onStart}
            fullWidth
          />
        </Animated.View>
      </Layout>
    </Box>
  );
};
