import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Heart, Plus, Share2, Trash2 } from 'lucide-react-native';
import { Banner, Box, IconButton, SectionHeader } from '@/shared/ui';
import type { IconButtonSize, IconButtonVariant } from '@/shared/ui';
import { useStyles, useTheme } from '@/core/theme';
import { MOCK_IMAGE_URIS } from './mockData';

const VARIANTS: Exclude<IconButtonVariant, 'overlay'>[] = ['ghost', 'soft', 'outline', 'solid'];
const SIZES: IconButtonSize[] = ['sm', 'md'];
const noop = () => {};

const IconButtonDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(({ spacing }) => ({
    overImage: { position: 'absolute' as const, top: spacing.md, end: spacing.md },
  }));

  return (
    <Box gap="lg">
      {SIZES.map(size => (
        <Box key={size} gap="sm">
          <SectionHeader title={t('devShowcase.iconButton.sizeTitle', { size })} />
          <Box row gap="md" align="center">
            {VARIANTS.map(variant => (
              <IconButton
                key={variant}
                icon={Heart}
                variant={variant}
                size={size}
                onPress={noop}
                accessibilityLabel={t('devShowcase.iconButton.like')}
              />
            ))}
          </Box>
        </Box>
      ))}

      <Box gap="sm">
        <SectionHeader title={t('devShowcase.iconButton.statesTitle')} />
        <Box row gap="md" align="center">
          <IconButton icon={Trash2} tone="danger" variant="soft" onPress={noop} accessibilityLabel={t('devShowcase.iconButton.delete')} />
          <IconButton icon={Trash2} tone="danger" variant="solid" onPress={noop} accessibilityLabel={t('devShowcase.iconButton.delete')} />
          <IconButton icon={Share2} variant="outline" disabled onPress={noop} accessibilityLabel={t('devShowcase.iconButton.share')} />
          <IconButton icon={Bell} variant="soft" loading onPress={noop} accessibilityLabel={t('devShowcase.iconButton.notifications')} />
          <IconButton icon={Plus} variant="solid" onPress={noop} accessibilityLabel={t('devShowcase.iconButton.add')} />
        </Box>
      </Box>

      <Box gap="sm">
        <SectionHeader title={t('devShowcase.iconButton.onBrandTitle')} />
        <Box row gap="md" align="center" p="md" borderRadius="lg" bg={colors.brand.main}>
          {VARIANTS.map(variant => (
            <IconButton
              key={variant}
              icon={Heart}
              variant={variant}
              tone="onBrand"
              onPress={noop}
              accessibilityLabel={t('devShowcase.iconButton.like')}
            />
          ))}
        </Box>
        <Box borderRadius="lg" overflow="hidden">
          <Banner uri={MOCK_IMAGE_URIS[2]} />
          <Box row gap="sm" style={styles.overImage}>
            <IconButton icon={Share2} variant="overlay" onPress={noop} accessibilityLabel={t('devShowcase.iconButton.share')} />
            <IconButton icon={Heart} variant="overlay" onPress={noop} accessibilityLabel={t('devShowcase.iconButton.like')} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export const IconButtonDemo = memo(IconButtonDemoComponent);
