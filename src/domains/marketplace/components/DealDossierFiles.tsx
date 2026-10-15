import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FileText, ImageIcon, Play } from 'lucide-react-native';
import type { ParseKeys } from 'i18next';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, GalleryModal, Image, Pressable, Rail, Text } from '@/shared/ui';
import { formatFileSize } from '@/shared/utils';
import { isViewableImage, useDealGallery } from '../hooks/useDealGallery';
import type { DealFile, DealFileKind } from '../types';

const TILE = moderateScale(118);

const KIND_LABEL = {
  image: 'marketplace.deals.dossier.kind.image',
  video: 'marketplace.deals.dossier.kind.video',
  document: 'marketplace.deals.dossier.kind.document',
} as const satisfies Record<DealFileKind, ParseKeys>;

export interface DealDossierFilesProps {
  files: DealFile[];
}

const FileTile = memo<{ file: DealFile; onOpen: (id: string) => void }>(
  ({ file, onOpen }) => {
    const { t } = useTranslation();
    const { colors, sizes } = useTheme();
    const viewable = isViewableImage(file);
    const kind = file.kind ?? 'document';
    const styles = useStyles(
      ({ radii, spacing }): Record<'tile' | 'thumb' | 'kind', ViewStyle> => ({
        tile: { width: TILE, gap: spacing.xs },
        thumb: {
          width: TILE,
          height: TILE,
          borderRadius: radii.xl,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            kind === 'video'
              ? colors.brand.main
              : kind === 'document'
              ? colors.status.danger.soft
              : colors.surface.elevated,
        },
        kind: {
          position: 'absolute',
          top: spacing.sm,
          start: spacing.sm,
          paddingHorizontal: spacing.xs,
          paddingVertical: spacing.xs,
          borderRadius: radii.sm,
          backgroundColor: colors.overlay,
        },
      }),
      [
        colors.brand.main,
        colors.overlay,
        colors.status.danger.soft,
        colors.surface.elevated,
        kind,
      ],
    );
    const onPress = useCallback(() => onOpen(file.id), [file.id, onOpen]);
    const Icon =
      kind === 'video' ? Play : kind === 'image' ? ImageIcon : FileText;
    const iconColor =
      kind === 'video'
        ? colors.text.onBrand
        : kind === 'document'
        ? colors.status.danger.main
        : colors.icon.secondary;

    return (
      <Box style={styles.tile}>
        <Pressable
          onPress={onPress}
          disabled={!viewable}
          scaleOnPress={viewable}
          accessibilityRole={viewable ? 'imagebutton' : 'image'}
          accessibilityLabel={t('marketplace.deals.dossier.fileA11y', {
            kind: t(KIND_LABEL[kind]),
            name: file.name,
          })}
        >
          <Box style={styles.thumb}>
            {viewable ? (
              <Image
                uri={file.url}
                width={TILE}
                height={TILE}
                resizeMode="cover"
              />
            ) : (
              <Icon size={sizes.icon.lg} color={iconColor} />
            )}
            <Box style={styles.kind}>
              <Text variant="overline" color={colors.text.onBrand}>
                {t(KIND_LABEL[kind])}
              </Text>
            </Box>
          </Box>
        </Pressable>
        <Text variant="caption" color={colors.text.primary} numberOfLines={1}>
          {file.name}
        </Text>
        <Text variant="caption" color={colors.text.tertiary}>
          {file.url === null
            ? t('marketplace.deals.dossier.fileGone')
            : formatFileSize(file.size)}
        </Text>
      </Box>
    );
  },
);

/**
 * The brief's attachments as tiles: photos show (and open full screen), videos and documents
 * show their kind, name and size. Opening those arrives with the drafts viewer in P5.
 */
const DealDossierFilesComponent: React.FC<DealDossierFilesProps> = ({
  files,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const gallery = useDealGallery(files);
  const onlyImages = files.every(isViewableImage);

  return (
    <Box gap="sm">
      <Rail bleed shadow="card" gap="md">
        {files.map(file => (
          <FileTile key={file.id} file={file} onOpen={gallery.open} />
        ))}
      </Rail>
      {onlyImages ? null : (
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.deals.dossier.filesNote')}
        </Text>
      )}
      <GalleryModal
        images={gallery.urls}
        visible={gallery.index !== null}
        initialIndex={gallery.index ?? 0}
        onClose={gallery.close}
      />
    </Box>
  );
};

export const DealDossierFiles = memo(DealDossierFilesComponent);
