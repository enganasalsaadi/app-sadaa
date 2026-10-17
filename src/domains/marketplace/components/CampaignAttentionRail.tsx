import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react-native';
import { PauseCircle, PencilLine, Users } from 'lucide-react-native';
import { resolveHue, useTheme } from '@/core/theme';
import type { HueTone } from '@/core/theme';
import { Box, LiveDot, Pressable, Rail, Text } from '@/shared/ui';
import type { CampaignAttention, CampaignAttentionKind } from '../utils/campaignList';

const CHIP_WIDTH = 236;

const KIND_VIEW = {
  suspended: { icon: PauseCircle, tone: 'warning', hint: 'marketplace.campaign.list.attention.suspended' },
  seat_freed: { icon: Users, tone: 'interactive', hint: 'marketplace.campaign.list.attention.seatFreed' },
  changes_requested: { icon: PencilLine, tone: 'warning', hint: 'marketplace.campaign.list.attention.changes' },
} as const satisfies Record<CampaignAttentionKind, { icon: LucideIcon; tone: HueTone; hint: string }>;

interface ChipProps {
  item: CampaignAttention;
  onPress: (item: CampaignAttention) => void;
}

const AttentionChipComponent: React.FC<ChipProps> = ({ item, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const view = KIND_VIEW[item.kind];
  const hue = resolveHue(colors, view.tone);
  const hint = t(view.hint);
  const press = useCallback(() => onPress(item), [item, onPress]);

  return (
    <Pressable
      onPress={press}
      scaleOnPress
      accessibilityRole="button"
      accessibilityLabel={`${item.campaign.title}. ${hint}`}
      row
      align="center"
      gap="md"
      p="md"
      width={CHIP_WIDTH}
      borderRadius="lg"
      bg={hue.soft}
      borderWidth="thin"
      borderColor={hue.main}
    >
      <Box width={sizes.icon.xl} height={sizes.icon.xl} borderRadius="md" bg={colors.surface.main} align="center" justify="center">
        <view.icon size={sizes.icon.sm} color={hue.main} />
      </Box>
      <Box flex={1}>
        <Text variant="label" color={colors.text.primary} numberOfLines={1}>
          {item.campaign.title}
        </Text>
        <Text variant="caption" color={hue.text} numberOfLines={1}>
          {hint}
        </Text>
      </Box>
    </Pressable>
  );
};

const AttentionChip = memo(AttentionChipComponent);

export interface CampaignAttentionRailProps {
  items: readonly CampaignAttention[];
  /** Suspension and freed seat open the campaign; changes requested go straight back into the wizard. */
  onOpen: (item: CampaignAttention) => void;
}

/** «Needs your decision»: only what waits on the brand right now, so a calm account shows nothing. */
const CampaignAttentionRailComponent: React.FC<CampaignAttentionRailProps> = ({ items, onOpen }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  if (items.length === 0) return null;

  return (
    <Box gap="sm">
      <Box row align="center" gap="sm">
        <LiveDot color={colors.status.warning.main} size={sizes.dot.md} />
        <Text variant="label" color={colors.status.warning.text}>
          {t('marketplace.campaign.list.attention.title', { count: items.length })}
        </Text>
      </Box>
      <Rail bleed gap="sm" accessibilityLabel={t('marketplace.campaign.list.attention.railA11y')}>
        {items.map(item => (
          <AttentionChip key={item.campaign.id} item={item} onPress={onOpen} />
        ))}
      </Rail>
    </Box>
  );
};

export const CampaignAttentionRail = memo(CampaignAttentionRailComponent);
