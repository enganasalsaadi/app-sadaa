import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SystemBars } from 'react-native-edge-to-edge';
import { motion, useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { HeroBackdrop } from '../HeroBackdrop';
import { HeroSheetContext } from './HeroSheetContext';

export interface HeroSheetProps {
  /** Content on the navy hero (logo, title, progress). Top safe area is handled here. */
  header: React.ReactNode;
  /** Sheet content: usually a `Layout` (it adapts to the sheet on its own). */
  children: React.ReactNode;
}

const layoutTransition = LinearTransition.duration(motion.duration.base);

/**
 * The app's form-screen chrome: navy hero on top, rounded surface sheet below.
 * Header height changes (keyboard hiding a subtitle, a new step title) animate
 * the sheet edge instead of snapping.
 */
const HeroSheetComponent: React.FC<HeroSheetProps> = ({ header, children }) => {
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();

  const styles = useStyles(
    (theme): Record<'header' | 'sheet', ViewStyle> => ({
      header: { paddingTop: top + theme.spacing.sm },
      sheet: {
        flex: 1,
        backgroundColor: theme.colors.surface.main,
        borderTopStartRadius: theme.radii.xl,
        borderTopEndRadius: theme.radii.xl,
        overflow: 'hidden',
      },
    }),
    [top],
  );

  return (
    <Box flex={1} bg={colors.brand.main}>
      <SystemBars style="light" />
      <HeroBackdrop />
      <Animated.View layout={layoutTransition} style={styles.header}>
        {header}
      </Animated.View>
      <Animated.View layout={layoutTransition} style={styles.sheet}>
        <HeroSheetContext.Provider value={true}>{children}</HeroSheetContext.Provider>
      </Animated.View>
    </Box>
  );
};

export const HeroSheet = memo(HeroSheetComponent);
