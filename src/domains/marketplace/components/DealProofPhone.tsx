import React, { memo, useEffect, useRef } from 'react';
import { Vibration, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ImageOff, RotateCw, X, ZoomIn } from 'lucide-react-native';
import { HAPTIC_TAP_MS } from '@/core/config';
import { moderateScale, motion, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Pressable, Text } from '@/shared/ui';

/** A phone screen's shape: screenshots are taken on one. */
export const PROOF_PHONE_RATIO = 17 / 9;
const NOTCH = { width: 0.34, height: moderateScale(6) };
const BADGE = moderateScale(24);
const REMOVE = moderateScale(28);
const SCAN = moderateScale(3);
const HIT_SLOP = moderateScale(10);

export type DealProofPhoneStatus = 'done' | 'uploading' | 'failed';

export interface DealProofPhoneProps {
  uri: string | null;
  width: number;
  /** 1-based. */
  index: number;
  status?: DealProofPhoneStatus;
  /** 0–1 while uploading. */
  progress?: number;
  failure?: string | null;
  retryable?: boolean;
  /** A tag over the top of the screen («Tap to zoom»). */
  tag?: string | null;
  accessibilityLabel: string;
  onPress?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
  onRetry?: () => void;
}

/**
 * One proof screenshot drawn as a phone screen (approved P7): a notch, the shot edge to edge, its
 * number. While it uploads a navy veil recedes from the top behind a teal scan line with the share
 * on it, so the screenshot «develops»; done, it lifts with a light tap. Used by the creator's
 * hand-in and the brand's check.
 */
const DealProofPhoneComponent: React.FC<DealProofPhoneProps> = ({
  uri,
  width,
  index,
  status = 'done',
  progress = 1,
  failure = null,
  retryable = false,
  tag = null,
  accessibilityLabel,
  onPress,
  onRemove,
  removeLabel,
  onRetry,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const height = Math.round(width * PROOF_PHONE_RATIO);
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

  const veilStyle = useAnimatedStyle(() => ({ top: developed.value * height, opacity: veil.value }));

  const styles = useStyles(
    ({ radii, spacing, shadows, borderWidths }): Record<
      'phone' | 'notch' | 'veil' | 'scan' | 'badge' | 'remove' | 'tag' | 'failed' | 'missing',
      ViewStyle
    > => ({
      phone: {
        width,
        height,
        borderRadius: radii.lg,
        overflow: 'hidden',
        backgroundColor: colors.surface.elevated,
        ...shadows.card,
      },
      notch: {
        position: 'absolute',
        top: spacing.xs,
        alignSelf: 'center',
        width: width * NOTCH.width,
        height: NOTCH.height,
        borderRadius: radii.full,
        backgroundColor: colors.media.glass,
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
        bottom: spacing.sm,
        start: spacing.sm,
        minWidth: BADGE,
        height: BADGE,
        paddingHorizontal: spacing.xs,
        borderRadius: radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.media.glass,
      },
      remove: {
        position: 'absolute',
        top: spacing.lg,
        end: spacing.xs,
        width: REMOVE,
        height: REMOVE,
        borderRadius: radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.media.glass,
      },
      tag: {
        position: 'absolute',
        top: spacing.lg,
        start: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
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
        borderRadius: radii.lg,
      },
      missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    }),
    [colors, height, width],
  );

  const percent = Math.round(progress * 100);

  return (
    <Pressable
      style={styles.phone}
      onPress={onPress}
      disabled={!onPress}
      scaleOnPress={Boolean(onPress)}
      accessibilityRole={onPress ? 'imagebutton' : 'image'}
      accessibilityLabel={accessibilityLabel}
    >
      {uri ? (
        <Image uri={uri} width={width} height={height} resizeMode="cover" />
      ) : (
        <Box style={styles.missing}>
          <ImageOff size={sizes.icon.md} color={colors.icon.disabled} />
        </Box>
      )}
      <Box style={styles.notch} pointerEvents="none" />
      {status === 'failed' ? null : (
        <Animated.View style={[styles.veil, veilStyle]} pointerEvents="none">
          {reduceMotion ? null : <Box style={styles.scan} />}
          {status === 'uploading' ? (
            <Box flex={1} align="center" justify="center">
              <Text variant="title" color={colors.text.onBrand}>
                {`${percent}%`}
              </Text>
            </Box>
          ) : null}
        </Animated.View>
      )}
      {tag && status === 'done' ? (
        <Box style={styles.tag} pointerEvents="none">
          <ZoomIn size={sizes.icon.xs} color={colors.text.onBrand} />
          <Text variant="caption" color={colors.text.onBrand}>
            {tag}
          </Text>
        </Box>
      ) : null}
      {status === 'failed' ? (
        <Pressable
          style={styles.failed}
          onPress={retryable ? onRetry : onRemove}
          accessibilityRole="button"
          accessibilityLabel={retryable ? t('marketplace.deals.publish.creator.proofs.retry') : removeLabel}
        >
          <Text variant="caption" color={colors.text.onBrand} align="center">
            {failure ?? t('marketplace.deals.publish.creator.proofs.failed')}
          </Text>
          {retryable ? <RotateCw size={sizes.icon.sm} color={colors.text.onBrand} /> : null}
        </Pressable>
      ) : (
        <Box style={styles.badge} pointerEvents="none">
          <Text variant="caption" color={colors.text.onBrand}>
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
          accessibilityLabel={removeLabel}
        >
          <X size={sizes.icon.xs} color={colors.text.onBrand} />
        </Pressable>
      ) : null}
    </Pressable>
  );
};

export const DealProofPhone = memo(DealProofPhoneComponent);
