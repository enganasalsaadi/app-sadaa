import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Banner, Box, Image, Text, Thumbnail } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { MOCK_AVATAR_URI, MOCK_IMAGE_URIS } from './mockData';

const [PRIMARY_URI, SECOND_URI, THIRD_URI] = MOCK_IMAGE_URIS;

const ImagesDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const scrim = useMemo(
    () => [colors.layout.transparent, colors.mediaBackdrop],
    [colors],
  );

  return (
    <Box gap="lg">
      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('devShowcase.images.avatars')}
        </Text>
        <Box row align="center" gap="md">
          <Avatar uri={MOCK_AVATAR_URI} size={sizes.avatar.sm} />
          <Avatar uri={MOCK_AVATAR_URI} />
          <Avatar uri={MOCK_AVATAR_URI} size={sizes.avatar.lg} />
          <Avatar uri={MOCK_AVATAR_URI} size={sizes.avatar.xl} />
        </Box>
      </Box>

      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('devShowcase.images.thumbnails')}
        </Text>
        <Box row align="center" gap="md">
          <Thumbnail uri={SECOND_URI} />
          <Thumbnail uri={THIRD_URI} size={sizes.thumbnail.md} />
          <Thumbnail uri={undefined} size={sizes.thumbnail.md} showSkeleton />
        </Box>
      </Box>

      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('devShowcase.images.banner')}
        </Text>
        <Banner uri={PRIMARY_URI} borderRadius="lg" gradientColors={scrim} />
      </Box>

      <Box gap="sm">
        <Text variant="label" color={colors.text.secondary}>
          {t('devShowcase.images.contain')}
        </Text>
        <Image
          uri={SECOND_URI}
          width="100%"
          height={sizes.illustration.md}
          resizeMode="contain"
          borderRadius="md"
        />
      </Box>
    </Box>
  );
};

export const ImagesDemo = memo(ImagesDemoComponent);
