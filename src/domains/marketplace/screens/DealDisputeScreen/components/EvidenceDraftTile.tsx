import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FileText, Play, RotateCw, X } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Pressable, Text } from '@/shared/ui';
import type { EvidenceFile } from '../hooks/useEvidenceFiles';

export const EVIDENCE_DRAFT_TILE = moderateScale(92);
const REMOVE = moderateScale(26);
const HIT = moderateScale(9);

export interface EvidenceDraftTileProps {
  file: EvidenceFile;
  onRemove: (key: string) => void;
  onRetry: (key: string) => void;
}

/** A picked file in the evidence sheet: its thumb (or kind), upload fill, failure, remove. */
const EvidenceDraftTileComponent: React.FC<EvidenceDraftTileProps> = ({ file, onRemove, onRetry }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const remove = useCallback(() => onRemove(file.key), [file.key, onRemove]);
  const retry = useCallback(() => onRetry(file.key), [file.key, onRetry]);
  const failed = file.status === 'failed';
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'tile' | 'fill' | 'veil' | 'remove' | 'track' | 'bar' | 'caption', ViewStyle> => ({
      tile: {
        width: EVIDENCE_DRAFT_TILE,
        height: EVIDENCE_DRAFT_TILE,
        borderRadius: radii.lg,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        padding: spacing.sm,
        backgroundColor: file.kind === 'video' ? colors.brand.main : colors.surface.main,
        borderWidth: failed ? borderWidths.md : 0,
        borderColor: colors.status.danger.main,
      },
      fill: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0 },
      veil: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        start: 0,
        end: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.overlay,
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
        backgroundColor: colors.overlay,
      },
      track: { position: 'absolute', bottom: 0, start: 0, end: 0, height: spacing.xs, backgroundColor: colors.overlay },
      caption: { width: EVIDENCE_DRAFT_TILE },
      bar: { height: '100%', width: `${Math.round(file.progress * 100)}%`, backgroundColor: colors.interactive.main },
    }),
    [colors, failed, file.kind, file.progress],
  );

  return (
    <Box gap="xs">
      <Box style={styles.tile} accessible accessibilityLabel={file.failure ?? file.name}>
        {file.kind === 'image' ? (
          <Box style={styles.fill}>
            <Image uri={file.uri} width={EVIDENCE_DRAFT_TILE} height={EVIDENCE_DRAFT_TILE} resizeMode="cover" />
          </Box>
        ) : file.kind === 'video' ? (
          <Play size={sizes.icon.lg} color={colors.text.onBrand} />
        ) : (
          <>
            <FileText size={sizes.icon.lg} color={colors.status.danger.main} />
            <Text variant="caption" color={colors.text.secondary} numberOfLines={2} align="center">
              {file.name}
            </Text>
          </>
        )}
        {file.status === 'uploading' ? (
          <Box style={styles.track}>
            <Box style={styles.bar} />
          </Box>
        ) : null}
        {failed && file.retryable ? (
          <Pressable
            style={styles.veil}
            onPress={retry}
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.deals.dispute.evidence.retry')}
          >
            <RotateCw size={sizes.icon.md} color={colors.text.onBrand} />
          </Pressable>
        ) : null}
        <Pressable
          style={styles.remove}
          onPress={remove}
          hitSlop={HIT}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.deals.dispute.evidence.remove', { name: file.name })}
        >
          <X size={sizes.icon.xs} color={colors.text.onBrand} />
        </Pressable>
      </Box>
      {file.failure ? (
        <Text variant="caption" color={colors.status.danger.text} numberOfLines={2} style={styles.caption}>
          {file.failure}
        </Text>
      ) : null}
    </Box>
  );
};

export const EvidenceDraftTile = memo(EvidenceDraftTileComponent);
