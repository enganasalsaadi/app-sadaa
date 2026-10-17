import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Notice, Text, Timeline } from '@/shared/ui';
import { formatCampaignDateTime, formatCampaignDay } from '../../../utils/campaignSchedule';
import { useCampaignWizard } from '../CampaignWizardContext';

/**
 * How a drop campaign runs, from the server's answer for the saved drop: applications close,
 * drafts are due, the publish link opens, everyone publishes. Plus the latest deadline this drop
 * still allows. Hidden while a newer drop is saving (old dates would mislead).
 */
const DropTimelineComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { schedule } = useCampaignWizard();
  const { timeline, deadline, dropAt } = schedule;

  const steps = useMemo(() => {
    if (!timeline || dropAt === null) return [];
    const row = (date: string, note: string) => t('marketplace.campaign.wizard.money.plan.caption', { date, note });
    return [
      ...(deadline === null
        ? []
        : [
            {
              key: 'deadline',
              title: t('marketplace.campaign.wizard.money.plan.deadline'),
              caption: row(formatCampaignDay(deadline), t('marketplace.campaign.wizard.money.plan.deadlineCaption')),
              state: 'upcoming' as const,
            },
          ]),
      {
        key: 'drafts',
        title: t('marketplace.campaign.wizard.money.plan.drafts'),
        caption: row(
          formatCampaignDateTime(timeline.draftDueAt),
          t('marketplace.campaign.wizard.money.plan.draftsCaption', { hours: timeline.draftLeadHours }),
        ),
        state: 'upcoming' as const,
      },
      {
        key: 'publish',
        title: t('marketplace.campaign.wizard.money.plan.publish'),
        caption: row(
          formatCampaignDateTime(timeline.publishOpensAt),
          t('marketplace.campaign.wizard.money.plan.publishCaption', { minutes: timeline.publishLeadMinutes }),
        ),
        state: 'upcoming' as const,
      },
      {
        key: 'drop',
        title: t('marketplace.campaign.wizard.money.plan.drop'),
        caption: row(formatCampaignDateTime(dropAt), t('marketplace.campaign.wizard.money.plan.dropCaption')),
        state: 'current' as const,
      },
    ];
  }, [deadline, dropAt, t, timeline]);

  if (!timeline) return null;

  return (
    <Box gap="md">
      <Text variant="label" color={colors.text.secondary}>
        {t('marketplace.campaign.wizard.money.plan.label')}
      </Text>
      <Timeline steps={steps} variant="vertical" />
      <Notice
        tone="info"
        icon={Clock}
        message={t('marketplace.campaign.wizard.money.plan.latest', {
          date: formatCampaignDay(timeline.latestApplyDeadlineAt),
        })}
      />
    </Box>
  );
};

export const DropTimeline = memo(DropTimelineComponent);
