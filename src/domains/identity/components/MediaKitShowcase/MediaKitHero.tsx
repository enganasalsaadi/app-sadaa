import React, { memo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin } from 'lucide-react-native';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, Text, TierBadge, useHeroCompact } from '@/shared/ui';
import type { PublicMediaKit } from '../../types/mediaKit';
import type { ShowcaseMetric } from '../../utils/mediaKitShowcase';
import { MediaKitCover } from './MediaKitCover';
import { MediaKitHeroAvatar } from './MediaKitHeroAvatar';
import { MediaKitMetricsStrip } from './MediaKitMetricsStrip';

const AVATAR = moderateScale(96);
const BIO_LINES = 3;

export interface MediaKitHeroProps {
  kit: PublicMediaKit;
  nicheLabels: readonly string[];
  metrics: readonly ShowcaseMetric[];
}

/** Hero blocks rise one after another, just after the avatar pops in. */
const rise = (step: number) =>
  FadeInDown.duration(motion.duration.rise).delay((step + 1) * motion.stagger);

const NichePills = memo<{ labels: readonly string[] }>(({ labels }) => {
  const { colors } = useTheme();
  if (labels.length === 0) return null;
  return (
    <Box row wrap justify="center" gap="xs">
      {labels.map(label => (
        <Box
          key={label}
          px="md"
          py="xs"
          borderRadius="full"
          borderWidth="thin"
          borderColor={colors.glass.border}
          bg={colors.glass.fill}
        >
          <Text variant="caption" color={colors.text.onBrand}>
            {label}
          </Text>
        </Box>
      ))}
    </Box>
  );
});

/** Tier crest · city, centred under the name. */
const HeroMeta = memo<{ kit: PublicMediaKit }>(({ kit }) => {
  const { colors, sizes } = useTheme();
  const city = kit.city?.label;
  if (!kit.tier && !city) return null;
  return (
    <Box row align="center" justify="center" gap="sm">
      {kit.tier ? <TierBadge tier={kit.tier} size="sm" /> : null}
      {kit.tier && city ? (
        <Box width={sizes.dot.sm} height={sizes.dot.sm} borderRadius="full" bg={colors.glass.border} />
      ) : null}
      {city ? (
        <Box row align="center" gap="xs">
          <MapPin size={sizes.icon.xs} color={colors.text.onBrandMuted} />
          <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
            {city}
          </Text>
        </Box>
      ) : null}
    </Box>
  );
});

/**
 * The pitch: cover (banner or blurred photo) behind a large avatar with the verified seal,
 * name, tier · city, bio, niche pills and the glass strip of headline numbers. Transparent:
 * Layout paints the navy lights behind it (`brandGlow`). Compact (short screen): one row
 * of avatar and name over the strip.
 */
const MediaKitHeroComponent: React.FC<MediaKitHeroProps> = ({ kit, nicheLabels, metrics }) => {
  const { colors, sizes } = useTheme();
  const { top } = useSafeAreaInsets();
  const compact = useHeroCompact();
  const name = kit.display_name ?? kit.slug;
  const styles = useStyles(
    ({ spacing }) => ({
      // Clears the overlay header's back / action row.
      container: { paddingTop: top + sizes.iconButton.md + spacing.md },
      shrink: { flexShrink: 1 },
    }),
    [top, sizes.iconButton.md],
  );

  if (compact) {
    return (
      <Box style={styles.container} px="xl" pb="4xl" gap="md">
        <MediaKitCover coverUrl={kit.cover_url ?? null} avatarUrl={kit.avatar_url} />
        <Box row align="center" gap="md">
          <MediaKitHeroAvatar
            uri={kit.avatar_url}
            name={name}
            size={sizes.avatar.md}
            isVerified={kit.is_verified}
          />
          <Box flex={1} gap="xs">
            <Text variant="title" color={colors.text.onBrand} numberOfLines={1}>
              {name}
            </Text>
            {kit.tier ? <TierBadge tier={kit.tier} size="xs" /> : null}
          </Box>
        </Box>
        <MediaKitMetricsStrip metrics={metrics} compact />
      </Box>
    );
  }

  return (
    <Box style={styles.container} px="xl" pb="4xl" gap="xl">
      <MediaKitCover coverUrl={kit.cover_url ?? null} avatarUrl={kit.avatar_url} />
      <Box align="center" gap="md">
        <MediaKitHeroAvatar uri={kit.avatar_url} name={name} size={AVATAR} isVerified={kit.is_verified} />
        <Animated.View entering={rise(0)}>
          <Box align="center" gap="sm">
            <Box style={styles.shrink}>
              <Text variant="h2" color={colors.text.onBrand} numberOfLines={1} align="center">
                {name}
              </Text>
            </Box>
            <HeroMeta kit={kit} />
          </Box>
        </Animated.View>
        {kit.bio ? (
          <Animated.View entering={rise(1)}>
            <Text
              variant="body"
              color={colors.text.onBrandMuted}
              numberOfLines={BIO_LINES}
              align="center"
            >
              {kit.bio}
            </Text>
          </Animated.View>
        ) : null}
        <Animated.View entering={rise(2)}>
          <NichePills labels={nicheLabels} />
        </Animated.View>
      </Box>
      <Animated.View entering={rise(3)}>
        <MediaKitMetricsStrip metrics={metrics} compact={false} />
      </Animated.View>
    </Box>
  );
};

export const MediaKitHero = memo(MediaKitHeroComponent);
