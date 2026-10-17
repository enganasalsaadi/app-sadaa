import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, MoneyText, Pressable, Text } from '@/shared/ui';
import { DealCampaignChip } from '../../../components/DealCampaignChip';
import { DealFace } from '../../../components/DealFace';
import { DEAL_TRACK_STOP_LABEL, DEAL_TRACK_STOPS } from '../../../constants/brandHomeDeals';
import type { BrandActiveDeal } from '../../../types';
import { dealTrack } from '../../../utils/brandHomeDeals';
import { DealTrackStops } from './DealTrackStops';

const FACE = moderateScale(42);
const ROW_MIN = moderateScale(76);

interface DealTrackRowProps {
  deal: BrandActiveDeal;
  onOpen: (id: string) => void;
}

/** One deal moving without the brand: face, name, what and where (server labels), amount, tracker. */
const DealTrackRowComponent: React.FC<DealTrackRowProps> = ({ deal, onOpen }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const open = useCallback(() => onOpen(deal.id), [deal.id, onOpen]);
  const track = useMemo(() => dealTrack(deal), [deal]);
  const name = deal.creator.name ?? '';
  const where = deal.stage?.label ?? deal.status.label;
  const stop = DEAL_TRACK_STOPS[track.stop];
  const stage = track.stopped || !stop ? deal.status.label : t(DEAL_TRACK_STOP_LABEL[stop]);

  return (
    <Pressable
      row
      align="center"
      gap="md"
      px="lg"
      py="md"
      minHeight={ROW_MIN}
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={t('marketplace.brandHome.deals.rowLabel', {
        name,
        amount: formatMoney(deal.total),
        stage: `${stage} · ${where}`,
      })}
    >
      <DealFace party={deal.creator} size={FACE} />
      <Box flex={1}>
        <Box row align="flex-start" justify="space-between" gap="sm">
          <Box flex={1}>
            <Text variant="bodyMedium" numberOfLines={1}>
              {name}
            </Text>
            <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
              {`${deal.title} · ${where}`}
            </Text>
          </Box>
          <MoneyText value={deal.total} size="sm" />
        </Box>
        {deal.campaign ? (
          <Box mt="xs">
            <DealCampaignChip campaign={deal.campaign} surface="soft" />
          </Box>
        ) : null}
        <DealTrackStops track={track} stoppedLabel={deal.status.label} />
      </Box>
    </Pressable>
  );
};

export const DealTrackRow = memo(DealTrackRowComponent);
