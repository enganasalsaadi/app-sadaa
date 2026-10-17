import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Clock, UserRound } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import { iconStroke, moderateScale, resolveHue, useStyles, useTheme } from '@/core/theme';
import { Box, Card, ProgressBar, Text } from '@/shared/ui';
import type { CreatorCampaign } from '../types/campaign';
import { useClock } from '../hooks/useClock';
import {
  deadlineRemaining,
  genderRequiredReason,
  netHeadline,
  opportunityDeadline,
} from '../utils/opportunities';
import { CampaignCover } from './CampaignCover';
import { OpportunityBadges } from './OpportunityBadges';
import { OpportunityBookmark } from './OpportunityBookmark';
import { OpportunityBrandPill } from './OpportunityBrandPill';
import { OpportunityDeliverables } from './OpportunityDeliverables';
import { OpportunityNet } from './OpportunityNet';
import { OpportunitySeats } from './OpportunitySeats';

const COVER_HEIGHT = moderateScale(158);
const NOTCH = moderateScale(18);

const DEADLINE_KEY = {
  days: 'marketplace.campaign.feed.card.deadline.days',
  hours: 'marketplace.campaign.feed.card.deadline.hours',
} as const;

export interface OpportunityCardProps {
  campaign: CreatorCampaign;
  onPress: (id: string) => void;
  onToggleBookmark: (campaign: CreatorCampaign) => void;
}

/**
 * «The opportunity ticket» (PC4.0): the cover with the brand and what sets it apart, the title and
 * what is asked, then a torn-off stub with what the creator takes home, the seats left and the
 * time to apply; a thin bar under it drains toward the deadline.
 */
const OpportunityCardComponent: React.FC<OpportunityCardProps> = ({ campaign, onPress, onToggleBookmark }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const now = useClock(60_000);
  const styles = useStyles(
    ({ borderWidths }): Record<'card' | 'tear' | 'line' | 'notch' | 'notchStart' | 'notchEnd', ViewStyle> => ({
      card: { overflow: 'hidden', padding: 0 },
      tear: { height: NOTCH, justifyContent: 'center' },
      line: {
        borderTopWidth: borderWidths.sm,
        borderStyle: 'dashed',
        borderColor: colors.border.strong,
        marginHorizontal: NOTCH,
      },
      notch: {
        position: 'absolute',
        width: NOTCH,
        height: NOTCH,
        borderRadius: NOTCH / 2,
        backgroundColor: colors.layout.base,
      },
      notchStart: { start: -NOTCH / 2 },
      notchEnd: { end: -NOTCH / 2 },
    }),
    [colors.border.strong, colors.layout.base],
  );
  const { id, title, brand, pricing, seats, applyDeadlineAt, publishedAt, bookmarked } = campaign;
  const headline = netHeadline(pricing);
  const deadline = opportunityDeadline(applyDeadlineAt, now);
  const remaining = deadlineRemaining(publishedAt, applyDeadlineAt, now);
  const needsGender = genderRequiredReason(campaign);
  const urgent = deadline?.urgent ?? false;
  const warning = resolveHue(colors, 'warning');

  const open = useCallback(() => onPress(id), [id, onPress]);
  const toggle = useCallback(() => onToggleBookmark(campaign), [campaign, onToggleBookmark]);

  const net =
    headline === null
      ? ''
      : headline.kind === 'fixed'
        ? formatMoney(headline.net)
        : `${formatMoney(headline.min)} – ${formatMoney(headline.max)}`;

  return (
    <Card
      onPress={open}
      style={styles.card}
      accessibilityLabel={t('marketplace.campaign.feed.card.a11y', { title, brand: brand.name, net })}
    >
      <CampaignCover uri={campaign.cover?.url ?? null} height={COVER_HEIGHT}>
        <Box row justify="space-between" align="flex-start" gap="sm">
          <OpportunityBookmark saved={bookmarked} onToggle={toggle} />
          <OpportunityBrandPill brand={brand} />
        </Box>
        <OpportunityBadges campaign={campaign} />
      </CampaignCover>
      <Box p="lg" gap="md">
        <Text variant="h4" numberOfLines={2}>
          {title}
        </Text>
        <OpportunityDeliverables campaign={campaign} />
        {needsGender ? (
          <Box row align="center" gap="xs" px="md" py="xs" borderRadius="full" bg={warning.soft} alignSelf="flex-start">
            <UserRound size={sizes.icon.xs} color={warning.main} strokeWidth={iconStroke.bold} />
            <Text variant="label" color={warning.text}>
              {needsGender.label}
            </Text>
          </Box>
        ) : null}
      </Box>
      <Box style={styles.tear} pointerEvents="none">
        <Box style={styles.line} />
        <Box style={[styles.notch, styles.notchStart]} />
        <Box style={[styles.notch, styles.notchEnd]} />
      </Box>
      <Box row justify="space-between" align="flex-end" gap="lg" px="lg" pt="sm" pb="md">
        {headline ? <OpportunityNet headline={headline} bidding={pricing.bid !== null} /> : <Box />}
        <Box gap="sm" align="flex-end">
          <OpportunitySeats total={seats.total} free={seats.free} />
          {deadline ? (
            <Box row align="center" gap="xs">
              <Clock
                size={sizes.icon.xs}
                color={urgent ? warning.main : colors.icon.secondary}
                strokeWidth={iconStroke.bold}
              />
              <Text variant="label" color={urgent ? warning.text : colors.text.primary}>
                {deadline.unit === 'lastHour'
                  ? t('marketplace.campaign.feed.card.deadline.lastHour')
                  : t(DEADLINE_KEY[deadline.unit], { count: deadline.count })}
              </Text>
            </Box>
          ) : null}
        </Box>
      </Box>
      {remaining !== null && deadline ? (
        <Box px="lg" pb="lg">
          <ProgressBar
            value={remaining}
            tone={urgent ? 'warning' : 'interactive'}
            accessibilityLabel={t('marketplace.campaign.feed.card.deadlineBar')}
          />
        </Box>
      ) : null}
    </Card>
  );
};

export const OpportunityCard = memo(OpportunityCardComponent);
