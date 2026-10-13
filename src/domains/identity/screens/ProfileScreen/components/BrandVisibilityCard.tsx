import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, GradientSurface, Notice, Skeleton, Switch, Text } from '@/shared/ui';
import type { BrandVisibilityModel } from '../../../hooks/useBrandVisibility';
import { BrandSpotlight } from './BrandSpotlight';

interface BrandVisibilityCardProps {
  model: BrandVisibilityModel;
  brandName: string;
  logoUrl: string | null;
}

/**
 * Brand privacy switch on a small navy stage. A failed load offers a retry instead of a switch
 * with a guessed value; until the value is known the switch stays out.
 */
const BrandVisibilityCardComponent: React.FC<BrandVisibilityCardProps> = ({ model, brandName, logoUrl }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const title = t('account.profile.brandVisibility.title');

  if (model.isError) {
    return (
      <Notice
        tone="warning"
        icon={TriangleAlert}
        title={title}
        message={t('account.profile.brandVisibility.loadFailed')}
        action={{ label: t('account.profile.brandVisibility.retry'), onPress: model.retry }}
      />
    );
  }

  return (
    <GradientSurface variant="brand" borderRadius="xl" p="lg" gap="sm">
      <BrandSpotlight visible={model.visible === true} brandName={brandName} logoUrl={logoUrl} />
      <Box row align="center" gap="md" minHeight={sizes.iconButton.md}>
        <Box flex={1}>
          <Text variant="title" color={colors.text.onBrand}>
            {title}
          </Text>
        </Box>
        {model.visible === null ? (
          model.isLoading ? <Skeleton width={sizes.iconButton.md} height={sizes.icon.lg} borderRadius="full" surface="brand" /> : null
        ) : (
          <Switch
            value={model.visible}
            onValueChange={model.onToggle}
            accessibilityLabel={title}
            disabled={model.isSaving}
          />
        )}
      </Box>
      <Text variant="bodySmall" color={colors.text.onBrandMuted}>
        {t('account.profile.brandVisibility.subtitle')}
      </Text>
    </GradientSurface>
  );
};

export const BrandVisibilityCard = memo(BrandVisibilityCardComponent);
