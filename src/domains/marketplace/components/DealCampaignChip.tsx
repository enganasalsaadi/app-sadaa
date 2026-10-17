import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Megaphone } from 'lucide-react-native';
import { iconStroke, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import type { DealCampaignRef } from '../types';

export interface DealCampaignChipProps {
  campaign: DealCampaignRef;
  /** Frosted over the navy hero; `soft` on a card. */
  surface: 'hero' | 'soft';
  /** Without it the chip is a plain tag (inside a list row that is already tappable). */
  onOpen?: (campaignId: string) => void;
}

/** «From a campaign»: the megaphone and the campaign's title, opening the campaign when it can. */
const DealCampaignChipComponent: React.FC<DealCampaignChipProps> = ({ campaign, surface, onOpen }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  // A long title gives way to the arrow instead of pushing the chip past the screen.
  const styles = useStyles(() => ({ title: { flexShrink: 1 } }));
  const open = useCallback(() => onOpen?.(campaign.id), [campaign.id, onOpen]);
  const onHero = surface === 'hero';
  const ink = onHero ? colors.text.onBrand : colors.interactive.text;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const body = (
    <>
      <Megaphone size={sizes.icon.xs} color={ink} strokeWidth={iconStroke.bold} />
      <Text variant="caption" color={ink} numberOfLines={1} style={styles.title}>
        {campaign.title}
      </Text>
      {onOpen ? <Chevron size={sizes.icon.xs} color={ink} strokeWidth={iconStroke.bold} /> : null}
    </>
  );
  const shape = {
    row: true,
    align: 'center',
    gap: 'xs',
    px: 'md',
    py: 'xs',
    borderRadius: 'full',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    bg: onHero ? colors.glass.fill : colors.interactive.soft,
    borderWidth: onHero ? 'thin' : undefined,
    borderColor: onHero ? colors.glass.border : undefined,
  } as const;

  if (!onOpen) {
    return (
      <Box {...shape} accessible accessibilityLabel={t('marketplace.deals.campaign.fromA11y', { title: campaign.title })}>
        {body}
      </Box>
    );
  }
  return (
    <Pressable
      {...shape}
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.deals.campaign.openA11y', { title: campaign.title })}
    >
      {body}
    </Pressable>
  );
};

export const DealCampaignChip = memo(DealCampaignChipComponent);
