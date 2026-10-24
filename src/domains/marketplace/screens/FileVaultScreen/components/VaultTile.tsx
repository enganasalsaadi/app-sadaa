import React, { memo, useCallback, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { Check, Download, Ellipsis, Play, RotateCcw } from 'lucide-react-native';
import { extensionOf, useDownloadEntry, type DownloadEntry } from '@/core/download';
import { iconStroke, motion, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Pressable, ProgressRing, Text, type ViewerFile } from '@/shared/ui';

/** A picked tile sinks a little, so the check reads as «in the pile». */
const SELECTED_SCALE = 0.92;
/** Grey lines on a document tile's paper. */
const PAPER_LINES = 3;

export interface VaultTileProps {
  file: ViewerFile;
  selecting: boolean;
  selected: boolean;
  /** Long-press starts select mode (only where «download all» works). */
  selectable: boolean;
  onOpen: (id: string) => void;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onSave: (file: ViewerFile) => void;
}

type CornerState = 'idle' | 'queued' | 'busy' | 'saved' | 'ready' | 'failed';

const cornerOf = (entry: DownloadEntry | undefined): CornerState => {
  if (!entry) return 'idle';
  switch (entry.status) {
    case 'queued':
      return 'queued';
    case 'downloading':
    case 'saving':
      return 'busy';
    case 'saved':
      return 'saved';
    case 'ready':
      return 'ready';
    case 'failed':
      return entry.failure === 'canceled' ? 'idle' : 'failed';
    default: {
      const _exhaustive: never = entry.status;
      return _exhaustive;
    }
  }
};

/**
 * One file in the vault grid: the photo itself, a play mark for a video, a paper sheet for a
 * document. The corner disc saves it (download → ring → ✓ saved). Select mode swaps the disc for
 * a check. A purged file stays in place, striped, with nothing to tap.
 */
const VaultTileComponent: React.FC<VaultTileProps> = ({
  file,
  selecting,
  selected,
  selectable,
  onOpen,
  onSelect,
  onToggle,
  onSave,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  // Its own entry only: a «download all» tick re-renders the tile it moves, not the grid.
  const entry = useDownloadEntry(file.id);
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    const target = selecting && selected ? SELECTED_SCALE : 1;
    scale.value = reduceMotion ? target : withSpring(target, motion.spring);
  }, [reduceMotion, scale, selected, selecting]);

  const motionStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const styles = useStyles(
    ({ spacing, radii, borderWidths }): Record<'cell' | 'tile' | 'corner' | 'ext' | 'name' | 'picked', ViewStyle> => ({
      cell: { padding: spacing.xs / 2 },
      tile: { aspectRatio: 1, borderRadius: radii.md, overflow: 'hidden' },
      corner: { position: 'absolute', top: spacing.xs, end: spacing.xs },
      ext: { position: 'absolute', top: spacing.sm, start: spacing.sm },
      name: { position: 'absolute', bottom: spacing.sm, start: spacing.sm, end: spacing.sm },
      picked: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        start: 0,
        end: 0,
        borderRadius: radii.md,
        borderWidth: borderWidths.md,
        borderColor: colors.interactive.main,
      },
    }),
    [colors.interactive.main],
  );

  const purged = file.url === null;
  const press = useCallback(() => (selecting ? onToggle(file.id) : onOpen(file.id)), [file.id, onOpen, onToggle, selecting]);
  const longPress = useCallback(() => {
    if (selectable && !selecting) onSelect(file.id);
  }, [file.id, onSelect, selectable, selecting]);
  const save = useCallback(() => onSave(file), [file, onSave]);

  if (purged) {
    return (
      <Box style={styles.cell}>
        <Box
          style={styles.tile}
          bg={colors.vault.stripe}
          align="center"
          justify="center"
          px="sm"
          accessible
          accessibilityLabel={t('marketplace.vault.tile.goneLabel', { name: file.name })}
        >
          <Text variant="caption" color={colors.text.secondary} align="center" numberOfLines={3}>
            {t('marketplace.vault.tile.gone')}
          </Text>
        </Box>
      </Box>
    );
  }

  const corner = cornerOf(entry);
  const percent = Math.round((entry?.progress ?? 0) * 100);
  const cornerLabel = {
    idle: t('marketplace.vault.tile.save', { name: file.name }),
    queued: t('marketplace.vault.tile.queued', { name: file.name }),
    busy: t('marketplace.vault.tile.busy', { name: file.name, percent }),
    saved: t('marketplace.vault.tile.saved', { name: file.name }),
    ready: t('marketplace.vault.tile.save', { name: file.name }),
    failed: t('marketplace.vault.tile.failed', { name: file.name }),
  }[corner];
  const discColor =
    corner === 'saved' ? colors.status.success.main : corner === 'failed' ? colors.status.danger.main : colors.vault.tileScrim;
  const glyph = colors.viewer.text;

  return (
    <Animated.View style={[styles.cell, motionStyle]}>
      <Pressable
        onPress={press}
        onLongPress={longPress}
        style={styles.tile}
        bg={file.kind === 'document' ? colors.surface.elevated : colors.viewer.backdrop}
        borderWidth={file.kind === 'document' ? 'thin' : undefined}
        borderColor={colors.border.default}
        accessibilityRole={selecting ? 'checkbox' : 'imagebutton'}
        accessibilityLabel={selecting ? file.name : t('marketplace.vault.tile.open', { name: file.name })}
        accessibilityState={selecting ? { checked: selected } : undefined}
      >
        {file.kind === 'image' && file.url ? (
          <Image uri={file.url} width="100%" height="100%" resizeMode="cover" />
        ) : file.kind === 'video' ? (
          <Box flex={1} align="center" justify="center">
            <Play size={sizes.icon.md} color={glyph} fill={glyph} strokeWidth={iconStroke.regular} />
          </Box>
        ) : (
          <Box flex={1} justify="center" px="md" gap="xs">
            {Array.from({ length: PAPER_LINES }, (_, line) => (
              <Box key={line} height={sizes.dot.sm / 2} borderRadius="full" bg={colors.border.default} />
            ))}
          </Box>
        )}

        {file.kind === 'document' ? (
          <>
            <Box style={styles.ext} px="xs" borderRadius="xs" bg={colors.status.danger.soft}>
              <Text variant="overline" color={colors.status.danger.text}>
                {extensionOf(file.name).toUpperCase()}
              </Text>
            </Box>
            <Box style={styles.name}>
              <Text variant="caption" numberOfLines={2}>
                {file.name}
              </Text>
            </Box>
          </>
        ) : null}

        {selecting && selected ? <Box style={styles.picked} pointerEvents="none" /> : null}
      </Pressable>

      <Box style={styles.corner}>
        {selecting ? (
          <Box
            width={sizes.vault.tileBadge}
            height={sizes.vault.tileBadge}
            borderRadius="full"
            align="center"
            justify="center"
            bg={selected ? colors.interactive.main : colors.vault.tileScrim}
            borderWidth="sm"
            borderColor={colors.viewer.text}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {selected ? <Check size={sizes.icon.xs} color={colors.text.onAccent} strokeWidth={iconStroke.bold} /> : null}
          </Box>
        ) : (
          <Pressable
            onPress={save}
            disabled={corner === 'queued' || corner === 'busy'}
            hitSlop={sizes.hitSlop.md}
            width={sizes.vault.tileBadge}
            height={sizes.vault.tileBadge}
            borderRadius="full"
            align="center"
            justify="center"
            bg={discColor}
            accessibilityRole="button"
            accessibilityLabel={cornerLabel}
            accessibilityState={{ busy: corner === 'busy' || corner === 'queued' }}
          >
            {corner === 'busy' ? (
              <ProgressRing
                progress={entry?.progress ?? 0}
                size={sizes.vault.tileBadge}
                stroke={sizes.dot.sm / 2}
                color={glyph}
                track={colors.viewer.ringTrack}
              />
            ) : corner === 'queued' ? (
              <Ellipsis size={sizes.icon.xs} color={glyph} strokeWidth={iconStroke.bold} />
            ) : corner === 'saved' ? (
              <Check size={sizes.icon.xs} color={colors.text.onAccent} strokeWidth={iconStroke.bold} />
            ) : corner === 'failed' ? (
              <RotateCcw size={sizes.icon.xs} color={colors.text.onAccent} strokeWidth={iconStroke.bold} />
            ) : (
              <Download size={sizes.icon.xs} color={glyph} strokeWidth={iconStroke.bold} />
            )}
          </Pressable>
        )}
      </Box>
    </Animated.View>
  );
};

export const VaultTile = memo(VaultTileComponent);
