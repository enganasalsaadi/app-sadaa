import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FileText, ImageIcon, Play } from 'lucide-react-native';
import type { ParseKeys } from 'i18next';
import { fileKindOf } from '@/core/download';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, FileViewer, Image, Pressable, Rail, Text } from '@/shared/ui';
import { formatFileSize } from '@/shared/utils';
import { useDealViewer } from '../hooks/useDealViewer';
import type { DealFile, DealFileKind, DealRef } from '../types';

const TILE = moderateScale(118);

const KIND_LABEL = {
  image: 'marketplace.deals.dossier.kind.image',
  video: 'marketplace.deals.dossier.kind.video',
  document: 'marketplace.deals.dossier.kind.document',
} as const satisfies Record<DealFileKind, ParseKeys>;

export interface DealDossierFilesProps {
  files: DealFile[];
  dealRef: DealRef;
}

const FileTile = memo<{ file: DealFile; openable: boolean; onOpen: (id: string) => void }>(
  ({ file, openable, onOpen }) => {
    const { t } = useTranslation();
    const { colors, sizes } = useTheme();
    const viewable = openable;
    const photo = fileKindOf(file.mime, file.kind) === 'image' ? file.url : null;
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
            {photo ? (
              <Image
                uri={photo}
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
 * The brief's attachments as tiles: photos show, videos and documents show their kind, name and
 * size; any of them opens in the file viewer (zoom, play, read, save).
 */
const DealDossierFilesComponent: React.FC<DealDossierFilesProps> = ({
  files,
  dealRef,
}) => {
  const viewer = useDealViewer(files, dealRef);

  return (
    <Box>
      <Rail bleed shadow="card" gap="md">
        {files.map(file => (
          <FileTile key={file.id} file={file} openable={viewer.canOpen(file.id)} onOpen={viewer.open} />
        ))}
      </Rail>
      <FileViewer {...viewer.props} refreshUrl={viewer.refreshUrl} />
    </Box>
  );
};

export const DealDossierFiles = memo(DealDossierFilesComponent);
