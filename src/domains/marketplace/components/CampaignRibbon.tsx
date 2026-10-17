import React, { memo } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { resolveHue, useTheme } from '@/core/theme';
import type { HueTone } from '@/core/theme';
import { Box, Text } from '@/shared/ui';

export interface CampaignRibbonProps {
  tone: Extract<HueTone, 'warning' | 'interactive'>;
  icon: LucideIcon;
  label: string;
  /** Looks like a button; the whole card is what opens. */
  action: string;
}

/** A strip under a card's cover for the one thing that waits on the brand (suspension, freed seat). */
const CampaignRibbonComponent: React.FC<CampaignRibbonProps> = ({ tone, icon: Icon, label, action }) => {
  const { colors, sizes } = useTheme();
  const hue = resolveHue(colors, tone);
  return (
    <Box row align="center" gap="md" px="lg" py="md" bg={hue.soft}>
      <Icon size={sizes.icon.sm} color={hue.main} />
      <Box flex={1}>
        <Text variant="label" color={hue.text} numberOfLines={2}>
          {label}
        </Text>
      </Box>
      <Box px="md" py="xs" borderRadius="md" bg={hue.main}>
        <Text variant="buttonSmall" color={colors.text.onAccent}>
          {action}
        </Text>
      </Box>
    </Box>
  );
};

export const CampaignRibbon = memo(CampaignRibbonComponent);
