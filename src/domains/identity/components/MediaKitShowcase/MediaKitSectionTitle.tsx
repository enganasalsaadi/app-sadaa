import React, { memo } from 'react';
import { useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { MediaKitRise } from './MediaKitRise';

interface MediaKitSectionTitleProps {
  /** Small teal word above the title ("Rates"). */
  overline: string;
  title: string;
  subtitle?: string;
  /** Text link at the reading end ("See all (7)"). */
  action?: { label: string; onPress: () => void; accessibilityLabel?: string };
}

/** A section's head: a small teal overline, a big confident title, an optional muted line and link. */
const MediaKitSectionTitleComponent: React.FC<MediaKitSectionTitleProps> = ({
  overline,
  title,
  subtitle,
  action,
}) => {
  const { colors, sizes } = useTheme();
  return (
    <MediaKitRise>
      <Box row align="flex-end" justify="space-between" gap="md">
        <Box flex={1} gap="xs">
          <Text variant="caption" color={colors.interactive.text}>
            {overline}
          </Text>
          <Text variant="h3" accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? (
            <Text variant="bodySmall" color={colors.text.tertiary}>
              {subtitle}
            </Text>
          ) : null}
        </Box>
        {action ? (
          <Pressable
            onPress={action.onPress}
            minHeight={sizes.button.md}
            justify="center"
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel ?? action.label}
          >
            <Text variant="buttonSmall" color={colors.interactive.text}>
              {action.label}
            </Text>
          </Pressable>
        ) : null}
      </Box>
    </MediaKitRise>
  );
};

export const MediaKitSectionTitle = memo(MediaKitSectionTitleComponent);
