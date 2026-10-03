import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { moderateScale, motion, useTheme } from '@/core/theme';
import { Box, BrandLogo, Text, useHeroCompact } from '@/shared/ui';

const LOGO_HEIGHT = moderateScale(44);
const heroEntering = FadeIn.duration(motion.duration.base);
const heroExiting = FadeOut.duration(motion.duration.fast);

interface AuthLogoHeroProps {
  /** The brand tagline under the logo (hidden when compact). */
  showTagline?: boolean;
}

/**
 * `HeroSheet` header for auth/entry screens: full logo, or the symbol alone
 * when compact (keyboard open / short screen). Its own component so keyboard
 * show/hide re-renders only the hero, not the sheet.
 */
export const AuthLogoHero: React.FC<AuthLogoHeroProps> = memo(({ showTagline = false }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const compact = useHeroCompact();

  return (
    <Box px="xl" pt={compact ? 'xs' : 'xl'} pb={compact ? 'lg' : '3xl'} align="center" gap="md">
      <Animated.View key={compact ? 'symbol' : 'full'} entering={heroEntering}>
        {compact ? (
          <BrandLogo variant="symbol" height={sizes.icon.lg} surface="brand" />
        ) : (
          <BrandLogo variant="full" height={LOGO_HEIGHT} surface="brand" />
        )}
      </Animated.View>
      {showTagline && !compact ? (
        <Animated.View entering={heroEntering} exiting={heroExiting}>
          <Text variant="body" align="center" color={colors.text.onBrandMuted}>
            {t('common.tagline')}
          </Text>
        </Animated.View>
      ) : null}
    </Box>
  );
});
