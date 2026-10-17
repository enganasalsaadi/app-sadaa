import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarClock } from 'lucide-react-native';
import { iconStroke, useTheme } from '@/core/theme';
import { Box, SocialPlatformIcon, Text } from '@/shared/ui';
import { isSocialPlatform } from '@/shared/utils';
import { OPPORTUNITY_MAX_DELIVERABLES } from '../constants/opportunities';
import type { CreatorCampaign } from '../types/campaign';
import { formatCampaignDay } from '../utils/campaignSchedule';

export interface OpportunityDeliverablesProps {
  campaign: Pick<CreatorCampaign, 'deliverables' | 'dropAt'>;
}

const ChipShell: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { colors } = useTheme();
  return (
    <Box row align="center" gap="xs" px="md" py="xs" borderRadius="full" bg={colors.surface.elevated}>
      {children}
    </Box>
  );
};

/** What the brand asks for as chips («2 × story» with the platform mark), then the drop day if there is one. */
const OpportunityDeliverablesComponent: React.FC<OpportunityDeliverablesProps> = ({ campaign }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { deliverables, dropAt } = campaign;
  const shown = useMemo(() => deliverables.slice(0, OPPORTUNITY_MAX_DELIVERABLES), [deliverables]);
  const hidden = deliverables.length - shown.length;
  if (shown.length === 0 && dropAt === null) return null;

  return (
    <Box row wrap gap="sm">
      {shown.map((item, index) => (
        <ChipShell key={`${item.platform.key}:${item.service.key}:${index}`}>
          {isSocialPlatform(item.platform.key) ? (
            <SocialPlatformIcon platform={item.platform.key} size={sizes.icon.xs} color={colors.text.primary} />
          ) : (
            <Text variant="label" color={colors.text.secondary}>
              {item.platform.label}
            </Text>
          )}
          <Text variant="bodySmall" color={colors.text.primary}>
            {`${item.count} × ${item.service.label}`}
          </Text>
        </ChipShell>
      ))}
      {hidden > 0 ? (
        <ChipShell>
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.campaign.feed.card.moreDeliverables', { count: hidden })}
          </Text>
        </ChipShell>
      ) : null}
      {dropAt !== null ? (
        <ChipShell>
          <CalendarClock size={sizes.icon.xs} color={colors.icon.secondary} strokeWidth={iconStroke.regular} />
          <Text variant="bodySmall" color={colors.text.primary}>
            {t('marketplace.campaign.feed.card.drop', { date: formatCampaignDay(dropAt) })}
          </Text>
        </ChipShell>
      ) : null}
    </Box>
  );
};

export const OpportunityDeliverables = memo(OpportunityDeliverablesComponent);
