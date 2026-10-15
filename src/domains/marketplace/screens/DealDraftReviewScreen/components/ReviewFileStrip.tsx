import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Pressable, Rail, Text } from '@/shared/ui';
import { DEAL_DRAFT_KIND_LABEL } from '../../../constants/dealDrafts';
import type { DealFile } from '../../../types';

const THUMB = moderateScale(56);
const BADGE = moderateScale(20);

export interface ReviewFileStripProps {
  files: DealFile[];
  selected: number;
  /** Notes pinned per file id. */
  pinCounts: Readonly<Record<string, number>>;
  onSelect: (index: number) => void;
}

const Thumb = memo<{
  file: DealFile;
  index: number;
  selected: boolean;
  pins: number;
  onSelect: (index: number) => void;
}>(({ file, index, selected, pins, onSelect }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const select = useCallback(() => onSelect(index), [index, onSelect]);
  const kind = file.kind === 'video' ? 'video' : 'image';
  const styles = useStyles(
    ({ radii, borderWidths }): Record<'thumb' | 'badge', ViewStyle> => ({
      thumb: {
        width: THUMB,
        height: THUMB,
        borderRadius: radii.md,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.glass.fill,
        borderWidth: borderWidths.md,
        borderColor: selected ? colors.draft.scan : colors.layout.transparent,
        opacity: selected ? 1 : 0.6,
      },
      badge: {
        position: 'absolute',
        top: 0,
        end: 0,
        minWidth: BADGE,
        height: BADGE,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.draft.pin,
      },
    }),
    [colors, selected],
  );
  return (
    <Pressable
      onPress={select}
      scaleOnPress
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={t('marketplace.deals.drafts.review.fileA11y', {
        index: index + 1,
        kind: t(DEAL_DRAFT_KIND_LABEL[kind]),
      })}
    >
      <Box style={styles.thumb}>
        {kind === 'image' && file.url ? (
          <Image uri={file.url} width={THUMB} height={THUMB} resizeMode="cover" />
        ) : (
          <Play size={sizes.icon.sm} color={colors.text.onBrand} fill={colors.text.onBrand} />
        )}
      </Box>
      {pins > 0 ? (
        <Box style={styles.badge} pointerEvents="none">
          <Text variant="caption" color={colors.draft.onPin}>
            {String(pins)}
          </Text>
        </Box>
      ) : null}
    </Pressable>
  );
});

/** The round's files under the stage; amber counts = notes pinned on each. */
const ReviewFileStripComponent: React.FC<ReviewFileStripProps> = ({ files, selected, pinCounts, onSelect }) => {
  if (files.length < 2) return null;
  return (
    <Rail gap="sm" py="sm" accessibilityRole="tablist">
      {files.map((file, index) => (
        <Thumb
          key={file.id}
          file={file}
          index={index}
          selected={index === selected}
          pins={pinCounts[file.id] ?? 0}
          onSelect={onSelect}
        />
      ))}
    </Rail>
  );
};

export const ReviewFileStrip = memo(ReviewFileStripComponent);
