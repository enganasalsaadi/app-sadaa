import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ViewStyle } from 'react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Text, TierBadge } from '@/shared/ui';
import { ApplicantExpiryChip } from '../../../components/ApplicantExpiryChip';
import { CampaignCover } from '../../../components/CampaignCover';
import { CampaignGlassPill } from '../../../components/CampaignGlassPill';
import type { ApplicantCard } from '../../../types/campaign';
import { applicantTier, isPendingApplicant } from '../../../utils/applicants';
import { monogramOf } from '../../../utils/creatorText';

const HERO_HEIGHT = moderateScale(320);

export interface ApplicantHeroProps {
  applicant: ApplicantCard;
}

/**
 * The applicant's photo edge to edge under the overlay header: the time left to decide on top, the
 * tier, the invitation, the name and where they are from laid on it. The body slides over its lower edge.
 */
const ApplicantHeroComponent: React.FC<ApplicantHeroProps> = ({ applicant }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { top } = useSafeAreaInsets();
  const { creator } = applicant;
  const tier = applicantTier(creator.tier);
  const meta = [creator.governorate?.label, ...creator.niches.map(niche => niche.label)].filter(Boolean).join(' · ');
  const styles = useStyles(
    ({ spacing }): Record<'top' | 'monogram', ViewStyle> => ({
      top: { height: top + sizes.iconButton.md, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end' },
      monogram: { alignSelf: 'center', paddingBottom: spacing['4xl'] },
    }),
    [top, sizes.iconButton.md],
  );

  return (
    <CampaignCover uri={creator.avatarUrl} height={HERO_HEIGHT + top}>
      <Box style={styles.top}>{isPendingApplicant(applicant) ? <ApplicantExpiryChip expiresAt={applicant.expiresAt} /> : null}</Box>
      {creator.avatarUrl ? null : (
        <Box style={styles.monogram}>
          <Text variant="h1" color={colors.text.onBrand}>
            {monogramOf(creator.displayName)}
          </Text>
        </Box>
      )}
      <Box gap="sm" pb="3xl">
        <Box row align="center" gap="sm" wrap>
          {tier ? <TierBadge tier={tier} size="sm" interactive={false} surface="media" /> : null}
          {applicant.invited ? <CampaignGlassPill label={t('marketplace.campaign.applicants.card.invited')} /> : null}
        </Box>
        <Text variant="h2" color={colors.text.onBrand} numberOfLines={2}>
          {creator.displayName}
        </Text>
        {meta ? (
          <Text variant="bodySmall" color={colors.text.onBrandMuted} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </Box>
    </CampaignCover>
  );
};

export const ApplicantHero = memo(ApplicantHeroComponent);
