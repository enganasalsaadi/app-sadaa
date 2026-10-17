import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { useCountdown } from '@/core/hooks';
import { formatNumber } from '@/core/i18n';
import { iconStroke, moderateScale, resolveHue, useTheme } from '@/core/theme';
import { Box, Card, StatusPill, Text } from '@/shared/ui';
import { DealFace } from '../../../components/DealFace';
import { CAMPAIGN_DROP_STATE_TONE, UNKNOWN_CAMPAIGN_DROP_STATE_TONE } from '../../../constants/campaignDrop';
import type { CampaignDropCreator } from '../../../types/campaignDrop';
import { campaignDropClockParts, secondsBetween } from '../../../utils/campaignDrop';
import { formatRemaining } from '../../../utils/dealTimer';

const MAX_DOTS = 10;
const DOT_WIDTH = moderateScale(14);
const DOT_HEIGHT = moderateScale(6);
const pad = (value: number) => formatNumber(value, { minimumIntegerDigits: 2 });

export interface DropLaneProps {
  creator: CampaignDropCreator;
  /** Minute-level clock for the plain deadlines; a late row ticks its own seconds. */
  now: number;
  /** One stable handler for every row. */
  onOpen: (dealId: string) => void;
}

/** Verified first, then in review, then the rest still to come. */
const Dots = memo<{ total: number; verified: number; inReview: number }>(({ total, verified, inReview }) => {
  const { colors } = useTheme();
  const shown = Math.min(total, MAX_DOTS);
  return (
    <Box row gap="xs" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: shown }, (_, index) => (
        <Box
          key={index}
          width={DOT_WIDTH}
          height={DOT_HEIGHT}
          borderRadius="full"
          bg={index < verified ? colors.status.success.main : index < verified + inReview ? colors.status.info.main : colors.border.default}
        />
      ))}
    </Box>
  );
});

/** One creator of the drop: who, where they stand (server words), how many pieces are through, and the clock that matters. */
const DropLaneComponent: React.FC<DropLaneProps> = ({ creator, now, onOpen }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { state, items } = creator;
  const late = state.key === 'late';
  const tone = state.key === null ? UNKNOWN_CAMPAIGN_DROP_STATE_TONE : CAMPAIGN_DROP_STATE_TONE[state.key];
  const warning = resolveHue(colors, 'warning');
  const grace = useCountdown(late ? creator.lateUntil : null);
  const handlePress = useCallback(() => onOpen(creator.dealId), [creator.dealId, onOpen]);

  const name = creator.name ?? t('marketplace.campaign.drop.lane.unnamed');
  const itemsText = [
    t('marketplace.campaign.drop.lane.items', { verified: formatNumber(items.verified), total: formatNumber(items.total) }),
    items.inReview > 0 ? t('marketplace.campaign.drop.lane.inReview', { count: items.inReview }) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const parts = campaignDropClockParts(grace);
  const timeText =
    late && creator.lateUntil !== null
      ? `${pad(parts.days * 24 + parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
      : creator.dueAt !== null && state.key !== 'verified' && state.key !== 'defaulted' && state.key !== 'ended'
        ? formatRemaining(t, secondsBetween(now, creator.dueAt))
        : null;
  const timeCaption = late ? t('marketplace.campaign.drop.lane.graceEnds') : t('marketplace.campaign.drop.lane.due');

  return (
    <Card
      p="md"
      shadow={late ? 'none' : 'card'}
      bg={late ? warning.soft : undefined}
      borderWidth={late ? 'thin' : undefined}
      borderColor={late ? warning.main : undefined}
      onPress={handlePress}
      accessibilityLabel={`${t('marketplace.campaign.drop.lane.open', { name })} · ${state.label} · ${itemsText}`}
    >
      <Box row align="center" gap="md">
        <DealFace party={{ name: creator.name, avatarUrl: creator.avatarUrl }} size={sizes.avatar.md} />
        <Box flex={1} gap="xs">
          <Box row align="center" gap="sm" wrap>
            <Text variant="bodyMedium" color={colors.text.primary} numberOfLines={1}>
              {name}
            </Text>
            <StatusPill label={state.label} tone={tone} size="sm" />
          </Box>
          <Box row align="center" gap="sm">
            <Dots total={items.total} verified={items.verified} inReview={items.inReview} />
            <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
              {itemsText}
            </Text>
          </Box>
        </Box>
        {timeText !== null ? (
          <Box align="flex-end">
            <Text variant="bodyMedium" color={late ? warning.text : colors.text.primary} writingDirection="ltr">
              {timeText}
            </Text>
            <Text variant="caption" color={colors.text.tertiary}>
              {timeCaption}
            </Text>
          </Box>
        ) : state.key === 'verified' ? (
          <Check size={sizes.icon.sm} color={colors.status.success.main} strokeWidth={iconStroke.bold} />
        ) : null}
      </Box>
    </Card>
  );
};

export const DropLane = memo(DropLaneComponent);
