import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { Plus } from 'lucide-react-native';
import { iconStroke, moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, GradientSurface, Pressable, Text } from '@/shared/ui';
import type { BriefFileSource } from '../../utils/briefFiles';
import { DocStackArt } from './DocStackArt';
import { PhotoFanArt } from './PhotoFanArt';

const TILE_HEIGHT = moderateScale(196);
const PILL = moderateScale(30);

const TILE = {
  photos: {
    label: 'marketplace.offer.brief.files.photos',
    hint: 'marketplace.offer.brief.files.photosHint',
    Art: PhotoFanArt,
    onBrand: true,
  },
  files: {
    label: 'marketplace.offer.brief.files.documents',
    hint: 'marketplace.offer.brief.files.documentsHint',
    Art: DocStackArt,
    onBrand: false,
  },
} as const satisfies Record<
  BriefFileSource,
  { label: ParseKeys; hint: ParseKeys; Art: typeof PhotoFanArt; onBrand: boolean }
>;

interface BriefFileSourceTileProps {
  source: BriefFileSource;
  onChoose: (source: BriefFileSource) => void;
}

/** Half-width tile that draws what it picks: a photo fan on navy, or a paper stack. */
const BriefFileSourceTileComponent: React.FC<BriefFileSourceTileProps> = ({ source, onChoose }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const spread = useSharedValue(0);
  const { label, hint, Art, onBrand } = TILE[source];
  const styles = useStyles(
    ({ spacing, borderWidths }): Record<'pill', ViewStyle> => ({
      pill: {
        position: 'absolute',
        top: spacing.md,
        end: spacing.md,
        width: PILL,
        height: PILL,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: PILL / 2,
        borderWidth: onBrand ? borderWidths.thin : 0,
        borderColor: colors.glass.border,
        backgroundColor: onBrand ? colors.glass.fill : colors.surface.main,
      },
    }),
    [onBrand, colors.glass.border, colors.glass.fill, colors.surface.main],
  );

  const handlePressIn = useCallback(() => {
    if (!reduceMotion) spread.value = withSpring(1, motion.spring);
  }, [reduceMotion, spread]);
  const handlePressOut = useCallback(() => {
    if (!reduceMotion) spread.value = withSpring(0, motion.spring);
  }, [reduceMotion, spread]);
  const handlePress = useCallback(() => onChoose(source), [onChoose, source]);

  const content = (
    <>
      <Box style={styles.pill}>
        <Plus
          size={sizes.icon.xs}
          strokeWidth={iconStroke.bold}
          color={onBrand ? colors.text.onBrand : colors.icon.secondary}
        />
      </Box>
      <Art spread={spread} />
      <Box gap="xs">
        <Text variant="title" color={onBrand ? colors.text.onBrand : colors.text.primary}>
          {t(label)}
        </Text>
        <Text variant="caption" color={onBrand ? colors.text.onBrandMuted : colors.text.secondary}>
          {t(hint)}
        </Text>
      </Box>
    </>
  );

  return (
    <Pressable
      flex={1}
      height={TILE_HEIGHT}
      scaleOnPress
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t(label)}
      accessibilityHint={t(hint)}
    >
      {onBrand ? (
        <GradientSurface variant="brand" flex={1} p="md" borderRadius="lg" justify="space-between">
          {content}
        </GradientSurface>
      ) : (
        <Box
          flex={1}
          p="md"
          borderRadius="lg"
          justify="space-between"
          bg={colors.surface.elevated}
          borderWidth="thin"
          borderColor={colors.border.default}
        >
          {content}
        </Box>
      )}
    </Pressable>
  );
};

export const BriefFileSourceTile = memo(BriefFileSourceTileComponent);
