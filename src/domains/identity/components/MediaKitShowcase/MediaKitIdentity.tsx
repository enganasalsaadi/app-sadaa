import React, { memo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MapPin } from 'lucide-react-native';
import { motion, useStyles, useTheme } from '@/core/theme';
import { Box, Tag, Text, TierBadge, useHeroCompact } from '@/shared/ui';
import type { PublicMediaKit } from '../../types/mediaKit';
import { MediaKitHeroAvatar } from './MediaKitHeroAvatar';

/** Bios are ≤ 300 characters; two lines keep the services in view, the rest is on the web kit. */
const BIO_LINES = 2;

interface MediaKitIdentityProps {
  kit: PublicMediaKit;
  nicheLabels: readonly string[];
}

/** Blocks rise one after another, just after the avatar pops in. */
const rise = (step: number) =>
  FadeInDown.duration(motion.duration.rise).delay((step + 1) * motion.stagger);

/** Tier crest and city on one line under the name. */
const IdentityMeta = memo<{ kit: PublicMediaKit }>(({ kit }) => {
  const { colors, sizes } = useTheme();
  const city = kit.city?.label;
  if (!kit.tier && !city) return null;
  return (
    <Box row align="center" justify="center" gap="md">
      {kit.tier ? <TierBadge tier={kit.tier} size="sm" /> : null}
      {city ? (
        <Box row align="center" gap="xs">
          <MapPin size={sizes.icon.xs} color={colors.icon.secondary} />
          <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
            {city}
          </Text>
        </Box>
      ) : null}
    </Box>
  );
});

/**
 * Who the creator is, on the sheet right under the cover (like a social profile): the avatar
 * cutting into the cover's edge, name, tier · city, a two-line bio and the niches. White, not
 * navy, so the photo above stays the one focal point.
 */
const MediaKitIdentityComponent: React.FC<MediaKitIdentityProps> = ({ kit, nicheLabels }) => {
  const { colors, sizes, borderWidths } = useTheme();
  const compact = useHeroCompact();
  const avatar = compact ? sizes.avatar.lg : sizes.avatar.xl;
  const ring = avatar + borderWidths.xl * 2;
  const name = kit.display_name ?? kit.slug;
  const styles = useStyles(() => ({ overlap: { marginTop: -ring / 2 } }), [ring]);

  return (
    <Box align="center" gap="sm" px="xl">
      <Box style={styles.overlap}>
        <MediaKitHeroAvatar uri={kit.avatar_url} name={name} size={avatar} isVerified={kit.is_verified} />
      </Box>
      <Animated.View entering={rise(0)}>
        <Box align="center" gap="xs">
          <Text variant="h2" numberOfLines={1} align="center">
            {name}
          </Text>
          <IdentityMeta kit={kit} />
        </Box>
      </Animated.View>
      {kit.bio ? (
        <Animated.View entering={rise(1)}>
          <Text variant="body" color={colors.text.secondary} numberOfLines={BIO_LINES} align="center">
            {kit.bio}
          </Text>
        </Animated.View>
      ) : null}
      {nicheLabels.length > 0 ? (
        <Animated.View entering={rise(2)}>
          <Box row wrap justify="center" gap="xs">
            {nicheLabels.map(label => (
              <Tag key={label} label={label} />
            ))}
          </Box>
        </Animated.View>
      ) : null}
    </Box>
  );
};

export const MediaKitIdentity = memo(MediaKitIdentityComponent);
