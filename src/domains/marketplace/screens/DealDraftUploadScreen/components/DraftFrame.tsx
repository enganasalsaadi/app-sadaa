import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet, Vibration, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Video from 'react-native-video';
import { useTranslation } from 'react-i18next';
import { Play, RotateCw, X } from 'lucide-react-native';
import { HAPTIC_TAP_MS } from '@/core/config';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Pressable, Text } from '@/shared/ui';
import { formatTimecode } from '../../../utils/dealDrafts';

const BADGE = moderateScale(22);
const REMOVE = moderateScale(26);
const SCAN = moderateScale(2);
const HIT_SLOP = moderateScale(10);
const LIFT = 1.04;

export type DraftFrameStatus = 'done' | 'uploading' | 'failed';

export interface DraftFrameProps {
  uri: string | null;
  kind: 'video' | 'image';
  /** 1-based place in the round (the post's order). */
  index: number;
  width: number;
  height: number;
  status: DraftFrameStatus;
  /** 0–1 while uploading. */
  progress: number;
  /** Why it failed («unsupported type», «over 300 MB»…). */
  failure?: string | null;
  retryable?: boolean;
  durationSec?: number | null;
  /** Long-pressed: waiting for the place it moves to. */
  lifted?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  onRemove?: () => void;
  onRetry?: () => void;
}

/**
 * One frame of the contact sheet (approved «غرفة التحميض»). While its bytes go up a navy veil
 * recedes from the top behind a teal scan line, so the photo «develops»; at 100% the veil lifts
 * with a light tap. Videos show their first frame, never playing.
 */
const DraftFrameComponent: React.FC<DraftFrameProps> = ({
  uri,
  kind,
  index,
  width,
  height,
  status,
  progress,
  failure = null,
  retryable = false,
  durationSec = null,
  lifted = false,
  onPress,
  onLongPress,
  onRemove,
  onRetry,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const developed = useSharedValue(status === 'uploading' ? progress : 1);
  const veil = useSharedValue(status === 'uploading' ? 1 : 0);
  const wasUploading = useRef(status === 'uploading');

  useEffect(() => {
    const share = status === 'uploading' ? progress : 1;
    developed.value = reduceMotion ? share : withTiming(share, { duration: motion.duration.develop });
    if (status === 'uploading') {
      veil.value = 1;
      wasUploading.current = true;
      return;
    }
    veil.value = reduceMotion ? 0 : withTiming(0, { duration: motion.duration.slow });
    if (status === 'done' && wasUploading.current) Vibration.vibrate(HAPTIC_TAP_MS);
    wasUploading.current = false;
  }, [developed, progress, reduceMotion, status, veil]);

  const veilStyle = useAnimatedStyle(() => ({
    top: developed.value * height,
    opacity: veil.value,
  }));

  const styles = useStyles(
    ({ radii, borderWidths, spacing, shadows }): Record<
      'frame' | 'veil' | 'scan' | 'badge' | 'remove' | 'length' | 'failed',
      ViewStyle
    > => ({
      frame: {
        width,
        height,
        borderRadius: radii.md,
        overflow: 'hidden',
        backgroundColor: colors.draft.veil,
        // Lifted for a move: a teal rim, nudged up off the film.
        ...(lifted
          ? { borderWidth: borderWidths.md, borderColor: colors.draft.scan, transform: [{ scale: LIFT }], ...shadows.card }
          : {}),
      },
      veil: {
        position: 'absolute',
        start: 0,
        end: 0,
        bottom: 0,
        backgroundColor: colors.draft.veil,
      },
      scan: {
        height: SCAN,
        backgroundColor: colors.draft.scan,
        shadowColor: colors.draft.scan,
        shadowOpacity: 1,
        shadowRadius: spacing.sm,
        shadowOffset: { width: 0, height: 0 },
        elevation: 4,
      },
      badge: {
        position: 'absolute',
        bottom: spacing.xs,
        end: spacing.xs,
        width: BADGE,
        height: BADGE,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface.main,
      },
      remove: {
        position: 'absolute',
        top: spacing.xs,
        end: spacing.xs,
        width: REMOVE,
        height: REMOVE,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.media.glass,
      },
      length: {
        position: 'absolute',
        top: spacing.xs,
        start: spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.xs,
        borderRadius: radii.sm,
        backgroundColor: colors.media.glass,
      },
      failed: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        start: 0,
        end: 0,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        padding: spacing.sm,
        backgroundColor: colors.overlay,
        borderWidth: borderWidths.md,
        borderColor: colors.status.danger.main,
        borderRadius: radii.md,
      },
    }),
    [colors, height, lifted, width],
  );

  const percent = Math.round(progress * 100);
  const label =
    status === 'failed'
      ? t('marketplace.deals.drafts.upload.sheet.a11yFailed', { index, reason: failure ?? '' })
      : status === 'uploading'
        ? t('marketplace.deals.drafts.upload.sheet.a11yUploading', { index, percent })
        : t('marketplace.deals.drafts.upload.sheet.a11yFrame', { index });

  return (
    <Pressable
      style={styles.frame}
      onPress={onPress}
      onLongPress={onLongPress}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={onLongPress ? t('marketplace.deals.drafts.upload.sheet.reorder') : undefined}
    >
      {uri ? (
        kind === 'video' ? (
          <Video source={{ uri }} paused muted resizeMode="cover" style={StyleSheet.absoluteFill} />
        ) : (
          <Image uri={uri} width={width} height={height} resizeMode="cover" />
        )
      ) : null}
      {status === 'failed' ? null : (
        <Animated.View style={[styles.veil, veilStyle]} pointerEvents="none">
          {reduceMotion ? null : <Box style={styles.scan} />}
          {status === 'uploading' ? (
            <Box flex={1} align="center" justify="flex-end" pb="sm">
              <Text variant="title" color={colors.text.onBrand}>
                {`${percent}%`}
              </Text>
            </Box>
          ) : null}
        </Animated.View>
      )}
      {kind === 'video' && durationSec ? (
        <Box style={styles.length} pointerEvents="none">
          <Play size={sizes.icon.xs} color={colors.text.onBrand} fill={colors.text.onBrand} />
          <Text variant="caption" color={colors.text.onBrand}>
            {formatTimecode(durationSec)}
          </Text>
        </Box>
      ) : null}
      {status === 'failed' ? (
        <Pressable
          style={styles.failed}
          onPress={retryable ? onRetry : onRemove}
          accessibilityRole="button"
          accessibilityLabel={
            retryable
              ? t('marketplace.deals.drafts.upload.sheet.retry')
              : t('marketplace.deals.drafts.upload.sheet.remove')
          }
        >
          <Text variant="caption" color={colors.text.onBrand} align="center">
            {failure ?? t('marketplace.deals.drafts.upload.sheet.failed')}
          </Text>
          {retryable ? <RotateCw size={sizes.icon.sm} color={colors.text.onBrand} /> : null}
        </Pressable>
      ) : (
        <Box style={styles.badge} pointerEvents="none">
          <Text variant="caption" color={colors.brand.text}>
            {String(index)}
          </Text>
        </Box>
      )}
      {onRemove ? (
        <Pressable
          style={styles.remove}
          onPress={onRemove}
          hitSlop={HIT_SLOP}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.deals.drafts.upload.sheet.removeA11y', { index })}
        >
          <X size={sizes.icon.xs} color={colors.text.onBrand} />
        </Pressable>
      ) : null}
    </Pressable>
  );
};

export const DraftFrame = memo(DraftFrameComponent);
