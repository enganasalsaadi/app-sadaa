import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, MoreHorizontal } from 'lucide-react-native';
import { resolveHue, useTheme } from '@/core/theme';
import { Box, Card, CustomButton, IconButton, Text } from '@/shared/ui';
import { CAMPAIGN_MISSING_LABEL } from '../constants/campaignWizard';
import type { Campaign } from '../types';
import { CAMPAIGN_MISSING_KEY } from '../types/campaignDraft';
import { campaignReadiness } from '../utils/campaignList';
import { ReadinessRing } from './ReadinessRing';

/** More than this many missing parts collapse into «+N». */
const MAX_NAMED = 3;

const isMissingKey = (key: string): key is keyof typeof CAMPAIGN_MISSING_LABEL =>
  (CAMPAIGN_MISSING_KEY as readonly string[]).includes(key);

export interface CampaignDraftCardProps {
  campaign: Campaign;
  /** Opens the wizard on this draft. */
  onResume: (id: string) => void;
  onMore: (campaign: Campaign) => void;
}

/**
 * A draft: how complete it is (a ring) and what is still missing. One the admin sent back gets a
 * warning edge, the admin's note and a single «fix and resend» action.
 */
const CampaignDraftCardComponent: React.FC<CampaignDraftCardProps> = ({ campaign, onResume, onMore }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const warning = resolveHue(colors, 'warning');
  const returned = campaign.status.key === 'changes_requested';
  const { done, total } = campaignReadiness(campaign);
  const named = campaign.missing.filter(isMissingKey).slice(0, MAX_NAMED);
  const more = campaign.missing.length - named.length;
  const title = campaign.title.trim() || t('marketplace.campaign.list.untitled');

  const resume = useCallback(() => onResume(campaign.id), [campaign.id, onResume]);
  const openMore = useCallback(() => onMore(campaign), [campaign, onMore]);

  const missingLine =
    campaign.missing.length === 0
      ? t('marketplace.campaign.list.readyToSend')
      : t('marketplace.campaign.list.missing', {
          items: named.map(key => t(CAMPAIGN_MISSING_LABEL[key])).join(' · '),
        }) + (more > 0 ? ` ${t('marketplace.campaign.list.moreMissing', { count: more })}` : '');

  return (
    <Card
      onPress={resume}
      p="lg"
      borderWidth={returned ? 'md' : 'thin'}
      borderColor={returned ? warning.main : undefined}
      accessibilityLabel={t('marketplace.campaign.list.draftA11y', { title, status: campaign.status.label })}
    >
      <Box gap="md">
        <Box row align="center" gap="md">
          <ReadinessRing done={done} total={total} />
          <Box flex={1} gap="xs">
            <Text variant="title" color={colors.text.primary} numberOfLines={1}>
              {title}
            </Text>
            <Text variant="bodySmall" color={returned ? warning.text : colors.text.secondary} numberOfLines={2}>
              {returned ? campaign.status.label : missingLine}
            </Text>
          </Box>
          <IconButton
            icon={MoreHorizontal}
            variant="ghost"
            onPress={openMore}
            accessibilityLabel={t('marketplace.campaign.list.draftMore')}
          />
        </Box>
        {returned ? (
          <>
            {campaign.reviewNote ? (
              <Box row gap="sm" p="md" borderRadius="md" bg={warning.soft}>
                <AlertTriangle size={sizes.icon.sm} color={warning.main} />
                <Box flex={1}>
                  <Text variant="bodySmall" color={colors.text.primary} numberOfLines={3}>
                    {campaign.reviewNote}
                  </Text>
                </Box>
              </Box>
            ) : null}
            <CustomButton title={t('marketplace.campaign.list.resubmit')} onPress={resume} fullWidth />
          </>
        ) : null}
      </Box>
    </Card>
  );
};

export const CampaignDraftCard = memo(CampaignDraftCardComponent);
