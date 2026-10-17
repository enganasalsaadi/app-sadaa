import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { FileText, ImagePlus, Paperclip, RotateCw, X } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Image, Pressable, Text } from '@/shared/ui';
import type { BriefFileRow, BriefFilesView } from '../../utils/briefFiles';
import { BriefBlock } from './BriefBlock';

const TILE = moderateScale(96);

const isImage = (mime: string | null) => mime !== null && mime.startsWith('image/');

interface FileTileProps {
  row: BriefFileRow;
  attachments: BriefFilesView;
}

/**
 * One reference file as a square tile: the image itself or a PDF card, a remove button, and
 * while uploading its progress (or why it failed, with retry).
 */
const FileTile = memo<FileTileProps>(({ row, attachments }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ radii, spacing }): Record<'tile' | 'remove' | 'veil', ViewStyle> => ({
      tile: {
        width: TILE,
        height: TILE,
        borderRadius: radii.md,
        overflow: 'hidden',
        backgroundColor: colors.surface.elevated,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.sm,
      },
      remove: {
        position: 'absolute',
        top: spacing.xs,
        end: spacing.xs,
        width: sizes.icon.lg,
        height: sizes.icon.lg,
        borderRadius: radii.full,
        backgroundColor: colors.media.glass,
        alignItems: 'center',
        justifyContent: 'center',
      },
      veil: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        start: 0,
        end: 0,
        backgroundColor: colors.overlay,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        padding: spacing.sm,
      },
    }),
    [colors.media.glass, colors.overlay, colors.surface.elevated, sizes.icon.lg],
  );

  const name = row.kind === 'attached' ? row.file.name : row.entry.source.name;
  const mime = row.kind === 'attached' ? row.file.mime : row.entry.source.mime;
  const uri = row.kind === 'attached' ? row.file.url : row.entry.source.uri;
  const onRemove = () => (row.kind === 'attached' ? attachments.removeFile(row.file.id) : attachments.removeUpload(row.key));
  const failure = row.kind === 'upload' && row.entry.status === 'failed' ? row.entry.failure : null;
  const uploading = row.kind === 'upload' && row.entry.status !== 'failed';
  const failText =
    failure === 'type'
      ? t('marketplace.offer.brief.files.type')
      : failure === 'size'
        ? t('marketplace.offer.brief.files.size')
        : t('marketplace.offer.brief.files.failed');

  return (
    <Box style={styles.tile} accessibilityLabel={name}>
      {isImage(mime) && uri ? (
        <Image uri={uri} width={TILE} height={TILE} resizeMode="cover" />
      ) : (
        <Box align="center" gap="xs">
          <FileText size={sizes.icon.lg} color={colors.status.danger.main} />
          <Text variant="caption" color={colors.text.secondary} numberOfLines={2} align="center">
            {name}
          </Text>
        </Box>
      )}
      {uploading && row.kind === 'upload' ? (
        <Box style={styles.veil}>
          <Text variant="buttonSmall" color={colors.text.onBrand}>
            {formatNumber(row.entry.progress, { style: 'percent', maximumFractionDigits: 0 })}
          </Text>
        </Box>
      ) : null}
      {failure ? (
        <Box style={styles.veil}>
          <Text variant="caption" color={colors.text.onBrand} numberOfLines={2} align="center">
            {failText}
          </Text>
          {failure !== 'type' && failure !== 'size' ? (
            <Pressable
              width={sizes.button.md}
              height={sizes.button.md}
              align="center"
              justify="center"
              onPress={() => attachments.retry(row.key)}
              accessibilityRole="button"
              accessibilityLabel={t('marketplace.offer.brief.files.retry', { name })}
            >
              <RotateCw size={sizes.icon.sm} color={colors.text.onBrand} />
            </Pressable>
          ) : null}
        </Box>
      ) : null}
      <Pressable
        style={styles.remove}
        hitSlop={sizes.hitSlop.sm}
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.offer.brief.files.remove', { name })}
      >
        <X size={sizes.icon.xs} color={colors.text.onBrand} />
      </Pressable>
    </Box>
  );
});

interface BriefFileTilesProps {
  attachments: BriefFilesView;
  /** The files cap shown beside the title (5). */
  max: number;
  /** What happens to the files (differs between a signed deal and a campaign brief). */
  caption: string;
  onAdd: () => void;
}

/** Brief reference files (≤ 5 images / PDFs, ≤ 20 MB): tiles in a row, then «add file». */
const BriefFileTilesComponent: React.FC<BriefFileTilesProps> = ({ attachments, max, caption, onAdd }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const styles = useStyles(
    ({ borderWidths, radii }): Record<'add', ViewStyle> => ({
      add: {
        width: TILE,
        height: TILE,
        borderRadius: radii.md,
        borderWidth: borderWidths.md,
        borderStyle: 'dashed',
        borderColor: colors.border.strong,
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
    [colors.border.strong],
  );

  return (
    <BriefBlock
      icon={Paperclip}
      title={t('marketplace.offer.brief.files.title')}
      body={t('marketplace.offer.brief.files.body')}
      count={t('marketplace.offer.brief.count', { count: attachments.count, max })}
    >
      <Box row wrap gap="sm">
        {attachments.rows.map(row => (
          <Animated.View
            key={row.key}
            entering={reduceMotion ? undefined : FadeIn}
            exiting={reduceMotion ? undefined : FadeOut}
            layout={reduceMotion ? undefined : LinearTransition}
          >
            <FileTile row={row} attachments={attachments} />
          </Animated.View>
        ))}
        {attachments.canAdd ? (
          <Pressable
            style={styles.add}
            scaleOnPress
            onPress={onAdd}
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.offer.brief.files.add')}
          >
            <ImagePlus size={sizes.icon.md} color={colors.interactive.main} />
            <Text variant="caption" color={colors.interactive.text}>
              {t('marketplace.offer.brief.files.add')}
            </Text>
          </Pressable>
        ) : null}
      </Box>
      <Text variant="caption" color={colors.text.tertiary}>
        {caption}
      </Text>
    </BriefBlock>
  );
};

export const BriefFileTiles = memo(BriefFileTilesComponent);
