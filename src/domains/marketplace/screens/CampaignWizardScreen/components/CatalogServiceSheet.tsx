import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, BottomSheet, CustomButton, SegmentedControl, Text } from '@/shared/ui';
import { hasDeliverable } from '../../../utils/campaignDeliverables';
import { useCampaignWizard } from '../CampaignWizardContext';
import { CatalogServiceRow } from './CatalogServiceRow';

/**
 * The catalog as a sheet: pick the platform, then tick the services to add (a ticked one is a
 * line already; ticking it again takes it off). Stays open so several can be added in a row.
 */
const CatalogServiceSheetComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
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
  const options = useMemo(() => choices.map(choice => ({ value: choice.key, label: choice.label })), [choices]);

  const pickPlatform = useCallback((key: string) => setPlatformKey(key), []);

  return (
    <BottomSheet
      visible={sheetOpen}
      onClose={closeSheet}
      footer={<CustomButton title={t('marketplace.campaign.wizard.requirements.sheet.done')} onPress={closeSheet} fullWidth />}
    >
      <Box px="xl" pt="md" pb="xl" gap="lg">
        <Box gap="xs">
          <Text variant="h3" color={colors.text.primary}>
            {t('marketplace.campaign.wizard.requirements.sheet.title')}
          </Text>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.campaign.wizard.requirements.sheet.body')}
          </Text>
        </Box>
        {platform ? (
          <>
            <SegmentedControl
              options={options}
              value={platform.key}
              onChange={pickPlatform}
              accessibilityLabel={t('marketplace.campaign.wizard.requirements.sheet.platforms')}
            />
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
          </>
        ) : null}
      </Box>
    </BottomSheet>
  );
};

export const CatalogServiceSheet = memo(CatalogServiceSheetComponent);
