import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Check, Download, FileText, Play, X } from 'lucide-react-native';
import { iconStroke, motion, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Pressable, ProgressRing, Text } from '@/shared/ui';
import { formatFileSize } from '@/shared/utils';
import type { VaultBatchView, VaultDeckPreview } from '../hooks/useFileVaultScreen';

/** How far above the ring a saved file's thumbnail starts its drop (thumb heights). */
const FLY_FROM = 2.5;

export type VaultDockMode =
  | { type: 'idle'; hint: string; bytes: number; onDownload: () => void }
  | { type: 'select'; count: number; bytes: number; onDownload: () => void }
  | {
      type: 'batch';
      batch: VaultBatchView;
      flyer: VaultDeckPreview | null;
      onCancel: () => void;
      onDismiss: () => void;
      onRetry: () => void;
      onSaveReady: () => void;
    };

export interface VaultDockProps {
  mode: VaultDockMode;
}

const Flyer = memo<{ preview: VaultDeckPreview }>(({ preview }) => {
  const { colors, sizes } = useTheme();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: motion.duration.slow });
  }, [progress]);
  const styles = useStyles(
    ({ radii }): Record<'flyer', ViewStyle> => ({
      flyer: {
        position: 'absolute',
        width: sizes.vault.flyer,
        height: sizes.vault.flyer,
        borderRadius: radii.sm,
        overflow: 'hidden',
        backgroundColor: colors.viewer.backdrop,
      },
    }),
    [colors.viewer.backdrop, sizes.vault.flyer],
  );
  const flight = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateY: -sizes.vault.flyer * FLY_FROM * (1 - progress.value) },
      { scale: 1 - progress.value / 2 },
    ],
  }));
  const Icon = preview.kind === 'video' ? Play : FileText;
  return (
    <Animated.View style={[styles.flyer, flight]} pointerEvents="none">
      {preview.uri ? (
        <Image uri={preview.uri} width="100%" height="100%" resizeMode="cover" />
      ) : (
        <Box flex={1} align="center" justify="center">
          <Icon size={sizes.icon.xs} color={colors.viewer.text} strokeWidth={iconStroke.regular} />
        </Box>
      )}
    </Animated.View>
  );
});
Flyer.displayName = 'Flyer';

interface DockButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: boolean;
  accessibilityLabel?: string;
}

const DockButton = memo<DockButtonProps>(({ label, onPress, disabled = false, icon = false, accessibilityLabel }) => {
  const { colors, sizes } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      scaleOnPress
      row
      align="center"
      gap="xs"
      px="lg"
      minHeight={sizes.iconButton.md}
      borderRadius="full"
      bg={colors.interactive.main}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
    >
      {icon ? <Download size={sizes.icon.sm} color={colors.text.onAccent} strokeWidth={iconStroke.bold} /> : null}
      <Text variant="buttonSmall" color={colors.text.onAccent}>
        {label}
      </Text>
    </Pressable>
  );
});
DockButton.displayName = 'DockButton';

/**
 * The floating download dock: «download all» with where files land, «download N» in select mode,
 * the running count in a ring (saved thumbnails drop into it) with ×, then the outcome with what's
 * left to do (save documents to Files, retry what failed).
 */
const VaultDockComponent: React.FC<VaultDockProps> = ({ mode }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const styles = useStyles(
    ({ spacing, radii, shadows, borderWidths }): Record<'dock', ViewStyle> => ({
      dock: {
        position: 'absolute',
        start: spacing.xl,
        end: spacing.xl,
        bottom: Math.max(bottom, spacing.md) + spacing.sm,
        minHeight: sizes.vault.dockRing + spacing.md * 2,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radii.xl,
        backgroundColor: colors.vault.dock,
        borderWidth: borderWidths.hairline,
        borderColor: colors.vault.dockBorder,
        ...shadows.lg,
      },
    }),
    [bottom, colors.vault.dock, colors.vault.dockBorder, sizes.vault.dockRing],
  );

  const text = colors.vault.dockText;
  const muted = colors.vault.dockMuted;

  const body = (() => {
    switch (mode.type) {
      case 'idle':
        return (
          <>
            <Box flex={1}>
              <Text variant="bodyMedium" color={text}>
                {t('marketplace.vault.dock.downloadAll')}
              </Text>
              <Text variant="caption" color={muted} numberOfLines={2}>
                {mode.hint}
              </Text>
            </Box>
            <DockButton
              icon
              label={formatFileSize(mode.bytes)}
              accessibilityLabel={`${t('marketplace.vault.dock.downloadAll')}، ${formatFileSize(mode.bytes)}`}
              onPress={mode.onDownload}
            />
          </>
        );
      case 'select':
        return (
          <>
            <Box flex={1}>
              <Text variant="bodyMedium" color={text}>
                {t('marketplace.vault.dock.downloadSelected', { count: mode.count })}
              </Text>
              {mode.count > 0 ? (
                <Text variant="caption" color={muted}>
                  {formatFileSize(mode.bytes)}
                </Text>
              ) : null}
            </Box>
            <DockButton
              icon
              label={t('marketplace.vault.dock.go')}
              accessibilityLabel={t('marketplace.vault.dock.downloadSelected', { count: mode.count })}
              disabled={mode.count === 0}
              onPress={mode.onDownload}
            />
          </>
        );
      case 'batch': {
        const { batch } = mode;
        if (!batch.finished) {
          return (
            <>
              <Box align="center" justify="center">
                <ProgressRing
                  progress={batch.total > 0 ? batch.settled / batch.total : 0}
                  size={sizes.vault.dockRing}
                  stroke={sizes.dot.sm / 2}
                  color={colors.interactive.main}
                  track={colors.vault.dockRingTrack}
                >
                  <Text variant="overline" color={text}>
                    {t('marketplace.vault.dock.ring', { done: batch.settled, total: batch.total })}
                  </Text>
                </ProgressRing>
                {mode.flyer && !reduceMotion ? <Flyer key={mode.flyer.id} preview={mode.flyer} /> : null}
              </Box>
              <Box flex={1} accessibilityLiveRegion="polite">
                <Text variant="bodyMedium" color={text}>
                  {t('marketplace.vault.dock.running')}
                </Text>
                <Text variant="caption" color={muted} numberOfLines={1}>
                  {t('marketplace.vault.dock.progress', {
                    done: formatFileSize(batch.doneBytes),
                    total: formatFileSize(batch.totalBytes),
                  })}
                </Text>
              </Box>
              <Pressable
                onPress={mode.onCancel}
                width={sizes.iconButton.md}
                height={sizes.iconButton.md}
                borderRadius="full"
                align="center"
                justify="center"
                bg={colors.vault.dockStop}
                accessibilityRole="button"
                accessibilityLabel={t('marketplace.vault.dock.cancel')}
              >
                <X size={sizes.icon.sm} color={text} strokeWidth={iconStroke.bold} />
              </Pressable>
            </>
          );
        }
        return (
          <>
            <Box
              width={sizes.vault.dockRing}
              height={sizes.vault.dockRing}
              borderRadius="full"
              align="center"
              justify="center"
              bg={colors.status.success.main}
            >
              <Check size={sizes.icon.md} color={colors.text.onAccent} strokeWidth={iconStroke.bold} />
            </Box>
            <Box flex={1} accessibilityLiveRegion="polite">
              <Text variant="bodyMedium" color={text}>
                {t('marketplace.vault.dock.done', { count: batch.saved })}
              </Text>
              {batch.failed > 0 ? (
                <Text variant="caption" color={muted}>
                  {t('marketplace.vault.dock.failed', { count: batch.failed })}
                </Text>
              ) : null}
              {batch.ready.length > 0 ? (
                <Text variant="caption" color={muted} numberOfLines={2}>
                  {t('marketplace.vault.dock.ready', { count: batch.ready.length })}
                </Text>
              ) : null}
            </Box>
            {batch.ready.length > 0 ? (
              <DockButton label={t('marketplace.vault.dock.saveDocuments')} onPress={mode.onSaveReady} />
            ) : batch.failed > 0 ? (
              <DockButton label={t('marketplace.vault.dock.retry')} onPress={mode.onRetry} />
            ) : null}
            <Pressable
              onPress={mode.onDismiss}
              width={sizes.iconButton.md}
              height={sizes.iconButton.md}
              borderRadius="full"
              align="center"
              justify="center"
              bg={colors.vault.dockStop}
              accessibilityRole="button"
              accessibilityLabel={t('marketplace.vault.dock.dismiss')}
            >
              <X size={sizes.icon.sm} color={text} strokeWidth={iconStroke.bold} />
            </Pressable>
          </>
        );
      }
      default: {
        const _exhaustive: never = mode;
        return _exhaustive;
      }
    }
  })();

  return (
    <Animated.View
      style={styles.dock}
      entering={reduceMotion ? undefined : FadeIn.duration(motion.duration.base)}
      exiting={reduceMotion ? undefined : FadeOut.duration(motion.duration.fast)}
    >
      <Box flex={1} row align="center" gap="md">
        {body}
      </Box>
    </Animated.View>
  );
};

export const VaultDock = memo(VaultDockComponent);
