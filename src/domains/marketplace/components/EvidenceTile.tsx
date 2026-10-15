import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FileText, ImageOff, Play } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Pressable, Text } from '@/shared/ui';

const EVIDENCE_TILE = moderateScale(58);

/** What a tile shows: a photo opens in the viewer; video and documents are marked; a purged file says so. */
export type EvidenceTileKind = 'image' | 'video' | 'document' | 'gone';

export interface EvidenceTileProps {
  tileKey: string;
  kind: EvidenceTileKind;
  url: string | null;
  /** Small mark in the corner: where a pointed-at file came from (draft, proof, courier). */
  badge?: string;
  onOpen?: (key: string) => void;
  accessibilityLabel: string;
}

/** One piece of evidence in the thread, thumb-sized. */
const EvidenceTileComponent: React.FC<EvidenceTileProps> = ({ tileKey, kind, url, badge, onOpen, accessibilityLabel }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing }): Record<'tile' | 'badge', ViewStyle> => ({
      tile: {
        width: EVIDENCE_TILE,
        height: EVIDENCE_TILE,
        borderRadius: radii.lg,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:
          kind === 'video' ? colors.brand.main : kind === 'document' ? colors.status.danger.soft : colors.surface.elevated,
      },
      badge: {
        position: 'absolute',
        bottom: spacing.xs,
        start: spacing.xs,
        paddingHorizontal: spacing.xs,
        borderRadius: radii.sm,
        backgroundColor: colors.overlay,
      },
    }),
    [colors.brand.main, colors.overlay, colors.status.danger.soft, colors.surface.elevated, kind],
  );
  const viewable = kind === 'image' && url !== null && onOpen !== undefined;
  const onPress = useCallback(() => onOpen?.(tileKey), [onOpen, tileKey]);

  const body =
    kind === 'image' && url ? (
      <Image uri={url} width={EVIDENCE_TILE} height={EVIDENCE_TILE} resizeMode="cover" />
    ) : kind === 'video' ? (
      <Play size={sizes.icon.md} color={colors.text.onBrand} />
    ) : kind === 'document' ? (
      <FileText size={sizes.icon.md} color={colors.status.danger.main} />
    ) : (
      <ImageOff size={sizes.icon.md} color={colors.icon.disabled} />
    );

  return (
    <Pressable
      onPress={onPress}
      disabled={!viewable}
      scaleOnPress={viewable}
      accessibilityRole={viewable ? 'imagebutton' : 'image'}
      accessibilityLabel={kind === 'gone' ? t('marketplace.deals.dispute.file.gone') : accessibilityLabel}
    >
      <Box style={styles.tile}>
        {body}
        {badge ? (
          <Box style={styles.badge}>
            <Text variant="caption" color={colors.text.onBrand}>
              {badge}
            </Text>
          </Box>
        ) : null}
      </Box>
    </Pressable>
  );
};

export const EvidenceTile = memo(EvidenceTileComponent);
