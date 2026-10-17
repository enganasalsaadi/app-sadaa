import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, ListRow, Tag, Text } from '@/shared/ui';
import { useCampaignWizard } from '../CampaignWizardContext';

/**
 * The optional private brief as one row of step 2: what it holds so far (or what it is for) and
 * that the creator only sees it after funding. Opens the brief sheet.
 */
const PrivateBriefRowComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { brief } = useCampaignWizard();
  const { entryCount, fileCount, openSheet, refused } = brief;

  const parts: string[] = [];
  if (entryCount > 0) parts.push(t('marketplace.campaign.wizard.requirements.brief.items', { count: entryCount }));
  if (fileCount > 0) parts.push(t('marketplace.campaign.wizard.requirements.brief.files', { count: fileCount }));
  const subtitle = parts.length > 0 ? parts.join(' · ') : t('marketplace.campaign.wizard.requirements.brief.hint');

  return (
    <Box bg={colors.surface.main} borderRadius="xl" overflow="hidden">
      <ListRow
        icon={Lock}
        iconTone="premium"
        title={t('marketplace.campaign.wizard.requirements.brief.title')}
        subtitle={subtitle}
        meta={
          refused ? (
            <Text variant="caption" color={colors.status.warning.text}>
              {t('marketplace.campaign.wizard.requirements.brief.refused')}
            </Text>
          ) : (
            <Tag label={t('marketplace.campaign.wizard.requirements.brief.optional')} tone="neutral" />
          )
        }
        onPress={openSheet}
      />
    </Box>
  );
};

export const PrivateBriefRow = memo(PrivateBriefRowComponent);
