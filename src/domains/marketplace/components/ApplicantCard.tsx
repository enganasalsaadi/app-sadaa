import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import type { ViewStyle } from 'react-native';
import { iconStroke, moderateScale, resolveHue, useStyles, useTheme } from '@/core/theme';
import { isSocialPlatform } from '@/shared/utils';
import {
  Box,
  Card,
  Image,
  MoneyText,
  SocialPlatformIcon,
  StatusPill,
  Text,
  TierBadge,
} from '@/shared/ui';
import type { ApplicantCard as Applicant } from '../types/campaign';
import { accountsByReach, applicantTier, isPendingApplicant } from '../utils/applicants';
import { monogramOf } from '../utils/creatorText';
import { ApplicantExpiryChip } from './ApplicantExpiryChip';
import { CampaignGlassPill } from './CampaignGlassPill';

const PHOTO_WIDTH = moderateScale(112);
const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
/** The platforms a campaign asks for are few; more than this many reach figures stop reading as a line. */
const MAX_REACH = 3;
const MAX_NICHES = 2;

export interface ApplicantCardProps {
  applicant: Applicant;
}

const Photo = memo<{ applicant: Applicant }>(({ applicant }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ spacing }): Record<'overlay', ViewStyle> => ({
      overlay: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, padding: spacing.sm, justifyContent: 'space-between' },
    }),
  );
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);
  const { creator } = applicant;
  const showImage = !!creator.avatarUrl && !failed;
  return (
    <Box
      width={PHOTO_WIDTH}
      align="center"
      justify="center"
      overflow="hidden"
      bg={colors.brand.soft}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {showImage ? (
        <Image uri={creator.avatarUrl ?? undefined} width="100%" height="100%" resizeMode="cover" onError={onError} />
      ) : (
        <Text variant="h1" color={colors.brand.text}>
          {monogramOf(creator.displayName)}
        </Text>
      )}
      <Box style={styles.overlay}>
        {applicant.invited ? (
          <CampaignGlassPill label={t('marketplace.campaign.applicants.card.invited')} />
        ) : (
          <Box />
        )}
        {isPendingApplicant(applicant) ? <ApplicantExpiryChip expiresAt={applicant.expiresAt} /> : null}
      </Box>
    </Box>
  );
});

const Reach = memo<{ applicant: Applicant }>(({ applicant }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { rating } = applicant.trackRecord;
  return (
    <Box row align="center" gap="md" wrap>
      {accountsByReach(applicant.accounts)
        .slice(0, MAX_REACH)
        .map(account => (
          <Box key={account.platform.key} row align="center" gap="xs">
            {isSocialPlatform(account.platform.key) ? (
              <SocialPlatformIcon platform={account.platform.key} size={sizes.icon.xs} color={colors.text.primary} />
            ) : null}
            <Text variant="bodyMedium" color={colors.text.primary}>
              {formatNumber(account.followerCount, COMPACT)}
            </Text>
          </Box>
        ))}
      {rating.average !== null ? (
        <Box row align="center" gap="xs">
          <Star size={sizes.icon.xs} color={colors.premium.main} fill={colors.premium.main} strokeWidth={iconStroke.regular} />
          <Text variant="caption" color={colors.text.primary}>
            {t('marketplace.campaign.applicants.card.rating', {
              average: formatNumber(rating.average, { maximumFractionDigits: 1 }),
              count: formatNumber(rating.count),
            })}
          </Text>
        </Box>
      ) : (
        <Text variant="caption" color={colors.text.secondary}>
          {t('marketplace.campaign.applicants.card.noRating')}
        </Text>
      )}
    </Box>
  );
});

/** A decided applicant says where it stands; a pending one leaves the corner free for the decisions (PC3.2+). */
const StateTag = memo<{ applicant: Applicant }>(({ applicant }) => {
  const { t } = useTranslation();
  const { key, label } = applicant.status;
  if (key === 'submitted') return null;
  if (key === 'shortlisted') {
    return <StatusPill label={t('marketplace.campaign.applicants.card.shortlisted')} tone="premium" icon={Star} size="sm" />;
  }
  const tone = key === 'selected' ? 'success' : 'neutral';
  return <StatusPill label={applicant.deal?.status.label ?? label} tone={tone} size="sm" />;
});

/**
 * One applicant on the table: the creator's photo leads (with the time left to decide), then the
 * name, reach, rating and pitch; the price the brand would pay sits below. Read-only until the
 * decisions arrive.
 */
const ApplicantCardComponent: React.FC<ApplicantCardProps> = ({ applicant }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { creator, price, pitch } = applicant;
  const tier = applicantTier(creator.tier);
  const meta = [creator.governorate?.label, ...creator.niches.slice(0, MAX_NICHES).map(niche => niche.label)]
    .filter(Boolean)
    .join(' · ');
  const money = resolveHue(colors, 'money');
  const styles = useStyles((): Record<'card', ViewStyle> => ({ card: { overflow: 'hidden', padding: 0 } }));

  return (
    <Card
      style={styles.card}
      accessibilityLabel={t('marketplace.campaign.applicants.card.a11y', {
        name: creator.displayName,
        status: applicant.status.label,
      })}
    >
      <Box row minHeight={moderateScale(150)}>
        <Photo applicant={applicant} />
        <Box flex={1} p="md" gap="xs">
          <Box row align="center" gap="sm">
            <Box flex={1}>
              <Text variant="title" color={colors.text.primary} numberOfLines={1}>
                {creator.displayName}
              </Text>
            </Box>
            {tier ? <TierBadge tier={tier} size="sm" interactive={false} /> : null}
          </Box>
          {meta ? (
            <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
              {meta}
            </Text>
          ) : null}
          <Reach applicant={applicant} />
          {pitch ? (
            <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={2}>
              {pitch}
            </Text>
          ) : null}
        </Box>
      </Box>
      <Box row align="center" justify="space-between" gap="md" px="md" py="sm" bg={money.soft}>
        <Box>
          <MoneyText value={price.gross} size="title" tone="money" />
          <Text variant="caption" color={colors.text.secondary}>
            {t(price.isBid ? 'marketplace.campaign.applicants.card.bid' : 'marketplace.campaign.applicants.card.fixed')}
          </Text>
        </Box>
        <StateTag applicant={applicant} />
      </Box>
    </Card>
  );
};

export const ApplicantCard = memo(ApplicantCardComponent);
