import React, { memo } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useStyles, useTheme } from '@/core/theme';
import { Box, GradientSurface, Image } from '@/shared/ui';

export interface CampaignCoverProps {
  /** The signed cover link; `null` while it has no cover (or the link was purged). */
  uri: string | null;
  height: number;
  /** Laid over the photo: first child top, second child bottom. */
  children?: React.ReactNode;
}

/** A campaign's cover, edge to edge: the photo (or the brand gradient) under a scrim so white type reads on any image. */
const CampaignCoverComponent: React.FC<CampaignCoverProps> = ({ uri, height, children }) => {
  const { colors } = useTheme();
  const styles = useStyles(
    ({ spacing }): Record<'frame' | 'overlay', ViewStyle> => ({
      frame: { height, overflow: 'hidden', backgroundColor: colors.surface.elevated },
      overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        start: 0,
        end: 0,
        padding: spacing.md,
        justifyContent: 'space-between',
      },
    }),
    [colors.surface.elevated, height],
  );
  const { mediaTopShade, mediaScrim } = colors.gradients;

  return (
    <Box style={styles.frame}>
      {uri ? <Image uri={uri} width="100%" height="100%" /> : <GradientSurface variant="brand" style={StyleSheet.absoluteFill} />}
      <LinearGradient
        colors={mediaTopShade.colors}
        locations={mediaTopShade.locations}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={mediaScrim.colors}
        locations={mediaScrim.locations}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <Box style={styles.overlay} pointerEvents="box-none">
        {children}
      </Box>
    </Box>
  );
};

export const CampaignCover = memo(CampaignCoverComponent);
