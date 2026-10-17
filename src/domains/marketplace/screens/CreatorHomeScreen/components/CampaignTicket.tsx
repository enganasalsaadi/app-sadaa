import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import { CampaignCover } from '../../../components/CampaignCover';
import { OpportunityBadges } from '../../../components/OpportunityBadges';
import { OpportunityBrandPill } from '../../../components/OpportunityBrandPill';
import { OpportunityDeadlineText } from '../../../components/OpportunityDeadlineText';
import { OpportunityNet } from '../../../components/OpportunityNet';
import { OpportunitySeats } from '../../../components/OpportunitySeats';
import type { CreatorCampaign } from '../../../types';
import { netHeadline, opportunityDeadline } from '../../../utils/opportunities';

export const CAMPAIGN_TICKET_WIDTH = moderateScale(272);
const COVER_HEIGHT = moderateScale(104);

interface CampaignTicketProps {
  campaign: CreatorCampaign;
  now: number;
  onOpen: (id: string) => void;
}

/**
 * One campaign as a profit ticket: the cover with the brand, then what the creator takes home as the
 * big number (the server's net, never the gross), the title, the seats left and the time to apply.
 * An invitation wears a gold frame, and its badge is the feed's own.
 */
const CampaignTicketComponent: React.FC<CampaignTicketProps> = ({ campaign, now, onOpen }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { id, title, brand, pricing, seats, invited, applyDeadlineAt } = campaign;
  const styles = useStyles(
    ({ borderWidths }): Record<'card', ViewStyle> => ({
      card: {
        overflow: 'hidden',
        borderWidth: invited ? borderWidths.md : borderWidths.thin,
        borderColor: invited ? colors.premium.main : colors.border.default,
      },
    }),
    [colors.border.default, colors.premium.main, invited],
  );
  const headline = netHeadline(pricing);
  const deadline = opportunityDeadline(applyDeadlineAt, now);
  const open = useCallback(() => onOpen(id), [id, onOpen]);
  const net =
    headline === null
      ? ''
      : headline.kind === 'fixed'
        ? formatMoney(headline.net)
        : `${formatMoney(headline.min)} – ${formatMoney(headline.max)}`;

  return (
    <Pressable
      width={CAMPAIGN_TICKET_WIDTH}
      bg={colors.surface.main}
      borderRadius="xl"
      style={styles.card}
      onPress={open}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.campaign.feed.card.a11y', { title, brand: brand.name, net })}
    >
      <CampaignCover uri={campaign.cover?.url ?? null} height={COVER_HEIGHT}>
        <Box row justify="flex-end">
          <OpportunityBrandPill brand={brand} />
        </Box>
        <OpportunityBadges campaign={campaign} />
      </CampaignCover>
      <Box p="lg" gap="md">
        {headline ? <OpportunityNet headline={headline} bidding={pricing.bid !== null} /> : null}
        <Text variant="bodyMedium" numberOfLines={2}>
          {title}
        </Text>
        <Box row justify="space-between" align="flex-end" gap="md">
          <OpportunitySeats total={seats.total} free={seats.free} />
          {deadline ? <OpportunityDeadlineText deadline={deadline} /> : null}
        </Box>
      </Box>
    </Pressable>
  );
};

export const CampaignTicket = memo(CampaignTicketComponent);
