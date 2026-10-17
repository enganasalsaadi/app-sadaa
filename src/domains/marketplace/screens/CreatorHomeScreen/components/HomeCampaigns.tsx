import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Pressable, Rail, StaggerIn, Text } from '@/shared/ui';
import { useClock } from '../../../hooks/useClock';
import type { CreatorHomeCampaignsModel } from '../hooks/useCreatorHomeCampaigns';
import { CampaignsQuiet } from './CampaignsQuiet';
import { CampaignTicket } from './CampaignTicket';
import { CountChip } from './CountChip';

const MORE_WIDTH = moderateScale(112);
const MINUTE = 60_000;

type HomeCampaignsProps = Pick<
  CreatorHomeCampaignsModel,
  'campaigns' | 'openCampaign' | 'openFeed' | 'openApplications'
> & { openRates: () => void };

/**
 * «Campaigns for you»: count chips (open · new invitations · under review, each only above 0), then up
 * to three tickets the server ranked and a last tile to the whole feed; a calm card when nothing fits.
 * Hidden while the server sends no `campaigns` (flag off).
 */
const HomeCampaignsComponent: React.FC<HomeCampaignsProps> = ({
  campaigns,
  openCampaign,
  openFeed,
  openApplications,
  openRates,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const now = useClock(MINUTE);
  if (campaigns.kind === 'hidden') return null;

  const { feedCount, newInvites, openApplications: reviewing, items } = campaigns;
  const quiet = items.length === 0 && feedCount === 0 && newInvites === 0;

  return (
    <StaggerIn gap="md">
      <Box row align="flex-end" justify="space-between" gap="md" px="xl">
        <Box flex={1}>
          <Text variant="h4" accessibilityRole="header">
            {t('marketplace.creatorHome.campaigns.title')}
          </Text>
          <Text variant="bodySmall" color={colors.text.tertiary} numberOfLines={1}>
            {t('marketplace.creatorHome.campaigns.subtitle')}
          </Text>
        </Box>
        <Pressable
          onPress={openFeed}
          minHeight={sizes.button.md}
          justify="center"
          hitSlop={sizes.hitSlop.sm}
          accessibilityRole="button"
        >
          <Text variant="buttonSmall" color={colors.interactive.text}>
            {t('marketplace.creatorHome.campaigns.seeAll')}
          </Text>
        </Pressable>
      </Box>
      {feedCount + newInvites + reviewing > 0 ? (
        <Box row wrap gap="sm" px="xl">
          {feedCount > 0 ? (
            <CountChip
              count={feedCount}
              label={t('marketplace.creatorHome.campaigns.chips.available', { count: feedCount })}
              tone="info"
              onPress={openFeed}
            />
          ) : null}
          {newInvites > 0 ? (
            <CountChip
              count={newInvites}
              label={t('marketplace.creatorHome.campaigns.chips.invites', { count: newInvites })}
              tone="warning"
              onPress={openFeed}
            />
          ) : null}
          {reviewing > 0 ? (
            <CountChip
              count={reviewing}
              label={t('marketplace.creatorHome.campaigns.chips.review', { count: reviewing })}
              tone="info"
              onPress={openApplications}
            />
          ) : null}
        </Box>
      ) : null}
      {items.length > 0 ? (
        <Rail
          gap="md"
          shadow="card"
          accessibilityLabel={t('marketplace.creatorHome.campaigns.railA11y', { count: feedCount })}
        >
          {items.map(campaign => (
            <CampaignTicket key={campaign.id} campaign={campaign} now={now} onOpen={openCampaign} />
          ))}
          {feedCount > items.length ? (
            <Pressable
              width={MORE_WIDTH}
              align="center"
              justify="center"
              gap="xs"
              p="md"
              borderRadius="xl"
              borderWidth="sm"
              borderColor={colors.border.strong}
              onPress={openFeed}
              scaleOnPress
              accessibilityRole="button"
              accessibilityLabel={t('marketplace.creatorHome.campaigns.allA11y', { count: feedCount })}
            >
              <Text variant="amountTitle">{formatNumber(feedCount)}</Text>
              <Text variant="buttonSmall" color={colors.interactive.text} align="center">
                {t('marketplace.creatorHome.campaigns.all')}
              </Text>
            </Pressable>
          ) : null}
        </Rail>
      ) : null}
      {quiet ? <CampaignsQuiet onSetRates={openRates} /> : null}
    </StaggerIn>
  );
};

export const HomeCampaigns = memo(HomeCampaignsComponent);
