import React, { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { CreatorCampaignDetail } from '../types/campaign';
import { CampaignCover } from './CampaignCover';
import { CampaignGlassPill } from './CampaignGlassPill';
import { OpportunityBadges } from './OpportunityBadges';
import { OpportunityBrandPill } from './OpportunityBrandPill';

const HERO_HEIGHT = moderateScale(268);

export interface CreatorCampaignHeroProps {
  campaign: CreatorCampaignDetail;
}

/**
 * The creator's campaign page top: the cover edge to edge under the overlay header, the brand, what
 * sets the campaign apart (applied, invited, secured, ships), the title and its kind. A campaign that
 * is no longer open says so on the cover; the body slides over its lower edge.
 */
const CreatorCampaignHeroComponent: React.FC<CreatorCampaignHeroProps> = ({ campaign }) => {
  const { colors, sizes } = useTheme();
  const { top } = useSafeAreaInsets();
  const { status, activityType, pricing, brand } = campaign;
  const kind = [activityType?.label, pricing.model.label].filter(Boolean).join(' · ');

  return (
    <CampaignCover uri={campaign.cover?.url ?? null} height={HERO_HEIGHT + top}>
      <Box height={top + sizes.iconButton.md} />
      <Box gap="sm" pb="3xl">
        <Box row align="center" gap="sm" wrap>
          <OpportunityBrandPill brand={brand} />
          {status.key !== 'open' ? <CampaignGlassPill label={status.label} /> : null}
        </Box>
        <OpportunityBadges campaign={campaign} />
        <Text variant="h2" color={colors.text.onBrand} numberOfLines={2}>
          {campaign.title}
        </Text>
        {kind ? (
          <Text variant="bodySmall" color={colors.text.onBrandMuted} numberOfLines={1}>
            {kind}
          </Text>
        ) : null}
      </Box>
    </CampaignCover>
  );
};

export const CreatorCampaignHero = memo(CreatorCampaignHeroComponent);
