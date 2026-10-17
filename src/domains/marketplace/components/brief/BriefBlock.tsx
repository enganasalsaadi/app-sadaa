import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

interface BriefBlockProps {
  icon: LucideIcon;
  title: string;
  body: string;
  /** «3/10» beside the title. */
  count?: string;
  children: React.ReactNode;
}

/** One brief topic as a card: a teal mark, the question, a hint, then its fields. */
const BriefBlockComponent: React.FC<BriefBlockProps> = ({ icon: Icon, title, body, count, children }) => {
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing, shadows }): Record<'card' | 'mark', ViewStyle> => ({
      card: { borderRadius: radii.xl, backgroundColor: colors.surface.main, padding: spacing.lg, gap: spacing.md, ...shadows.card },
      mark: {
        width: sizes.icon.xl,
        height: sizes.icon.xl,
        borderRadius: radii.sm,
        backgroundColor: colors.interactive.soft,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
    [colors.interactive.soft, colors.surface.main, sizes.icon.xl],
  );
  return (
    <Box style={styles.card}>
      <Box row align="center" gap="md">
        <Box style={styles.mark}>
          <Icon size={sizes.icon.sm} color={colors.interactive.main} />
        </Box>
        <Box flex={1}>
          <Text variant="bodyMedium" color={colors.text.primary}>
            {title}
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            {body}
          </Text>
        </Box>
        {count ? (
          <Text variant="caption" color={colors.text.tertiary}>
            {count}
          </Text>
        ) : null}
      </Box>
      {children}
    </Box>
  );
};

export const BriefBlock = memo(BriefBlockComponent);
