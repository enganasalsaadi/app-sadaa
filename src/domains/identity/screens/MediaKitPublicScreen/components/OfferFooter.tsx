import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Money } from '@/core/money';
import { useTheme } from '@/core/theme';
import { Box, LayoutFooter, MoneyText, Text } from '@/shared/ui';

interface OfferFooterProps {
  priceFrom: Money | null;
  /** Estimated base price of the picked services; `null` while nothing priced is picked. */
  total: Money | null;
  selectedCount: number;
  isShortlisted: boolean;
  saving: boolean;
  onSave: () => void;
  onOpenShortlist: () => void;
}

/**
 * The brand's bar: "from $X", or the picked services and their estimated total rolling as
 * they change; then the one primary. Direct offers are not live yet, so the action saves
 * the creator to the shortlist (then opens it).
 */
const OfferFooterComponent: React.FC<OfferFooterProps> = ({
  priceFrom,
  total,
  selectedCount,
  isShortlisted,
  saving,
  onSave,
  onOpenShortlist,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const picked = selectedCount > 0 && total !== null;
  const amount = picked ? total : priceFrom;

  return (
    <LayoutFooter
      top={
        amount ? (
          <Box row align="center" justify="space-between" gap="md">
            <Box flex={1} gap="xs">
              <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
                {picked
                  ? t('account.mediaKit.showcase.footer.selected', { count: selectedCount })
                  : t('account.mediaKit.priceFrom')}
              </Text>
              <Text variant="caption" color={colors.text.tertiary} numberOfLines={1}>
                {t('account.mediaKit.showcase.footer.offersSoon')}
              </Text>
            </Box>
            <MoneyText value={amount} size="title" animated estimate={picked} />
          </Box>
        ) : undefined
      }
      primary={
        isShortlisted
          ? { label: t('account.mediaKit.showcase.footer.openShortlist'), onPress: onOpenShortlist }
          : { label: t('account.mediaKit.showcase.footer.save'), onPress: onSave, loading: saving }
      }
    />
  );
};

export const OfferFooter = memo(OfferFooterComponent);
