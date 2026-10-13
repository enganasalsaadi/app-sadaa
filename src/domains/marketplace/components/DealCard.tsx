import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { ShieldCheck } from 'lucide-react-native';
import { Avatar, Box, Card, Countdown, MoneyText, Text } from '@/shared/ui';
import type { Deal, DealRole } from '../types';
import { getDealStatusMeta } from '../utils';
import { DealProgress } from './DealProgress';
import { DealStatusPill } from './DealStatusPill';

export interface DealCardProps {
  deal: Deal;
  /** Viewer's side: brands see the creator, creators see the brand. */
  role: DealRole;
  /** Adds the phase track (Home's active-deal card). */
  showProgress?: boolean;
  onPress: (dealId: string) => void;
}

/** Deal row for pipeline lists (`SuperList` item — keep it memoised, pass a stable `onPress`). */
const DealCardComponent: React.FC<DealCardProps> = ({ deal, role, showProgress = false, onPress }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const counterpart = role === 'brand' ? deal.creator : deal.brand;
  const title = deal.items[0]?.title ?? '';
  const heldInEscrow = deal.fundedAt !== null && getDealStatusMeta(deal.status.key).outcome === 'open';
  const handlePress = useCallback(() => onPress(deal.id), [onPress, deal.id]);

  return (
    <Card onPress={handlePress} accessibilityLabel={title}>
      <Box gap="md">
        <Box row align="center" gap="md">
          <Avatar uri={counterpart.avatarUrl ?? undefined} size={sizes.avatar.sm} />
          <Box flex={1} gap="xs">
            <Text variant="bodyMedium" numberOfLines={1}>
              {title}
            </Text>
            <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
              {t('marketplace.deal.meta', {
                counterpart: counterpart.name ?? '',
                items: t('marketplace.deal.items', { count: deal.itemsCount }),
              })}
            </Text>
          </Box>
          <DealStatusPill status={deal.status} size="sm" />
        </Box>
        {showProgress ? (
          <DealProgress
            status={deal.status.key}
            stage={deal.stage?.key ?? null}
            hasShipping={deal.shipping !== null}
            frozenFrom={deal.dispute?.priorStatus ?? null}
            variant="track"
          />
        ) : null}
        <Box row align="center" justify="space-between" gap="md">
          <MoneyText value={deal.total} />
          <Countdown endsAt={deal.dueAt} size="sm" />
        </Box>
        {heldInEscrow ? (
          <Box row align="center" gap="sm" px="md" py="sm" borderRadius="md" bg={colors.money.soft}>
            <ShieldCheck size={sizes.icon.sm} color={colors.money.main} />
            <MoneyText value={deal.total} size="sm" tone="money" />
            <Text variant="caption" color={colors.money.text} numberOfLines={1}>
              {t('marketplace.deal.escrowHeld')}
            </Text>
          </Box>
        ) : null}
      </Box>
    </Card>
  );
};

export const DealCard = memo(DealCardComponent);
