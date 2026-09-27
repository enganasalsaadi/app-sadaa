import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleCheck, PenLine } from 'lucide-react-native';
import { Box, CustomButton, MediaTile } from '@/shared/ui';
import { useMediaTileDemo } from './hooks/useMediaTileDemo';
import { MOCK_IMAGE_URIS } from './mockData';

const UPLOAD_PROGRESS = 0.42;
const VIDEO_SECONDS = 47;

const MediaTileDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { failedUpload, reset } = useMediaTileDemo();
  const label = t('devShowcase.mediaTile.label');

  return (
    <Box gap="sm">
      <Box row gap="sm">
        <Box flex={1}>
          <MediaTile uri={MOCK_IMAGE_URIS[0]} accessibilityLabel={label} />
        </Box>
        <Box flex={1}>
          <MediaTile uri={MOCK_IMAGE_URIS[1]} kind="video" durationSeconds={VIDEO_SECONDS} accessibilityLabel={label} />
        </Box>
      </Box>
      <Box row gap="sm">
        <Box flex={1}>
          <MediaTile
            uri={MOCK_IMAGE_URIS[2]}
            upload={{ state: 'uploading', progress: UPLOAD_PROGRESS }}
            accessibilityLabel={label}
          />
        </Box>
        <Box flex={1}>
          <MediaTile uri={MOCK_IMAGE_URIS[3]} upload={failedUpload} accessibilityLabel={label} />
        </Box>
      </Box>
      <Box row gap="sm">
        <Box flex={1}>
          <MediaTile
            uri={MOCK_IMAGE_URIS[0]}
            status={{ label: t('devShowcase.mediaTile.approved'), tone: 'success', icon: CircleCheck }}
            accessibilityLabel={label}
          />
        </Box>
        <Box flex={1}>
          <MediaTile
            uri={MOCK_IMAGE_URIS[1]}
            kind="video"
            status={{ label: t('devShowcase.mediaTile.changes'), tone: 'warning', icon: PenLine }}
            accessibilityLabel={label}
          />
        </Box>
      </Box>
      <Box row gap="sm">
        <Box flex={1}>
          <MediaTile accessibilityLabel={label} />
        </Box>
        <Box flex={1}>
          <MediaTile kind="video" aspectRatio={9 / 16} accessibilityLabel={label} />
        </Box>
      </Box>
      <CustomButton title={t('devShowcase.mediaTile.reset')} onPress={reset} variant="ghost" size="sm" />
    </Box>
  );
};

export const MediaTileDemo = memo(MediaTileDemoComponent);
