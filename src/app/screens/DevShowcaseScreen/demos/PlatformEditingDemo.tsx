import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CustomButton } from '@/shared/ui';
import { PlatformAccountSheet, RatePlatformCard, SocialLinkInput } from '@/domains/auth';
import { usePlatformEditingDemo } from './hooks/usePlatformEditingDemo';

const PlatformEditingDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const demo = usePlatformEditingDemo();

  return (
    <Box gap="md">
      <RatePlatformCard
        control={demo.control}
        platform="instagram"
        username="sada.creator"
        rows={demo.rows}
        serviceLabel={demo.serviceLabel}
      />
      <RatePlatformCard
        variant="rowsOnly"
        control={demo.control}
        platform="instagram"
        username="sada.creator"
        rows={demo.rows}
        serviceLabel={demo.serviceLabel}
      />
      <SocialLinkInput
        platform="instagram"
        value={demo.links.instagram}
        onChange={demo.links.onInstagramChange}
      />
      <SocialLinkInput
        platform="website"
        value={demo.links.website}
        onChange={demo.links.onWebsiteChange}
        error={t('validation.invalidSocialLink')}
      />
      <CustomButton
        title={t('devShowcase.sada.openPlatformSheet')}
        onPress={demo.openSheet}
        variant="secondary"
        fullWidth
      />
      <PlatformAccountSheet {...demo.sheet} />
    </Box>
  );
};

export const PlatformEditingDemo = memo(PlatformEditingDemoComponent);
