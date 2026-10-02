import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CustomButton, SectionHeader, TierBadge, TierInfoSheet } from '@/shared/ui';
import type { TierBadgeSize } from '@/shared/ui';
import { FOLLOWER_TIERS } from '@/core/config';
import { useTierBadgeDemo } from './hooks/useTierBadgeDemo';

const SIZES: TierBadgeSize[] = ['xs', 'sm', 'md', 'lg'];

const TierBadgeDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { sheet } = useTierBadgeDemo();

  return (
    <Box gap="xl">
      <Box gap="sm">
        <SectionHeader title={t('devShowcase.tierBadge.iconTitle')} />
        <Box row wrap gap="md">
          {FOLLOWER_TIERS.map(tier => (
            <TierBadge key={tier} tier={tier} size="xs" />
          ))}
        </Box>
      </Box>

      <Box gap="sm">
        <SectionHeader title={t('devShowcase.tierBadge.scaleTitle')} />
        <Box gap="md">
          {SIZES.map(size => (
            <Box key={size} row wrap gap="sm" align="center">
              {FOLLOWER_TIERS.map(tier => (
                <TierBadge key={tier} tier={tier} size={size} />
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      <Box gap="sm">
        <SectionHeader title={t('devShowcase.tierBadge.sheetTitle')} />
        <CustomButton
          title={t('devShowcase.tierBadge.openSheet')}
          onPress={sheet.open}
          variant="outline"
        />
        <TierInfoSheet visible={sheet.visible} onClose={sheet.close} />
      </Box>
    </Box>
  );
};

export const TierBadgeDemo = memo(TierBadgeDemoComponent);
