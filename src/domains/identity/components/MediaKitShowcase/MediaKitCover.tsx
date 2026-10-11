import React, { memo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useTheme } from '@/core/theme';
import { Box, Image, useHeroCompact } from '@/shared/ui';

/** The server crops covers to 1500×600 (contract §17.11). */
const COVER_RATIO = 5 / 2;
/** Short screens: a wider crop of the same photo keeps the services in view. */
const COMPACT_RATIO = 3;

/**
 * The pitch hero: the creator's cover, edge to edge and sharp, darkened at the top so the
 * status bar and glass icons read. No cover → an empty band of the same height and Layout's
 * navy backdrop shows through. Also the loading hero (`coverUrl={null}`).
 */
const MediaKitCoverComponent: React.FC<{ coverUrl: string | null }> = ({ coverUrl }) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const compact = useHeroCompact();
  const height = Math.round(width / (compact ? COMPACT_RATIO : COVER_RATIO));

  if (!coverUrl) return <Box height={height} />;

  return (
    <Image
      uri={coverUrl}
      width="100%"
      height={height}
      resizeMode="cover"
      // The navy backdrop is the placeholder; a grey pulse would flash over it.
      showSkeleton={false}
      gradientColors={[colors.overlay, colors.layout.transparent]}
      gradientDirection="top-bottom"
    />
  );
};

export const MediaKitCover = memo(MediaKitCoverComponent);
