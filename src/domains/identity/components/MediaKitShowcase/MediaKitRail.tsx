import React, { memo } from 'react';
import { ScrollView } from 'react-native';
import { useStyles } from '@/core/theme';
import { Box, SectionHeader } from '@/shared/ui';

interface MediaKitRailProps {
  /** Omitted when the cards name themselves (platform followers right under the identity). */
  title?: string;
  subtitle?: string;
  /** Snap step: one card plus the gap. */
  snapInterval: number;
  children: React.ReactNode;
}

/**
 * A row of cards running edge to edge (platforms, brands, past work). Bounded by the
 * server (a handful each), so no virtualised list. The bottom pad keeps the whole `card`
 * shadow inside the clipping scroll view.
 */
const MediaKitRailComponent: React.FC<MediaKitRailProps> = ({ title, subtitle, snapInterval, children }) => {
  const styles = useStyles(({ spacing, shadows }) => ({
    rail: { marginBottom: -spacing.lg },
    content: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: (shadows.card.shadowOffset?.height ?? 0) + (shadows.card.shadowRadius ?? 0),
      gap: spacing.md,
    },
  }));

  return (
    <Box gap="xs">
      {title ? (
        <Box px="xl">
          <SectionHeader title={title} subtitle={subtitle} emphasis="strong" />
        </Box>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.rail}
        contentContainerStyle={styles.content}
        snapToInterval={snapInterval}
        snapToAlignment="start"
        decelerationRate="fast"
      >
        {children}
      </ScrollView>
    </Box>
  );
};

export const MediaKitRail = memo(MediaKitRailComponent);
