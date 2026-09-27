import React, { memo } from 'react';
import { Box, SocialPlatformIcon, Text } from '@/shared/ui';
import { SOCIAL_PLATFORMS } from '@/shared/utils';
import { useTheme } from '@/core/theme';

const SocialIconsDemoComponent: React.FC = () => {
  const { colors, sizes } = useTheme();

  return (
    <Box row wrap gap="xl">
      {SOCIAL_PLATFORMS.map(platform => (
        <Box key={platform} align="center" gap="xs">
          <SocialPlatformIcon
            platform={platform}
            size={sizes.icon.md}
            color={colors.icon.primary}
          />
          <Text variant="caption" color={colors.text.tertiary}>
            {platform}
          </Text>
        </Box>
      ))}
    </Box>
  );
};

export const SocialIconsDemo = memo(SocialIconsDemoComponent);
