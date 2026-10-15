import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Hourglass } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Countdown, CustomButton, MoneyText, Text } from '@/shared/ui';
import type { DealUpsellsModel } from '../hooks/useDealUpsells';
import type { Deal, DealUpsell } from '../types';
import { formatUpsellLine } from '../utils/dealUpsell';

export interface DealUpsellPendingProps {
  deal: Deal;
  upsell: DealUpsell;
  upsells: DealUpsellsModel;
}

/** The brand's addendum while the creator hasn't answered: what was sent, its deadline, and a way to pull it back. */
const DealUpsellPendingComponent: React.FC<DealUpsellPendingProps> = ({ deal, upsell, upsells }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box p="lg" gap="md" bg={colors.surface.main} borderRadius="xl" shadow="card">
      <Box row gap="md" align="center">
        <Box
          width={sizes.avatar.md}
          height={sizes.avatar.md}
          borderRadius="full"
          align="center"
          justify="center"
          bg={colors.status.info.soft}
        >
          <Hourglass size={sizes.icon.md} color={colors.status.info.main} />
        </Box>
        <Box flex={1}>
          <Text variant="bodyMedium" color={colors.text.primary}>
            {t('marketplace.deals.changes.upsells.pendingTitle', { name: deal.creator.name ?? '' })}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {formatUpsellLine(t, upsell)}
          </Text>
        </Box>
        <MoneyText value={upsell.amount} size="md" showSign />
      </Box>
      {upsell.dueAt ? (
        <Countdown
          endsAt={upsell.dueAt}
          label={t('marketplace.deals.changes.upsells.paper.expiresIn')}
          size="sm"
        />
      ) : null}
      <CustomButton
        title={t('marketplace.deals.changes.upsells.withdraw')}
        variant="outline"
        fullWidth
        onPress={upsells.openWithdraw}
      />
    </Box>
  );
};

export const DealUpsellPending = memo(DealUpsellPendingComponent);
