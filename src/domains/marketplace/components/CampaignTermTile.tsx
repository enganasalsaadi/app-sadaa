import React, { memo } from 'react';
import { iconStroke, useTheme } from '@/core/theme';
import type { LucideIcon } from 'lucide-react-native';
import { Box, Text } from '@/shared/ui';

export interface CampaignTermTileProps {
  icon: LucideIcon;
  label: string;
  /** `money` is the price tile only (rule 08: mint = money). */
  tone?: 'neutral' | 'money';
  children: React.ReactNode;
}

/** One term of the campaign: a small label with its icon over the value; the caller fills the value. */
const CampaignTermTileComponent: React.FC<CampaignTermTileProps> = ({ icon: Icon, label, tone = 'neutral', children }) => {
  const { colors, sizes } = useTheme();
  const money = tone === 'money';
  return (
    <Box flex={1} gap="sm" p="md" borderRadius="lg" bg={money ? colors.money.soft : colors.surface.main} shadow={money ? 'none' : 'card'}>
      <Box row align="center" gap="xs">
        <Icon size={sizes.icon.xs} color={money ? colors.money.text : colors.text.tertiary} strokeWidth={iconStroke.regular} />
        <Text variant="caption" color={money ? colors.money.text : colors.text.tertiary} numberOfLines={1}>
          {label}
        </Text>
      </Box>
      {children}
    </Box>
  );
};

export const CampaignTermTile = memo(CampaignTermTileComponent);
