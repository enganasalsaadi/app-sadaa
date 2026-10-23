import React, { memo, useCallback, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeOut, LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { FileText, Play } from 'lucide-react-native';
import { extensionOf } from '@/core/download';
import { iconStroke, motion, opacity, useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Image } from '../primitives/Image';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import type { ViewerFile } from './types';

export interface ViewerFilmstripProps {
  files: readonly ViewerFile[];
  index: number;
  /** The link to show for a file (refreshed links win over the original). */
  uriOf: (file: ViewerFile) => string | null;
  onPick: (index: number) => void;
}

/** Thumbs on each side of the active one; the strip slides as the active file changes. */
const SIDE = 3;
const slide = LinearTransition.duration(motion.duration.base);

interface ThumbProps {
  file: ViewerFile;
  position: number;
  total: number;
  active: boolean;
  uri: string | null;
  onPick: (index: number) => void;
}

const Thumb = memo<ThumbProps>(({ file, position, total, active, uri, onPick }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const size = active ? sizes.viewer.thumbActive : sizes.viewer.thumb;
  const styles = useStyles(
    ({ colors: palette, radii, borderWidths }): Record<'frame', ViewStyle> => ({
      frame: {
        width: size,
        height: size,
        borderRadius: radii.sm,
        overflow: 'hidden',
        borderWidth: borderWidths.md,
        borderColor: active ? palette.viewer.accent : palette.viewer.glass,
        backgroundColor: palette.viewer.glass,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: active ? 1 : opacity.pressed,
      },
    }),
    [active, size],
  );
  const pick = useCallback(() => onPick(position), [onPick, position]);
  const Icon = file.kind === 'video' ? Play : FileText;

  return (
    <Pressable
      onPress={pick}
      scaleOnPress
      style={styles.frame}
      accessibilityRole="button"
      accessibilityLabel={t('files.viewer.position', { current: position + 1, total, name: file.name })}
      accessibilityState={{ selected: active }}
    >
      {file.kind === 'image' && uri ? (
        <Image uri={uri} width={size} height={size} resizeMode="cover" showSkeleton={false} />
      ) : (
        <Box align="center" gap="xs">
          <Icon size={sizes.icon.sm} color={colors.viewer.text} strokeWidth={iconStroke.regular} />
          {file.kind === 'document' ? (
            <Text variant="overline" color={colors.viewer.muted} transform="uppercase">
              {extensionOf(file.name)}
            </Text>
          ) : null}
        </Box>
      )}
    </Pressable>
  );
});
Thumb.displayName = 'Thumb';

/**
 * Every file of the set as small thumbs (photos, videos, documents alike). Shows a window around
 * the active one so a long set never needs scrolling; tap to jump.
 */
const ViewerFilmstripComponent: React.FC<ViewerFilmstripProps> = ({ files, index, uriOf, onPick }) => {
  const reduceMotion = useReducedMotion();
  const window = useMemo(() => {
    const from = Math.max(0, Math.min(index - SIDE, files.length - (SIDE * 2 + 1)));
    const to = Math.min(files.length, from + SIDE * 2 + 1);
    return files.slice(from, to).map((file, offset) => ({ file, position: from + offset }));
  }, [files, index]);

  if (files.length < 2) return null;

  return (
    <Box row align="center" justify="center" gap="sm">
      {window.map(({ file, position }) => (
        <Animated.View
          key={file.id}
          layout={reduceMotion ? undefined : slide}
          entering={reduceMotion ? undefined : FadeIn.duration(motion.duration.fast)}
          exiting={reduceMotion ? undefined : FadeOut.duration(motion.duration.fast)}
        >
          <Thumb
            file={file}
            position={position}
            total={files.length}
            active={position === index}
            uri={uriOf(file)}
            onPick={onPick}
          />
        </Animated.View>
      ))}
    </Box>
  );
};

export const ViewerFilmstrip = memo(ViewerFilmstripComponent);
