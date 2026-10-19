import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone, Rocket, Truck, type LucideIcon } from 'lucide-react-native';
import { iconStroke, useTheme } from '@/core/theme';
import { Box, Pressable, SectionHeader, Text } from '@/shared/ui';
import type { Campaign } from '../types/campaign';
import type { CampaignBatchTools } from '../utils/campaignBatchTools';
import { secondsBetween } from '../utils/campaignDrop';
import { formatRemaining } from '../utils/dealTimer';
import { useClock } from '../hooks/useClock';

const MINUTE = 60_000;

interface Tool {
  key: 'drop' | 'shipping' | 'announcements';
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export interface CampaignBatchToolsCardProps {
  campaign: Pick<Campaign, 'dropAt'>;
  tools: CampaignBatchTools;
  onOpenDrop: () => void;
  onOpenShipping: () => void;
  onOpenAnnouncements: () => void;
}

/** The brand's batch tools of a campaign: a tile per tool that applies (launch room, shipping, broadcasts). */
const CampaignBatchToolsCardComponent: React.FC<CampaignBatchToolsCardProps> = ({
  campaign,
  tools,
  onOpenDrop,
  onOpenShipping,
  onOpenAnnouncements,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const now = useClock(MINUTE);
  const dropAt = campaign.dropAt;

  const entries = useMemo(() => {
    const list: Tool[] = [];
    if (tools.drop) {
      list.push({
        key: 'drop',
        icon: Rocket,
        title: t('marketplace.campaign.detail.tools.drop.title'),
        subtitle:
          dropAt !== null && dropAt > now
            ? t('marketplace.campaign.detail.tools.drop.pending', { remaining: formatRemaining(t, secondsBetween(now, dropAt)) })
            : t('marketplace.campaign.detail.tools.drop.live'),
        onPress: onOpenDrop,
      });
    }
    if (tools.shipping) {
      list.push({
        key: 'shipping',
        icon: Truck,
        title: t('marketplace.campaign.detail.tools.shipping.title'),
        subtitle: t('marketplace.campaign.detail.tools.shipping.subtitle'),
        onPress: onOpenShipping,
      });
    }
    if (tools.announcements) {
      list.push({
        key: 'announcements',
        icon: Megaphone,
        title: t('marketplace.campaign.detail.tools.announcements.title'),
        subtitle: t('marketplace.campaign.detail.tools.announcements.subtitle'),
        onPress: onOpenAnnouncements,
      });
    }
    return list;
  }, [dropAt, now, onOpenAnnouncements, onOpenDrop, onOpenShipping, t, tools.announcements, tools.drop, tools.shipping]);

  const rows: Tool[][] = [];
  for (let index = 0; index < entries.length; index += 2) rows.push(entries.slice(index, index + 2));

  return (
    <Box gap="md">
      <SectionHeader title={t('marketplace.campaign.detail.tools.title')} emphasis="strong" />
      {rows.map(row => (
        <Box key={row.map(tool => tool.key).join('+')} row gap="md">
          {row.map(tool => {
            const Icon = tool.icon;
            return (
              <Pressable
                key={tool.key}
                flex={1}
                gap="sm"
                p="md"
                borderRadius="lg"
                bg={colors.surface.main}
                shadow="card"
                scaleOnPress
                onPress={tool.onPress}
                accessibilityRole="button"
                accessibilityLabel={`${tool.title}. ${tool.subtitle}`}
              >
                <Box width={sizes.icon.xl} height={sizes.icon.xl} borderRadius="md" align="center" justify="center" bg={colors.interactive.soft}>
                  <Icon size={sizes.icon.md} color={colors.interactive.text} strokeWidth={iconStroke.regular} />
                </Box>
                <Text variant="bodyMedium" color={colors.text.primary}>
                  {tool.title}
                </Text>
                <Text variant="caption" color={colors.text.secondary}>
                  {tool.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

export const CampaignBatchToolsCard = memo(CampaignBatchToolsCardComponent);
