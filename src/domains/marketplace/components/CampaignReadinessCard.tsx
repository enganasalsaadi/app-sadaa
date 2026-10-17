import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, TriangleAlert } from 'lucide-react-native';
import { iconStroke, useTheme } from '@/core/theme';
import { Box, Card, Pressable, Text } from '@/shared/ui';
import { CAMPAIGN_MISSING_LABEL, CAMPAIGN_STEP_LABEL } from '../constants/campaignWizard';
import type { CampaignDetail } from '../types/campaign';
import type { CampaignWizardStep } from '../types/campaignDraft';
import { campaignReadiness } from '../utils/campaignList';
import { missingByStep } from '../utils/campaignReview';

const ROW_STEPS = ['idea', 'requirements', 'money'] as const satisfies readonly CampaignWizardStep[];

export interface CampaignReadinessCardProps {
  missing: CampaignDetail['missing'];
  /** Opens the wizard, which lands on the first step still lacking something. */
  onEdit: () => void;
}

/** What a draft still needs, step by step: a live checklist where the brand sees what blocks sending. */
const CampaignReadinessCardComponent: React.FC<CampaignReadinessCardProps> = ({ missing, onEdit }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { done, total } = campaignReadiness({ missing });
  const byStep = useMemo(() => missingByStep(missing), [missing]);

  return (
    <Card p="lg" shadow="card">
      <Box gap="sm">
        <Box row align="center" justify="space-between">
          <Text variant="title" color={colors.text.primary}>
            {t('marketplace.campaign.detail.readiness.title')}
          </Text>
          <Text variant="caption" color={colors.text.tertiary}>
            {t('marketplace.campaign.list.readiness', { done, total })}
          </Text>
        </Box>
        {ROW_STEPS.map(step => {
          const lacking = byStep[step];
          const incomplete = lacking.length > 0;
          const tone = incomplete ? colors.status.warning : colors.status.success;
          const Icon = incomplete ? TriangleAlert : Check;
          const title = t(CAMPAIGN_STEP_LABEL[step]);
          return (
            <Pressable
              key={step}
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel={t(
                incomplete ? 'marketplace.campaign.wizard.review.missingA11y' : 'marketplace.campaign.wizard.review.doneA11y',
                { label: title },
              )}
            >
              <Box row align="center" gap="md" minHeight={sizes.button.md}>
                <Box
                  width={sizes.icon.lg}
                  height={sizes.icon.lg}
                  borderRadius="full"
                  align="center"
                  justify="center"
                  bg={tone.soft}
                >
                  <Icon size={sizes.icon.xs} color={tone.main} strokeWidth={iconStroke.bold} />
                </Box>
                <Box flex={1}>
                  <Text variant="body" color={colors.text.primary}>
                    {title}
                  </Text>
                  {incomplete ? (
                    <Text variant="caption" color={colors.text.secondary} numberOfLines={2}>
                      {t('marketplace.campaign.wizard.review.missing', {
                        items: lacking.map(key => t(CAMPAIGN_MISSING_LABEL[key])).join(' · '),
                      })}
                    </Text>
                  ) : null}
                </Box>
                {incomplete ? (
                  <Text variant="buttonSmall" color={colors.interactive.text}>
                    {t('marketplace.campaign.wizard.review.complete')}
                  </Text>
                ) : null}
              </Box>
            </Pressable>
          );
        })}
      </Box>
    </Card>
  );
};

export const CampaignReadinessCard = memo(CampaignReadinessCardComponent);
