import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { Box, CustomButton, HeroBackdrop, Layout, Pressable, Text } from '@/shared/ui';
import { moderateScale, useTheme } from '@/core/theme';
import { CardsCanvas, ProgressSegments } from './components';
import { useOnboardingScreen } from './hooks';

const CANVAS_HEIGHT = moderateScale(380);

export interface OnboardingScreenProps {
  /** Persists `has_seen_onboarding` and moves the app to the auth branch. */
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const { colors, sizes } = useTheme();
  const {
    slide,
    index,
    total,
    isLast,
    swipeGesture,
    ctaLabel,
    skipLabel,
    skipHint,
    progressLabel,
    onNext,
    onSkip,
  } = useOnboardingScreen({ onFinish });

  if (!slide) {
    return null;
  }

  return (
    <Box flex={1} bg={colors.brand.main}>
      <HeroBackdrop />
      <Layout
        withScroll={false}
        keyboardAvoiding={false}
        showEndScreenPadding={false}
        bg={colors.layout.transparent}
        edges={['top', 'bottom', 'left', 'right']}
        statusBarStyle="light"
      >
        <GestureDetector gesture={swipeGesture}>
          <Box flex={1}>
            <Box pt="sm">
              <ProgressSegments current={index} total={total} accessibilityLabel={progressLabel} />
            </Box>

            {/* key remounts the slide so the enter animation replays on every step */}
            <Animated.View key={slide.id} entering={FadeInUp.springify()}>
              <Box pt="3xl" gap="sm" align="center">
                <Box
                  alignSelf="center"
                  bg={colors.glass.badge}
                  borderWidth="thin"
                  borderColor={colors.glass.border}
                  borderRadius="full"
                  px="sm"
                  py="xs"
                >
                  <Text variant="caption" color={colors.glass.iconInteractive}>
                    {slide.audience}
                  </Text>
                </Box>
                <Text variant="h2" align="center" color={colors.text.onBrand} accessibilityRole="header">
                  {slide.title}
                </Text>
                {slide.subtitle ? (
                  <Text variant="body" align="center" color={colors.text.onBrandMuted}>
                    {slide.subtitle}
                  </Text>
                ) : null}
              </Box>
            </Animated.View>

            <Box mt="4xl">
              <CardsCanvas slide={slide} height={CANVAS_HEIGHT} />
            </Box>
          </Box>
        </GestureDetector>

        <Box gap="sm">
          <CustomButton title={ctaLabel} variant="onBrand" onPress={onNext} fullWidth />
          <Pressable
            height={sizes.button.md}
            align="center"
            justify="center"
            onPress={onSkip}
            disabled={isLast}
            opacity={isLast ? 0 : 1}
            accessibilityRole="button"
            accessibilityLabel={skipLabel}
            accessibilityHint={skipHint}
            accessibilityElementsHidden={isLast}
            importantForAccessibility={isLast ? 'no-hide-descendants' : 'auto'}
          >
            <Text variant="bodyMedium" color={colors.text.onBrand}>
              {skipLabel}
            </Text>
          </Pressable>
        </Box>
      </Layout>
    </Box>
  );
};
