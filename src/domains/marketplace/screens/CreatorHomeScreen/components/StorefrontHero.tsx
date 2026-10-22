import React, { memo, useCallback } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text, TierBadge, useHeroCompact, useLayoutScrollY } from '@/shared/ui';
import type { MediaKitCardModel } from '@/domains/identity';
import type { CreatorHomeScreenModel } from '../hooks/useCreatorHomeScreen';
import { HeroAvatar } from './HeroAvatar';
import { HeroPulse } from './HeroPulse';
import { SharePass } from './SharePass';

/** The content is gone once the body has climbed this share of the hero. */
const FADE_SHARE = 0.8;
/** While it fades, the content sinks a little further and shrinks toward the top. */
const SINK = moderateScale(46);
const SHRINK = 0.08;

interface StorefrontHeroProps {
  hero: CreatorHomeScreenModel['hero'];
  kpis: CreatorHomeScreenModel['kpis'];
  mediaKit: MediaKitCardModel;
  onOpenProfile: () => void;
  onOpenPreview: () => void;
  onOpenInsights: () => void;
}

/**
 * Creator Home hero (approved 2026-10-22, v3). Layout paints the live navy and its lights behind
 * it and slides the body over it as a sheet with rounded shoulders; nothing in the body ever
 * floats over the hero. Inside: who the creator is (the bell is the header's), their link with
 * copy / preview / share, and the last 30 days. As the sheet climbs, the content sinks and fades
 * behind it; the header's pinned bar (identity + share + bell) takes over at the top.
 */
const StorefrontHeroComponent: React.FC<StorefrontHeroProps> = ({
  hero,
  kpis,
  mediaKit,
  onOpenProfile,
  onOpenPreview,
  onOpenInsights,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { top } = useSafeAreaInsets();
  const compact = useHeroCompact();
  const reduceMotion = useReducedMotion();
  const scrollY = useLayoutScrollY();
  const height = useSharedValue(0);

  const styles = useStyles(
    ({ spacing }) => ({
      // Same top as the overlay ScreenHeader's icon row.
      container: { paddingTop: top + spacing.sm },
      // Clears the bell at the reading end of the header row.
      headerRow: { minHeight: sizes.iconButton.md, paddingEnd: sizes.iconButton.md + spacing.sm },
      shrink: { flexShrink: 1 },
    }),
    [top, sizes.iconButton.md],
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      height.value = event.nativeEvent.layout.height;
    },
    [height],
  );

  const sinkStyle = useAnimatedStyle(() => {
    const y = scrollY ? Math.max(scrollY.value, 0) : 0;
    const span = height.value * FADE_SHARE;
    const progress = span > 0 ? Math.min(1, y / span) : 0;
    return {
      opacity: 1 - progress,
      transform: reduceMotion ? [] : [{ translateY: progress * SINK }, { scale: 1 - progress * SHRINK }],
    };
  });

  return (
    <Box style={styles.container} px="xl" pb="4xl" onLayout={onLayout}>
      <Animated.View style={sinkStyle}>
        <Box gap={compact ? 'md' : 'lg'}>
          <Box row align="center" gap="md" style={styles.headerRow}>
            <HeroAvatar uri={hero.avatarUrl} size={sizes.avatar.md} onPress={onOpenProfile} />
            <Box flex={1}>
              <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
                {hero.greeting}
              </Text>
              <Box row align="center" gap="xs">
                <Box style={styles.shrink}>
                  <Text variant="h4" color={colors.text.onBrand} numberOfLines={1}>
                    {hero.displayName || t('marketplace.creatorHome.greetingFallback')}
                  </Text>
                </Box>
                {hero.isVerified ? (
                  <BadgeCheck
                    size={sizes.icon.sm}
                    color={colors.premium.main}
                    accessibilityLabel={t('marketplace.creatorHome.verified')}
                  />
                ) : null}
                {hero.tier ? <TierBadge tier={hero.tier} size="xs" interactive={false} /> : null}
              </Box>
            </Box>
          </Box>
          <SharePass mediaKit={mediaKit} onOpenPreview={onOpenPreview} />
          <HeroPulse kpis={kpis} compact={compact} onOpenInsights={onOpenInsights} />
        </Box>
      </Animated.View>
    </Box>
  );
};

export const StorefrontHero = memo(StorefrontHeroComponent);
