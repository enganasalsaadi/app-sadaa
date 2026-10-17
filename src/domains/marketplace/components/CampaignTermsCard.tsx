import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, useTheme } from '@/core/theme';
import { Box, Card, KeyValueRow, Text } from '@/shared/ui';
import type { CampaignDetail } from '../types/campaign';
import { formatCampaignDateTime } from '../utils/campaignSchedule';

const COMPACT = { notation: 'compact', maximumFractionDigits: 1 } as const;

export interface CampaignTermsCardProps {
  campaign: Pick<
    CampaignDetail,
    'deliverables' | 'targeting' | 'shippingMode' | 'dropAt' | 'deliveryDays' | 'applyDeadlineAt'
  >;
  /** The terms froze at the first application: only the title and announcement can change. */
  locked: boolean;
}

/** What the campaign asks of a creator, as a short list of terms; the lock chip says when they stopped being editable. */
const CampaignTermsCardComponent: React.FC<CampaignTermsCardProps> = ({ campaign, locked }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { deliverables, targeting, shippingMode, dropAt, deliveryDays, applyDeadlineAt } = campaign;

  return (
    <Card p="lg" shadow="card">
      <Box gap="xs">
        <Box row align="center" justify="space-between" pb="xs">
          <Text variant="title" color={colors.text.primary}>
            {t('marketplace.campaign.detail.terms.title')}
          </Text>
          {locked ? (
            <Box row align="center" gap="xs" px="md" py="xs" borderRadius="full" bg={colors.surface.elevated}>
              <Lock size={sizes.icon.xs} color={colors.text.secondary} strokeWidth={iconStroke.bold} />
              <Text variant="label" color={colors.text.secondary}>
                {t('marketplace.campaign.detail.terms.locked')}
              </Text>
            </Box>
          ) : null}
        </Box>
        {deliverables.map(line => (
          <KeyValueRow
            key={line.id}
            label={`${line.platform.label} · ${line.service.label}`}
            value={[
              `×${formatNumber(line.count)}`,
              line.revisions > 0 ? t('marketplace.campaign.detail.terms.revisions', { count: line.revisions }) : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          />
        ))}
        {dropAt !== null ? (
          <KeyValueRow
            label={t('marketplace.campaign.detail.terms.schedule')}
            value={t('marketplace.campaign.detail.terms.drop', { date: formatCampaignDateTime(dropAt) })}
          />
        ) : deliveryDays !== null ? (
          <KeyValueRow
            label={t('marketplace.campaign.detail.terms.schedule')}
            value={t('marketplace.campaign.wizard.review.money.delivery', { count: deliveryDays })}
          />
        ) : null}
        {applyDeadlineAt !== null ? (
          <KeyValueRow
            label={t('marketplace.campaign.detail.terms.deadline')}
            value={formatCampaignDateTime(applyDeadlineAt)}
          />
        ) : null}
        <KeyValueRow
          label={t('marketplace.campaign.detail.terms.targeting')}
          value={
            targeting.minFollowers
              ? t('marketplace.campaign.wizard.review.requirements.followers', {
                  count: formatNumber(targeting.minFollowers, COMPACT),
                })
              : t('marketplace.campaign.detail.terms.anyone')
          }
        />
        <KeyValueRow label={t('marketplace.campaign.detail.terms.shipping')} value={shippingMode.label} />
      </Box>
    </Card>
  );
};

export const CampaignTermsCard = memo(CampaignTermsCardComponent);
