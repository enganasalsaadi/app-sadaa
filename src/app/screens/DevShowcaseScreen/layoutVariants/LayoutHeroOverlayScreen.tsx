import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Share2 } from 'lucide-react-native';
import { Banner, Box, Text, Layout, LayoutFooter } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import { goBack } from '@/core/navigation';
import { DemoScrollRows } from '../components';
import { MOCK_IMAGE_URIS } from '../demos/mockData';

const noop = () => {};

/**
 * Layout gallery variant: `hero` + overlay header (detail screens: creator, campaign)
 * and an `elevate` footer.
 */
const LayoutHeroOverlayScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Layout
      hero={<Banner uri={MOCK_IMAGE_URIS[0]} />}
      header={{
        title: t('devShowcase.layoutGallery.heroTitle'),
        actions: [
          { icon: Share2, accessibilityLabel: t('common.share'), onPress: noop },
          { icon: Heart, accessibilityLabel: t('devShowcase.screenHeader.favorite'), onPress: noop },
        ],
      }}
      footer={
        <LayoutFooter primary={{ label: t('devShowcase.layoutGallery.sendOffer'), onPress: goBack }} />
      }
      footerBehavior="elevate"
    >
      <Box gap="lg">
        <Box gap="xs">
          <Text variant="h2">{t('devShowcase.layoutGallery.heroTitle')}</Text>
          <Text variant="body" color={colors.text.secondary}>
            {t('devShowcase.layoutGallery.heroBody')}
          </Text>
        </Box>
        <DemoScrollRows />
      </Box>
    </Layout>
  );
};

export const LayoutHeroOverlayScreen = memo(LayoutHeroOverlayScreenComponent);
