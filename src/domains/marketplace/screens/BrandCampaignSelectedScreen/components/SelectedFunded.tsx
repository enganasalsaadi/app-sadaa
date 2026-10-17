import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import type { Money } from '@/core/money';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, MoneyText, Text } from '@/shared/ui';
import type { SeatFace } from '../../../utils/applicants';
import { SelectedSeats } from './SelectedSeats';

export interface SelectedFundedProps {
  face: SeatFace;
  taken: readonly SeatFace[];
  seatsOccupied: number;
  seatsTotal: number;
  price: Money | null;
  onOpenDeal: () => void;
  onKeepGoing: () => void;
}

/**
 * The money is held (frame 6): the picked creator rises into their seat, the price sits in escrow
 * and the next step is the deal or back to the table. The figures are the server's.
 */
const SelectedFundedComponent: React.FC<SelectedFundedProps> = ({
  face,
  taken,
  seatsOccupied,
  seatsTotal,
  price,
  onOpenDeal,
  onKeepGoing,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { text } = colors.button.primary;
  return (
    <Box flex={1} justify="center" gap="2xl" px="xl">
      <SelectedSeats total={seatsTotal} taken={taken} newcomer={face} celebrate />
      <Box align="center" gap="sm">
        <Text variant="h2" color={text} align="center">
          {t('marketplace.campaign.applicants.selected.funded.title', { seat: seatsOccupied, total: seatsTotal })}
        </Text>
        <Text variant="body" color={text} align="center">
          {t('marketplace.campaign.applicants.selected.funded.body', { name: face.name })}
        </Text>
      </Box>
      {price ? (
        <Box align="center" gap="xs" p="lg" borderRadius="lg" bg={colors.glass.fill}>
          <Box row align="center" gap="xs">
            <Lock size={sizes.icon.xs} color={text} />
            <Text variant="caption" color={text}>
              {t('marketplace.campaign.applicants.selected.funded.held')}
            </Text>
          </Box>
          <MoneyText value={price} size="lg" tone="onBrand" />
          <Text variant="caption" color={text} align="center">
            {t('marketplace.campaign.applicants.selected.funded.heldNote')}
          </Text>
        </Box>
      ) : null}
      <Box gap="md">
        <CustomButton variant="onBrand" fullWidth title={t('marketplace.campaign.applicants.selected.openDeal')} onPress={onOpenDeal} />
        <CustomButton variant="glass" fullWidth title={t('marketplace.campaign.applicants.selected.continue')} onPress={onKeepGoing} />
      </Box>
    </Box>
  );
};

export const SelectedFunded = memo(SelectedFundedComponent);
