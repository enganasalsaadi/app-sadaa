import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Image, Pressable } from '@/shared/ui';

interface HeroAvatarProps {
  uri: string | null;
  size: number;
  /** Omit inside a row that is already pressable. */
  onPress?: () => void;
}

/** Creator photo in a glass ring on navy (hero and pinned bar); falls back to a person glyph. */
const HeroAvatarComponent: React.FC<HeroAvatarProps> = ({ uri, size, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes, borderWidths } = useTheme();
  const ringSize = size + borderWidths.md * 2;

  const photo = uri ? (
    <Image uri={uri} size={size} circle />
  ) : (
    <Box width={size} height={size} borderRadius="full" bg={colors.glass.badge} align="center" justify="center">
      <User
        size={size >= sizes.avatar.md ? sizes.icon.md : sizes.icon.sm}
        color={colors.text.onBrand}
      />
    </Box>
  );
  const ring = {
    width: ringSize,
    height: ringSize,
    borderRadius: 'full',
    borderWidth: 'md',
    borderColor: colors.glass.border,
    align: 'center',
    justify: 'center',
  } as const;

  if (!onPress) return <Box {...ring}>{photo}</Box>;

  return (
    <Pressable
      {...ring}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.creatorHome.openProfile')}
    >
      {photo}
    </Pressable>
  );
};

export const HeroAvatar = memo(HeroAvatarComponent);
