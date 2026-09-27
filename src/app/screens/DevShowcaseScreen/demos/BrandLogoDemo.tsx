import React, { memo } from 'react';
import { Box, BrandLogo } from '@/shared/ui';
import type { BrandLogoVariant } from '@/shared/ui';
import { moderateScale, useTheme } from '@/core/theme';

const VARIANTS: readonly BrandLogoVariant[] = ['full', 'wordmark', 'symbol'];
const LOGO_HEIGHT = moderateScale(40);

const BrandLogoDemoComponent: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Box gap="lg">
      <Box row wrap align="center" gap="xl">
        {VARIANTS.map(variant => (
          <BrandLogo key={variant} variant={variant} height={LOGO_HEIGHT} />
        ))}
      </Box>
      <Box
        row
        wrap
        align="center"
        gap="xl"
        p="lg"
        borderRadius="lg"
        bg={colors.brand.main}
      >
        {VARIANTS.map(variant => (
          <BrandLogo
            key={variant}
            variant={variant}
            height={LOGO_HEIGHT}
            surface="brand"
          />
        ))}
      </Box>
    </Box>
  );
};

export const BrandLogoDemo = memo(BrandLogoDemoComponent);
