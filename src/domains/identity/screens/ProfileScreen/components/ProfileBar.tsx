import React, { memo } from 'react';
import { BadgeCheck, Building2, User } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Image, Text } from '@/shared/ui';
import type { ProfileScreenModel } from '../hooks/useProfileScreen';

interface ProfileBarProps {
  hero: ProfileScreenModel['hero'];
}

/**
 * Identity pinned in the navy bar once the hero scrolls away, start-aligned like
 * Home's: photo, name, verified mark. Not a tap target: the hero photo already
 * changes the picture and the actions stay header icons.
 */
const ProfileBarComponent: React.FC<ProfileBarProps> = ({ hero }) => {
  const { colors, sizes, borderWidths } = useTheme();
  const styles = useStyles(() => ({ shrink: { flexShrink: 1 } }));
  const Placeholder = hero.isBrand ? Building2 : User;
  const size = sizes.avatar.sm;

  return (
    <Box row align="center" gap="sm" minHeight={sizes.iconButton.md}>
      <Box
        width={size + borderWidths.md * 2}
        height={size + borderWidths.md * 2}
        borderRadius="full"
        borderWidth="md"
        borderColor={colors.glass.border}
        align="center"
        justify="center"
      >
        {hero.avatarUrl ? (
          <Image uri={hero.avatarUrl} size={size} circle />
        ) : (
          <Box width={size} height={size} borderRadius="full" bg={colors.glass.badge} align="center" justify="center">
            <Placeholder size={sizes.icon.sm} color={colors.text.onBrand} />
          </Box>
        )}
      </Box>
      <Box style={styles.shrink}>
        <Text variant="title" color={colors.text.onBrand} numberOfLines={1}>
          {hero.displayName || '—'}
        </Text>
      </Box>
      {hero.isVerified ? <BadgeCheck size={sizes.icon.sm} color={colors.premium.main} /> : null}
    </Box>
  );
};

export const ProfileBar = memo(ProfileBarComponent);
