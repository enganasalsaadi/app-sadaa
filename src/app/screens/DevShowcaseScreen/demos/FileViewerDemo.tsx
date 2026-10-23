import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Film, ImageOff, Play } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, FileViewer, Pressable, Text, Thumbnail, type ViewerFile } from '@/shared/ui';
import { MOCK_VIEWER_FILES } from './mockData';
import { useFileViewerDemo } from './hooks/useFileViewerDemo';

interface DemoTileProps {
  file: ViewerFile;
  index: number;
  onOpen: (index: number) => void;
}

const DemoTile = memo<DemoTileProps>(({ file, index, onOpen }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const open = useCallback(() => onOpen(index), [index, onOpen]);
  const Icon = file.url === null ? ImageOff : file.kind === 'video' ? Play : file.kind === 'document' ? FileText : Film;
  return (
    <Pressable
      onPress={open}
      scaleOnPress
      width={sizes.thumbnail.md}
      height={sizes.thumbnail.md}
      borderRadius="md"
      align="center"
      justify="center"
      bg={colors.surface.elevated}
      accessibilityRole="imagebutton"
      accessibilityLabel={t('devShowcase.fileViewer.open', { name: file.name })}
    >
      {file.kind === 'image' && file.url ? (
        <Thumbnail uri={file.url} size={sizes.thumbnail.md} />
      ) : (
        <Icon size={sizes.icon.md} color={colors.icon.secondary} />
      )}
    </Pressable>
  );
});
DemoTile.displayName = 'DemoTile';

/** Photos (zoom, minimap), a video (scrubber, speed), a PDF (pages), a Word file (open with), an expired link. */
const FileViewerDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { full, lookOnly } = useFileViewerDemo();
  const openFirst = useCallback(() => lookOnly.openAt(0), [lookOnly]);

  return (
    <Box gap="md">
      <Box row wrap gap="sm">
        {MOCK_VIEWER_FILES.map((file, index) => (
          <DemoTile key={file.id} file={file} index={index} onOpen={full.openAt} />
        ))}
      </Box>
      <Text variant="caption" color={colors.text.secondary}>
        {t('devShowcase.fileViewer.hint')}
      </Text>
      <CustomButton title={t('devShowcase.fileViewer.lookOnly')} variant="secondary" size="sm" onPress={openFirst} />
      <FileViewer {...full.props} />
      <FileViewer {...lookOnly.props} saveable={false} />
    </Box>
  );
};

export const FileViewerDemo = memo(FileViewerDemoComponent);
