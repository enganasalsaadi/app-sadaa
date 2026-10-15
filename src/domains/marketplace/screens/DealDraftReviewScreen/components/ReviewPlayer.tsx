import React, { memo } from 'react';
import { StyleSheet, useWindowDimensions, type ViewStyle } from 'react-native';
import Video from 'react-native-video';
import { useTranslation } from 'react-i18next';
import { ImageOff, Play } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Pressable, Text } from '@/shared/ui';
import type { DealFile } from '../../../types';
import { formatTimecode } from '../../../utils/dealDrafts';
import type { DraftPlayer } from '../hooks/useDraftPlayer';

const PLAY = moderateScale(58);
/** Shape assumed until the file reports its own (height over width). */
const FALLBACK_ASPECT = 1;
/** The stage never takes more than this share of the window, so notes and the dock stay in reach. */
const STAGE_MAX_SHARE = 0.45;
/** How often the playhead hears from the player. */
const PROGRESS_MS = 250;

export interface ReviewPlayerProps {
  file: DealFile;
  /** «File 1 of 4 · Video». */
  label: string;
  player: DraftPlayer;
}

/**
 * The file under review on the navy stage, sized to the file's shape: a video plays in place (tap to play / pause, time in
 * the corner), a photo shows whole. A purged file says so instead of failing silently.
 */
const ReviewPlayerComponent: React.FC<ReviewPlayerProps> = ({ file, label, player }) => {
  const { t } = useTranslation();
  const { colors, spacing, sizes } = useTheme();
  const { width: screen, height: windowHeight } = useWindowDimensions();
  const width = screen - spacing.xl * 2;
  // Fits the file's own shape (a landscape clip stays short), capped for tall reels and short phones.
  const height = Math.round(Math.min(width * (player.aspect ?? FALLBACK_ASPECT), windowHeight * STAGE_MAX_SHARE));
  const isVideo = file.kind === 'video';
  const styles = useStyles(
    ({ radii, borderWidths }): Record<'stage' | 'chip' | 'time' | 'play' | 'tap', ViewStyle> => ({
      stage: {
        width,
        height,
        borderRadius: radii.lg,
        overflow: 'hidden',
        backgroundColor: colors.mediaBackdrop,
      },
      chip: {
        position: 'absolute',
        top: spacing.sm,
        start: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radii.full,
        backgroundColor: colors.media.glass,
      },
      time: {
        position: 'absolute',
        bottom: spacing.sm,
        start: spacing.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radii.sm,
        backgroundColor: colors.media.glass,
      },
      play: {
        width: PLAY,
        height: PLAY,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.glass.fill,
        borderWidth: borderWidths.thin,
        borderColor: colors.glass.border,
      },
      tap: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
    }),
    [colors, height, spacing, width],
  );

  if (!file.url) {
    return (
      <Box style={styles.stage} align="center" justify="center" gap="sm">
        <ImageOff size={sizes.icon.lg} color={colors.text.onBrandMuted} />
        <Text variant="bodySmall" color={colors.text.onBrandMuted}>
          {t('marketplace.deals.drafts.review.unavailable')}
        </Text>
      </Box>
    );
  }

  return (
    <Box style={styles.stage}>
      {isVideo ? (
        <>
          <Video
            ref={player.ref}
            source={{ uri: file.url }}
            paused={player.paused}
            resizeMode="contain"
            progressUpdateInterval={PROGRESS_MS}
            onLoad={player.onLoad}
            onProgress={player.onProgress}
            onEnd={player.onEnd}
            style={StyleSheet.absoluteFill}
          />
          <Pressable
            style={styles.tap}
            onPress={player.toggle}
            accessibilityRole="button"
            accessibilityLabel={
              player.paused ? t('marketplace.deals.drafts.review.play') : t('marketplace.deals.drafts.review.pause')
            }
          >
            {player.paused ? (
              <Box style={styles.play}>
                <Play size={sizes.icon.md} color={colors.text.onBrand} fill={colors.text.onBrand} />
              </Box>
            ) : null}
          </Pressable>
          <Box style={styles.time} pointerEvents="none">
            <Text variant="caption" color={colors.text.onBrand}>
              {`${formatTimecode(player.time)} / ${formatTimecode(player.duration)}`}
            </Text>
          </Box>
        </>
      ) : (
        <Image uri={file.url} width={width} height={height} resizeMode="contain" onLoad={player.onImageLoad} />
      )}
      <Box style={styles.chip} pointerEvents="none">
        <Text variant="caption" color={colors.text.onBrand}>
          {label}
        </Text>
      </Box>
    </Box>
  );
};

export const ReviewPlayer = memo(ReviewPlayerComponent);
