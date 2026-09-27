import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, GalleryModal, Pressable, Thumbnail } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { MOCK_IMAGE_URIS } from './mockData';
import { useGalleryDemo } from './hooks/useGalleryDemo';

interface GalleryTileProps {
  uri: string;
  index: number;
  onOpen: (index: number) => void;
}

const GalleryTile: React.FC<GalleryTileProps> = memo(
  ({ uri, index, onOpen }) => {
    const { t } = useTranslation();
    const { sizes } = useTheme();
    const handlePress = useCallback(() => onOpen(index), [onOpen, index]);

    return (
      <Pressable
        onPress={handlePress}
        scaleOnPress
        accessibilityRole="imagebutton"
        accessibilityLabel={t('devShowcase.gallery.open', { index: index + 1 })}
      >
        <Thumbnail uri={uri} size={sizes.thumbnail.md} />
      </Pressable>
    );
  },
);

const GalleryDemoComponent: React.FC = () => {
  const { openIndex, open, close } = useGalleryDemo();

  return (
    <Box row wrap gap="sm">
      {MOCK_IMAGE_URIS.map((uri, index) => (
        <GalleryTile key={uri} uri={uri} index={index} onOpen={open} />
      ))}
      <GalleryModal
        images={MOCK_IMAGE_URIS}
        visible={openIndex !== null}
        initialIndex={openIndex ?? 0}
        onClose={close}
      />
    </Box>
  );
};

export const GalleryDemo = memo(GalleryDemoComponent);
