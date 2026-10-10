import React, { memo } from 'react';
import { ScrollView } from 'react-native';
import type { AccessibilityRole } from 'react-native';
import { useStyles } from '@/core/theme';

export interface ChipRowProps {
  children: React.ReactNode;
  /** What the row filters ("Filter top-ups"). */
  accessibilityLabel: string;
  /** `radiogroup` when the chips are one single-select set. */
  accessibilityRole?: AccessibilityRole;
}

/** Filter chips pinned under a screen header, scrolling sideways when they overflow. */
const ChipRowComponent: React.FC<ChipRowProps> = ({
  children,
  accessibilityLabel,
  accessibilityRole,
}) => {
  const styles = useStyles(({ spacing }) => ({
    // Horizontal ScrollView defaults to flexGrow 1: in a column screen it would
    // take half the height from the list below and float the chips mid-screen.
    row: { flexGrow: 0 },
    content: {
      gap: spacing.sm,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      alignItems: 'center' as const,
    },
  }));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.content}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </ScrollView>
  );
};

export const ChipRow = memo(ChipRowComponent);
