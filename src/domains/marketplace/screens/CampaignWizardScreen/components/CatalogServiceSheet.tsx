import React, { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, CustomButton, Rail, SheetFrame } from '@/shared/ui';
import { hasDeliverable } from '../../../utils/campaignDeliverables';
import { useCampaignWizard } from '../CampaignWizardContext';
import { CatalogServiceRow } from './CatalogServiceRow';

/**
 * The catalog as a sheet: pick the platform, then tick the services to add (a ticked one is a
 * line already; ticking it again takes it off). Stays open so several can be added in a row.
 */
const CatalogServiceSheetComponent: React.FC = () => {
  const { t } = useTranslation();
  const { values, requirements } = useCampaignWizard();
  const { choices, sheetOpen, closeSheet, toggleService } = requirements;
  const [platformKey, setPlatformKey] = useState<string | null>(null);

  // The first platform opens when the sheet does (and when the catalog lands while it is open).
  const firstKey = choices[0]?.key ?? null;
  useEffect(() => {
    if (sheetOpen && (platformKey === null || !choices.some(choice => choice.key === platformKey))) {
      setPlatformKey(firstKey);
    }
  }, [choices, firstKey, platformKey, sheetOpen]);

  const platform = choices.find(choice => choice.key === platformKey) ?? choices[0];

  const pickPlatform = useCallback((key: string) => setPlatformKey(key), []);

  return (
    <SheetFrame
      visible={sheetOpen}
      onClose={closeSheet}
      title={t('marketplace.campaign.wizard.requirements.sheet.title')}
      body={t('marketplace.campaign.wizard.requirements.sheet.body')}
      footer={<CustomButton title={t('marketplace.campaign.wizard.requirements.sheet.done')} onPress={closeSheet} fullWidth />}
    >
      {/* In the body, not `headerAccessory`: a header whose height changes with the catalog fights the sheet's measuring and scrolling. */}
      {platform ? (
          <Rail
            bleed
            gap="sm"
            accessibilityRole="tablist"
            accessibilityLabel={t('marketplace.campaign.wizard.requirements.sheet.platforms')}
          >
            {choices.map(choice => (
              <Chip
                key={choice.key}
                variant="tile"
                value={choice.key}
                label={choice.label}
                selected={choice.key === platform.key}
                onSelect={pickPlatform}
              />
            ))}
          </Rail>
        ) : undefined}
      {platform ? (
        <Box gap="sm">
          {platform.services.map(service => (
            <CatalogServiceRow
              key={service.key}
              platform={platform.key}
              platformLabel={platform.label}
              service={service.key}
              label={service.label}
              picked={hasDeliverable(values.deliverables, platform.key, service.key)}
              onToggle={toggleService}
            />
          ))}
        </Box>
      ) : null}
    </SheetFrame>
  );
};

export const CatalogServiceSheet = memo(CatalogServiceSheetComponent);
