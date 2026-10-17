import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ViewStyle } from 'react-native';
import { formatNumber } from '@/core/i18n';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Card, Text } from '@/shared/ui';
import type { ApplicantCard } from '../../../types/campaign';
import { totalFollowers } from '../../../utils/applicants';

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };

export interface ApplicantStatsProps {
  applicant: ApplicantCard;
}

interface Stat {
  key: string;
  value: string;
  caption: string;
}

/** The three numbers a brand weighs first: rating, deals done on Sada, and the reach across the campaign's platforms. */
const ApplicantStatsComponent: React.FC<ApplicantStatsProps> = ({ applicant }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ spacing }): Record<'cell' | 'divider', ViewStyle> => ({
      cell: { flex: 1, alignItems: 'center', gap: spacing.xs },
      divider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border.default },
    }),
    [colors.border.default],
  );
  const { rating } = applicant.trackRecord;
  const followers = totalFollowers(applicant.accounts);
  const stats: Stat[] = [
    {
      key: 'rating',
      value: rating.average !== null ? formatNumber(rating.average, { maximumFractionDigits: 1 }) : '—',
      caption:
        rating.average !== null
          ? t('marketplace.campaign.applicants.detail.stats.reviews', { count: rating.count })
          : t('marketplace.campaign.applicants.detail.stats.noRating'),
    },
    {
      key: 'deals',
      value: formatNumber(applicant.trackRecord.completedDeals),
      caption: t('marketplace.campaign.applicants.detail.stats.deals'),
    },
    {
      key: 'followers',
      value: followers !== null ? formatNumber(followers, COMPACT) : '—',
      caption: t('marketplace.campaign.applicants.detail.stats.followers'),
    },
  ];

  return (
    <Card>
      <Box row align="center">
        {stats.map((stat, index) => (
          <React.Fragment key={stat.key}>
            {index > 0 ? <Box style={styles.divider} /> : null}
            <Box style={styles.cell} accessible accessibilityLabel={`${stat.value}, ${stat.caption}`}>
              <Text variant="h3" color={colors.text.primary}>
                {stat.value}
              </Text>
              <Text variant="caption" color={colors.text.secondary} align="center">
                {stat.caption}
              </Text>
            </Box>
          </React.Fragment>
        ))}
      </Box>
    </Card>
  );
};

export const ApplicantStats = memo(ApplicantStatsComponent);
