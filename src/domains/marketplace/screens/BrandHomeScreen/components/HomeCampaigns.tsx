import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { moderateScale, resolveHue, useTheme } from '@/core/theme';
import { Box, LiveDot, Pressable, Rail, StaggerIn, Text } from '@/shared/ui';
import { useClock } from '../../../hooks/useClock';
import type { BrandHomeScreenModel } from '../hooks/useBrandHomeScreen';
import { RailHeading } from './RailHeading';
import { CampaignSeatCard } from './CampaignSeatCard';

const MORE_WIDTH = moderateScale(112);
const MINUTE = 60_000;

type HomeCampaignsProps = Pick<BrandHomeScreenModel, 'campaigns' | 'openCampaignAction' | 'openDeals'>;

/**
 * «My active campaigns»: a rail of seat cards, the ones that need the brand first (the server's
 * order) with an amber pill counting them, and a last tile to the full list. Hidden when the
 * server sends no campaigns (flag off, or none running).
 */
const HomeCampaignsComponent: React.FC<HomeCampaignsProps> = ({ campaigns, openCampaignAction, openDeals }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const now = useClock(MINUTE);
  if (campaigns.kind === 'hidden') return null;

  const { needsActionCount, totalCount, items } = campaigns;
  const warning = resolveHue(colors, 'warning');

  return (
    <StaggerIn gap="md">
      <Box gap="sm">
        <RailHeading
          title={t('marketplace.brandHome.campaigns.title')}
          subtitle={t('marketplace.brandHome.campaigns.subtitle')}
          onSeeAll={openDeals}
        />
        {needsActionCount > 0 ? (
          <Box row align="center" gap="sm" px="xl">
            <LiveDot color={warning.main} />
            <Text variant="buttonSmall" color={warning.text}>
              {t('marketplace.brandHome.campaigns.needsYou', { count: needsActionCount })}
            </Text>
          </Box>
        ) : null}
      </Box>
      <Rail
        gap="md"
        shadow="card"
        accessibilityLabel={t('marketplace.brandHome.campaigns.railA11y', { count: totalCount })}
      >
        {items.map(campaign => (
          <CampaignSeatCard key={campaign.id} campaign={campaign} now={now} onOpen={openCampaignAction} />
        ))}
        {totalCount > items.length ? (
          <Pressable
            width={MORE_WIDTH}
            align="center"
            justify="center"
            gap="xs"
            p="md"
            borderRadius="xl"
            borderWidth="sm"
            borderColor={colors.border.strong}
            onPress={openDeals}
            scaleOnPress
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.brandHome.campaigns.allA11y', { count: totalCount })}
          >
            <Text variant="amountTitle">{formatNumber(totalCount)}</Text>
            <Text variant="buttonSmall" color={colors.interactive.text} align="center">
              {t('marketplace.brandHome.campaigns.all')}
            </Text>
          </Pressable>
        ) : null}
      </Rail>
    </StaggerIn>
  );
};

export const HomeCampaigns = memo(HomeCampaignsComponent);
