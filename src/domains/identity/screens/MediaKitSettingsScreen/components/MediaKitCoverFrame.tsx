import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useStyles } from '@/core/theme';
import { Box, type BoxProps } from '@/shared/ui';
import { COVER_ASPECT_RATIO } from '../../../utils/mediaKitCover';

/** The 5:2 window the page shows the cover through: shared by the live section and its skeleton. */
const MediaKitCoverFrameComponent: React.FC<BoxProps> = ({ style, ...props }) => {
  const styles = useStyles(
    (theme): Record<'frame', ViewStyle> => ({
      frame: {
        width: '100%',
        aspectRatio: COVER_ASPECT_RATIO,
        overflow: 'hidden',
        borderRadius: theme.radii.lg,
        backgroundColor: theme.colors.surface.elevated,
      },
    }),
    [],
  );

  return <Box style={[styles.frame, style]} {...props} />;
};

export const MediaKitCoverFrame = memo(MediaKitCoverFrameComponent);
