import React, { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Card, GradientSurface, Image, StatusPill, Text } from '@/shared/ui';
import type { Campaign } from '../types';
import { formatCampaignDate } from '../utils/campaignSchedule';
import { getCampaignStatusMeta } from '../utils/campaignStatus';

const THUMB = moderateScale(56);

export interface CampaignFinishedRowProps {
  campaign: Campaign;
  onPress: (id: string) => void;
}

/** A campaign that is over (done, cancelled, refused, removed): a calm compact row that doesn't compete with the live ones. */
const CampaignFinishedRowComponent: React.FC<CampaignFinishedRowProps> = ({ campaign, onPress }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { id, status, counters, seatsTotal } = campaign;
  const open = useCallback(() => onPress(id), [id, onPress]);
  const uri = campaign.cover?.url ?? null;

  return (
    <Card
      onPress={open}
      p="md"
      accessibilityLabel={t('marketplace.campaign.list.cardA11y', { title: campaign.title, status: status.label })}
    >
      <Box row align="center" gap="md">
        <Box width={THUMB} height={THUMB} borderRadius="md" overflow="hidden" bg={colors.surface.elevated}>
          {uri ? <Image uri={uri} width="100%" height="100%" /> : <GradientSurface variant="brand" style={StyleSheet.absoluteFill} />}
        </Box>
        <Box flex={1} gap="xs">
          <Text variant="title" color={colors.text.primary} numberOfLines={1}>
            {campaign.title}
          </Text>
          <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
            {t('marketplace.campaign.list.finishedMeta', {
              filled: counters.seatsOccupied,
              total: seatsTotal,
              date: formatCampaignDate(campaign.updatedAt),
            })}
          </Text>
        </Box>
        <StatusPill label={status.label} tone={getCampaignStatusMeta(status.key).tone} size="sm" />
      </Box>
    </Card>
  );
};

export const CampaignFinishedRow = memo(CampaignFinishedRowComponent);
