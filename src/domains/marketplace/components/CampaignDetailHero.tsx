import React, { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, resolveHue, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { CampaignDetail } from '../types/campaign';
import { getCampaignStatusMeta } from '../utils/campaignStatus';
import { CampaignCover } from './CampaignCover';
import { CampaignDeadlineChip } from './CampaignDeadlineChip';
import { CampaignGlassPill } from './CampaignGlassPill';

const HERO_HEIGHT = moderateScale(208);

export interface CampaignDetailHeroProps {
  campaign: CampaignDetail;
}

/**
 * The campaign page's top, kept short so the page's work starts early: its cover edge to edge
 * under the overlay header (rings on the brand gradient while it has none), with the status, time
 * left to recruit, title and kind laid on it. The body slides over its lower edge.
 */
const CampaignDetailHeroComponent: React.FC<CampaignDetailHeroProps> = ({ campaign }) => {
  const { colors, sizes } = useTheme();
  const { top } = useSafeAreaInsets();
  const { status, activityType, pricing } = campaign;
  const tone = getCampaignStatusMeta(status.key).tone;
  const kind = [activityType?.label, pricing.model.label].filter(Boolean).join(' · ');

  return (
    <CampaignCover uri={campaign.cover?.url ?? null} height={HERO_HEIGHT + top} rings>
      <Box height={top + sizes.iconButton.md} />
      <Box gap="sm" pb="3xl">
        <Box row align="center" gap="sm" wrap>
          <CampaignGlassPill label={status.label} dotColor={resolveHue(colors, tone).main} />
          {status.key === 'open' ? <CampaignDeadlineChip endsAt={campaign.applyDeadlineAt} /> : null}
        </Box>
        <Text variant="h3" color={colors.text.onBrand} numberOfLines={2}>
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

export const CampaignDetailHero = memo(CampaignDetailHeroComponent);
