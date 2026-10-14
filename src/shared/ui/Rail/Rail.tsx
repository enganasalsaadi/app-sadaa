import React, { memo } from 'react';
import { ScrollView } from 'react-native';
import type { AccessibilityRole, ViewStyle } from 'react-native';
import { shadowBleed, useStyles } from '@/core/theme';
import type { ShadowToken, SpacingToken } from '@/core/theme';

export interface RailProps {
  children: React.ReactNode;
  /** Shadow its items cast: the rail makes room so it isn't cut flat, without moving the layout. */
  shadow?: ShadowToken;
  gap?: SpacingToken;
  /** Inset of the first and last item from the screen edge. */
  gutter?: SpacingToken;
  /** Extra room above and below that is part of the layout (leaning or scaled items). */
  py?: SpacingToken;
  /** Undo the parent's `gutter` padding so the rail runs to the screen edges. */
  bleed?: boolean;
  /** Item width + gap: swipes settle on an item. */
  snapInterval?: number;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
}

/**
 * A sideways row of items. A ScrollView clips its content on both platforms, so items'
 * shadows get room inside it, and the same amount comes back off its outer margins:
 * the shadow shows whole and the rail still sits where its items do.
 */
const RailComponent: React.FC<RailProps> = ({
  children,
  shadow = 'none',
  gap = 'md',
  gutter = 'xl',
  py,
  bleed = false,
  snapInterval,
  accessibilityRole,
  accessibilityLabel,
}) => {
  const styles = useStyles(
    ({ spacing, shadows }): Record<'rail' | 'content', ViewStyle> => {
      const room = shadowBleed(shadows[shadow]);
      const inset = Math.max(spacing[gutter], room.side);
      const extra = py ? spacing[py] : 0;
      return {
        // `flexGrow: 0`: a horizontal ScrollView otherwise takes half a column screen.
        rail: {
          flexGrow: 0,
          marginTop: -room.top,
          marginBottom: -room.bottom,
          marginHorizontal: bleed ? -spacing[gutter] : 0,
        },
        content: {
          gap: spacing[gap],
          paddingHorizontal: inset,
          paddingTop: room.top + extra,
          paddingBottom: room.bottom + extra,
        },
      };
    },
    [shadow, gap, gutter, py, bleed],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.rail}
      contentContainerStyle={styles.content}
      snapToInterval={snapInterval}
      decelerationRate={snapInterval ? 'fast' : 'normal'}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </ScrollView>
  );
};

export const Rail = memo(RailComponent);
