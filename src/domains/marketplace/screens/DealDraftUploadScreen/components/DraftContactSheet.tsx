import React, { memo, useCallback } from 'react';
import { useWindowDimensions, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import type { DraftSheetFrame } from '../hooks/useDraftFrames';
import { DraftFrame } from './DraftFrame';

const COLUMNS = 3;
/** Stable ids for one row of sprocket holes. */
const HOLES = Array.from({ length: 12 }, (_, hole) => `hole-${hole}`);
const HOLE_W = moderateScale(12);
const HOLE_H = moderateScale(8);
const ADD_DOT = moderateScale(36);
/** Frames are portrait, like the posts they become. */
const FRAME_RATIO = 1.25;

export interface DraftContactSheetProps {
  frames: DraftSheetFrame[];
  max: number;
  /** Putting a round together (else a handed-in round, read only). */
  editable: boolean;
  canAdd: boolean;
  /** The frame lifted for a move. */
  moving: string | null;
  error: string | null;
  onAdd?: () => void;
  onLift?: (key: string) => void;
  onDrop?: (key: string) => void;
  onRemove?: (key: string) => void;
  onRetry?: (key: string) => void;
}

const Holes = memo(() => {
  const styles = useStyles(
    ({ radii, colors }): Record<'hole', ViewStyle> => ({
      hole: { width: HOLE_W, height: HOLE_H, borderRadius: radii.xs, backgroundColor: colors.draft.filmHole },
    }),
  );
  return (
    <Box row justify="space-between" px="xs" pointerEvents="none">
      {HOLES.map(hole => (
        <Box key={hole} style={styles.hole} />
      ))}
    </Box>
  );
});

const SheetFrame = memo<{
  frame: DraftSheetFrame;
  index: number;
  size: { width: number; height: number };
  editable: boolean;
  moving: string | null;
  onLift?: (key: string) => void;
  onDrop?: (key: string) => void;
  onRemove?: (key: string) => void;
  onRetry?: (key: string) => void;
}>(({ frame, index, size, editable, moving, onLift, onDrop, onRemove, onRetry }) => {
  const { key } = frame;
  const lift = useCallback(() => onLift?.(key), [key, onLift]);
  const drop = useCallback(() => onDrop?.(key), [key, onDrop]);
  const remove = useCallback(() => onRemove?.(key), [key, onRemove]);
  const retry = useCallback(() => onRetry?.(key), [key, onRetry]);
  return (
    <DraftFrame
      uri={frame.uri}
      kind={frame.kind}
      index={index + 1}
      width={size.width}
      height={size.height}
      status={frame.status}
      progress={frame.progress}
      failure={frame.failure}
      retryable={frame.retryable}
      durationSec={frame.durationSec}
      lifted={moving === key}
      onLongPress={editable ? lift : undefined}
      onPress={editable && moving !== null ? drop : undefined}
      onRemove={editable ? remove : undefined}
      onRetry={editable ? retry : undefined}
    />
  );
});

/**
 * The round as a strip of film (approved «غرفة التحميض»): sprocket holes above and below a grid of
 * portrait frames, the «add» frame last. Long-press a frame, then tap where it goes.
 */
const DraftContactSheetComponent: React.FC<DraftContactSheetProps> = ({
  frames,
  max,
  editable,
  canAdd,
  moving,
  error,
  onAdd,
  onLift,
  onDrop,
  onRemove,
  onRetry,
}) => {
  const { t } = useTranslation();
  const { colors, spacing, sizes } = useTheme();
  const { width: screen } = useWindowDimensions();
  const width = Math.floor((screen - spacing.xl * 2 - spacing.sm * 2 - spacing.sm * (COLUMNS - 1)) / COLUMNS);
  const size = { width, height: Math.round(width * FRAME_RATIO) };
  const styles = useStyles(
    ({ radii, borderWidths }): Record<'film' | 'grid' | 'add' | 'addDot', ViewStyle> => ({
      film: {
        borderRadius: radii.xl,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        gap: spacing.sm,
        backgroundColor: colors.draft.film,
        borderWidth: borderWidths.thin,
        borderColor: colors.border.card,
      },
      grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
      add: {
        width: size.width,
        height: size.height,
        borderRadius: radii.md,
        borderWidth: borderWidths.thin,
        borderStyle: 'dashed',
        borderColor: colors.draft.filmBorder,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
      },
      addDot: {
        width: ADD_DOT,
        height: ADD_DOT,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.draft.addFill,
      },
    }),
    [colors, size.height, size.width, spacing],
  );

  const hint =
    moving !== null
      ? t('marketplace.deals.drafts.upload.sheet.moving')
      : editable && frames.length > 1
        ? t('marketplace.deals.drafts.upload.sheet.reorder')
        : null;

  return (
    <Box gap="sm">
      <Box style={styles.film}>
        <Holes />
        <Box style={styles.grid}>
          {frames.map((frame, index) => (
            <SheetFrame
              key={frame.key}
              frame={frame}
              index={index}
              size={size}
              editable={editable}
              moving={moving}
              onLift={onLift}
              onDrop={onDrop}
              onRemove={onRemove}
              onRetry={onRetry}
            />
          ))}
          {editable && canAdd ? (
            <Pressable
              style={styles.add}
              onPress={onAdd}
              scaleOnPress
              accessibilityRole="button"
              accessibilityLabel={t('marketplace.deals.drafts.upload.sheet.addA11y')}
            >
              <Box style={styles.addDot}>
                <Plus size={sizes.icon.md} color={colors.draft.scan} />
              </Box>
              <Text variant="caption" color={colors.text.onBrandMuted}>
                {t('marketplace.deals.drafts.upload.sheet.add')}
              </Text>
            </Pressable>
          ) : null}
        </Box>
        <Holes />
        <Box row justify="space-between" px="xs">
          <Text variant="caption" color={colors.text.onBrandMuted}>
            {t('marketplace.deals.drafts.upload.sheet.count', { files: frames.length, max })}
          </Text>
          {hint ? (
            <Text variant="caption" color={colors.text.onBrandMuted}>
              {hint}
            </Text>
          ) : null}
        </Box>
      </Box>
      {error ? (
        <Text variant="caption" color={colors.status.danger.text}>
          {error}
        </Text>
      ) : null}
    </Box>
  );
};

export const DraftContactSheet = memo(DraftContactSheetComponent);
