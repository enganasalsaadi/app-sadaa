import React, { memo } from 'react';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react-native';
import { motion, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Text } from '@/shared/ui';

/** Verified seal diameter relative to the photo. */
const SEAL_RATIO = 0.28;

interface MediaKitHeroAvatarProps {
  uri: string | null;
  name: string;
  size: number;
  isVerified: boolean;
}

/**
 * The creator's photo in a glass ring on navy, with the mustard verified seal on its edge;
 * initials when there is no photo (rule 08). Pops in once on mount.
 */
const MediaKitHeroAvatarComponent: React.FC<MediaKitHeroAvatarProps> = ({
  uri,
  name,
  size,
  isVerified,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, borderWidths, spacing } = useTheme();
  const ring = size + (borderWidths.md + spacing.xs) * 2;
  const seal = Math.round(size * SEAL_RATIO);
  const styles = useStyles(() => ({
    seal: { position: 'absolute' as const, bottom: 0, end: 0 },
  }));
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <Animated.View entering={ZoomIn.duration(motion.duration.slow)}>
      <Box
        width={ring}
        height={ring}
        borderRadius="full"
        borderWidth="md"
        borderColor={colors.glass.border}
        bg={colors.glass.fill}
        align="center"
        justify="center"
      >
        {uri ? (
          <Image uri={uri} size={size} circle />
        ) : (
          <Box
            width={size}
            height={size}
            borderRadius="full"
            bg={colors.glass.badge}
            align="center"
            justify="center"
          >
            <Text variant="h2" color={colors.text.onBrand}>
              {initial}
            </Text>
          </Box>
        )}
        {isVerified ? (
          <Box
            style={styles.seal}
            width={seal}
            height={seal}
            borderRadius="full"
            bg={colors.brand.main}
            align="center"
            justify="center"
            accessible
            accessibilityLabel={t('account.mediaKit.verifiedCreator')}
          >
            <BadgeCheck size={Math.min(seal - spacing.xs, sizes.icon.lg)} color={colors.premium.main} />
          </Box>
        ) : null}
      </Box>
    </Animated.View>
  );
};

export const MediaKitHeroAvatar = memo(MediaKitHeroAvatarComponent);
