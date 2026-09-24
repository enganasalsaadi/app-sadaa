import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import type { ParseKeys } from 'i18next';
import { Box, Text, Card } from '@/shared/ui';
import { useTheme } from '@/core/theme';
import type { LayoutVariantScreenName } from '../hooks/useDevShowcaseScreen';

interface LayoutGalleryRow {
  screen: LayoutVariantScreenName;
  titleKey: ParseKeys;
  descriptionKey: ParseKeys;
}

const ROWS: LayoutGalleryRow[] = [
  {
    screen: 'LayoutFixedHeaderScreen',
    titleKey: 'devShowcase.layoutGallery.fixedHeaderTitle',
    descriptionKey: 'devShowcase.layoutGallery.fixedHeaderDescription',
  },
  {
    screen: 'LayoutNoHeaderScrollScreen',
    titleKey: 'devShowcase.layoutGallery.noHeaderScrollTitle',
    descriptionKey: 'devShowcase.layoutGallery.noHeaderScrollDescription',
  },
  {
    screen: 'LayoutDarkForcedScreen',
    titleKey: 'devShowcase.layoutGallery.darkForcedTitle',
    descriptionKey: 'devShowcase.layoutGallery.darkForcedDescription',
  },
  {
    screen: 'LayoutCtaButtonScreen',
    titleKey: 'devShowcase.layoutGallery.ctaButtonTitle',
    descriptionKey: 'devShowcase.layoutGallery.ctaButtonDescription',
  },
  {
    screen: 'LayoutNoScrollWithHandlerScreen',
    titleKey: 'devShowcase.layoutGallery.noScrollWithHandlerTitle',
    descriptionKey: 'devShowcase.layoutGallery.noScrollWithHandlerDescription',
  },
  {
    screen: 'LayoutGradientHeroScreen',
    titleKey: 'devShowcase.layoutGallery.gradientHeroTitle',
    descriptionKey: 'devShowcase.layoutGallery.gradientHeroDescription',
  },
];

interface LayoutGallerySectionProps {
  onNavigate: (screen: LayoutVariantScreenName) => void;
}

const LayoutGallerySectionComponent: React.FC<LayoutGallerySectionProps> = ({
  onNavigate,
}) => {
  const { t } = useTranslation();
  const { colors, isRTL } = useTheme();
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const renderRow = useCallback(
    (row: LayoutGalleryRow) => (
      <Card
        key={row.screen}
        onPress={() => onNavigate(row.screen)}
        row
        align="center"
        accessibilityLabel={t(row.titleKey)}
      >
        <Box flex={1}>
          <Text variant="body">{t(row.titleKey)}</Text>
          <Text variant="caption" color={colors.text.secondary} mt="xs">
            {t(row.descriptionKey)}
          </Text>
        </Box>
        <ChevronIcon size={18} color={colors.text.tertiary} />
      </Card>
    ),
    [t, colors, onNavigate, ChevronIcon],
  );

  return (
    <Card>
      <Box gap="md">
        <Text variant="title">{t('devShowcase.sections.layoutGallery')}</Text>
        {ROWS.map(renderRow)}
      </Box>
    </Card>
  );
};

export const LayoutGallerySection = memo(LayoutGallerySectionComponent);
