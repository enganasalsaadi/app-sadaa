import React, { memo } from 'react';
import { Link2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import { Box, SocialPlatformIcon } from '@/shared/ui';

interface PlatformMarkProps {
  platform: string;
}

/** The platform's mark in a soft teal circle: the visual anchor of a platform row. */
const PlatformMarkComponent: React.FC<PlatformMarkProps> = ({ platform }) => {
  const { colors, sizes } = useTheme();

  return (
    <Box
      width={sizes.avatar.md}
      height={sizes.avatar.md}
      borderRadius="full"
      bg={colors.interactive.soft}
      align="center"
      justify="center"
    >
      {isSocialPlatform(platform) ? (
        <SocialPlatformIcon
          platform={platform}
          size={sizes.icon.md}
          color={colors.interactive.main}
        />
      ) : (
        <Link2 size={sizes.icon.md} color={colors.interactive.main} />
      )}
    </Box>
  );
};

export const PlatformMark = memo(PlatformMarkComponent);
