import React, { memo, useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme, type TypographyVariant } from '@/core/theme';
import { Box, GradientSurface, Image, Text } from '@/shared/ui';
import type { ExploreCreator } from '../../../types/explore';
import { monogramOf } from '../../../utils/creatorText';

interface CreatorMediaProps {
  creator: ExploreCreator;
  /** Monogram size when there is no photo. */
  monogram?: TypographyVariant;
  /** Bottom-up navy scrim so white text reads over the photo. */
  scrim?: boolean;
  /** Short top shade for bars / controls in the corners. */
  topShade?: boolean;
}

/**
 * A creator's photo filling its parent (cropped to cover). No photo, or a broken one → the navy
 * gradient with a large monogram, so photo cards never fall back to a grey box.
 */
const CreatorMediaComponent: React.FC<CreatorMediaProps> = ({
  creator,
  monogram = 'h1',
  scrim = false,
  topShade = false,
}) => {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);
  const showImage = !!creator.avatarUrl && !failed;

  return (
    <Box
      style={StyleSheet.absoluteFill}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {showImage ? (
        <Image
          uri={creator.avatarUrl ?? undefined}
          width="100%"
          height="100%"
          resizeMode="cover"
          showSkeleton={false}
          onError={onError}
        />
      ) : (
        <GradientSurface variant="brand" flex={1} align="center" justify="center">
          <Text variant={monogram} color={colors.text.onBrand}>
            {monogramOf(creator.displayName)}
          </Text>
        </GradientSurface>
      )}
      {topShade ? (
        <LinearGradient
          colors={colors.gradients.mediaTopShade.colors}
          locations={colors.gradients.mediaTopShade.locations}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {scrim ? (
        <LinearGradient
          colors={colors.gradients.mediaScrim.colors}
          locations={colors.gradients.mediaScrim.locations}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
    </Box>
  );
};

export const CreatorMedia = memo(CreatorMediaComponent);
