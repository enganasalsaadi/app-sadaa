import React, { memo, useCallback } from 'react';
import { useWindowDimensions, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { DealProofPhone, PROOF_PHONE_RATIO } from './DealProofPhone';
import type { ProofFrame } from '../hooks/useProofFrames';

const PLUS = moderateScale(40);

export interface DealProofShotsProps {
  /** Overline above the row, and the line under it when nothing is wrong. */
  title: string;
  hint: string;
  frames: ProofFrame[];
  max: number;
  error: string | null;
  onAdd: () => void;
  onRemove: (key: string) => void;
  onRetry: (key: string) => void;
}

const Shot = memo<{
  frame: ProofFrame;
  index: number;
  width: number;
  onRemove: (key: string) => void;
  onRetry: (key: string) => void;
}>(({ frame, index, width, onRemove, onRetry }) => {
  const { t } = useTranslation();
  const remove = useCallback(() => onRemove(frame.key), [frame.key, onRemove]);
  const retry = useCallback(() => onRetry(frame.key), [frame.key, onRetry]);
  const percent = `${Math.round(frame.progress * 100)}%`;
  const label =
    frame.status === 'failed'
      ? t('marketplace.deals.publish.creator.proofs.a11yFailed', { index, reason: frame.failure ?? '' })
      : frame.status === 'uploading'
        ? t('marketplace.deals.publish.creator.proofs.a11yUploading', { index, percent })
        : t('marketplace.deals.publish.creator.proofs.a11y', { index });
  return (
    <DealProofPhone
      uri={frame.uri}
      width={width}
      index={index}
      status={frame.status}
      progress={frame.progress}
      failure={frame.failure}
      retryable={frame.retryable}
      accessibilityLabel={label}
      onRemove={remove}
      removeLabel={t('marketplace.deals.publish.creator.proofs.remove', { index })}
      onRetry={retry}
    />
  );
});

/**
 * Up to three screenshots as phone screens side by side; the next free one is a dashed «add»
 * slot (optional once one is in), any left after it stay faint. Proof of a live post (P7) and
 * the retention report / restore (P9.2).
 */
const DealProofShotsComponent: React.FC<DealProofShotsProps> = ({
  title,
  hint,
  frames,
  max,
  error,
  onAdd,
  onRemove,
  onRetry,
}) => {
  const { t } = useTranslation();
  const { colors, sizes, spacing } = useTheme();
  const { width: screen } = useWindowDimensions();
  const width = Math.floor((screen - spacing.xl * 2 - spacing.md * (max - 1)) / max);
  const height = Math.round(width * PROOF_PHONE_RATIO);
  const open = Math.max(0, max - frames.length);

  const styles = useStyles(
    ({ radii, borderWidths }): Record<'slot' | 'faint' | 'plus', ViewStyle> => ({
      slot: {
        width,
        height,
        borderRadius: radii.lg,
        borderWidth: borderWidths.md,
        borderStyle: 'dashed',
        borderColor: error && frames.length === 0 ? colors.status.warning.main : colors.border.default,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        padding: spacing.sm,
      },
      faint: {
        width,
        height,
        borderRadius: radii.lg,
        borderWidth: borderWidths.thin,
        borderStyle: 'dashed',
        borderColor: colors.border.default,
        opacity: 0.5,
      },
      plus: {
        width: PLUS,
        height: PLUS,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.interactive.soft,
      },
    }),
    [colors, error, frames.length, height, spacing.sm, width],
  );

  return (
    <Box gap="sm">
      <Box row align="center" justify="space-between">
        <Text variant="overline" color={colors.text.tertiary}>
          {title}
        </Text>
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.deals.publish.creator.proofs.count', {
            count: formatNumber(frames.length),
            max: formatNumber(max),
          })}
        </Text>
      </Box>
      <Box row gap="md">
        {frames.map((frame, index) => (
          <Shot key={frame.key} frame={frame} index={index + 1} width={width} onRemove={onRemove} onRetry={onRetry} />
        ))}
        {open > 0 ? (
          <Pressable
            style={styles.slot}
            onPress={onAdd}
            scaleOnPress
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.deals.publish.creator.proofs.add')}
          >
            <Box style={styles.plus}>
              <Plus size={sizes.icon.md} color={colors.interactive.text} />
            </Box>
            <Text variant="caption" color={colors.text.tertiary} align="center">
              {frames.length > 0
                ? t('marketplace.deals.publish.creator.proofs.addMore')
                : t('marketplace.deals.publish.creator.proofs.add')}
            </Text>
          </Pressable>
        ) : null}
        {Array.from({ length: Math.max(0, open - 1) }, (_, index) => (
          <Box key={`faint-${index}`} style={styles.faint} />
        ))}
      </Box>
      <Text variant="caption" color={error ? colors.status.warning.text : colors.text.tertiary}>
        {error ?? hint}
      </Text>
    </Box>
  );
};

export const DealProofShots = memo(DealProofShotsComponent);
