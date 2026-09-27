import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Money } from '@/core/money';
import { useTheme } from '@/core/theme';
import { Avatar, Box, Card, Countdown, MoneyText, Text } from '@/shared/ui';
import type { DealStatus } from '../types';
import { DealStatusPill } from './DealStatusPill';

export interface DealCardProps {
  title: string;
  /** Creator name for brands, brand name for creators. */
  counterpartName: string;
  counterpartAvatarUri?: string;
  /** Localised ad type ("Reel", "Story"). */
  adTypeLabel: string;
  /** Deal value (price, not money flow → default tone). */
  amount: Money;
  status: DealStatus | null;
  /** Next deadline (draft due, review window), epoch ms. */
  dueAt?: number | null;
  dueLabel?: string;
  onPress: () => void;
}

/** Deal row for pipeline lists (`SuperList` item — keep it memoised). */
const DealCardComponent: React.FC<DealCardProps> = ({
  title,
  counterpartName,
  counterpartAvatarUri,
  adTypeLabel,
  amount,
  status,
  dueAt = null,
  dueLabel,
  onPress,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  return (
    <Card onPress={onPress} accessibilityLabel={title}>
      <Box gap="md">
        <Box row align="center" gap="md">
          <Avatar uri={counterpartAvatarUri} size={sizes.avatar.sm} />
          <Box flex={1} gap="xs">
            <Text variant="bodyMedium" numberOfLines={1}>
              {title}
            </Text>
            <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
              {t('marketplace.deal.meta', { counterpart: counterpartName, adType: adTypeLabel })}
            </Text>
          </Box>
          <DealStatusPill status={status} size="sm" />
        </Box>
        <Box row align="center" justify="space-between" gap="md">
          <MoneyText value={amount} />
          <Countdown endsAt={dueAt} label={dueLabel} size="sm" />
        </Box>
      </Box>
    </Card>
  );
};

export const DealCard = memo(DealCardComponent);
