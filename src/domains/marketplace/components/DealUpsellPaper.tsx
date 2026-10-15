import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '@/core/i18n';
import { Paperclip } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Countdown, CustomButton, MoneyText, Notice, Text } from '@/shared/ui';
import type { DealUpsellsModel } from '../hooks/useDealUpsells';
import type { Deal, DealUpsell } from '../types';
import { formatUpsellLine } from '../utils/dealUpsell';
import { DealHoldToSign } from './DealHoldToSign';

export interface DealUpsellPaperProps {
  deal: Deal;
  upsell: DealUpsell;
  upsells: DealUpsellsModel;
}

/**
 * «الملحق المدبَّس» (approved 2026-10-15): the brand's addendum as a page clipped to the deal. What
 * it adds and the money it brings in mint, the deal's current value beside it (the server sends no
 * new total, so none is computed), its deadline, then press-and-hold to sign or a quiet decline.
 */
const DealUpsellPaperComponent: React.FC<DealUpsellPaperProps> = ({ deal, upsell, upsells }) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const name = deal.brand.name ?? '';
  const line = formatUpsellLine(t, upsell);
  return (
    <Box p="lg" gap="lg" bg={colors.surface.main} borderRadius="xl" shadow="card">
      <Box row gap="md" align="center">
        <Box
          width={sizes.avatar.md}
          height={sizes.avatar.md}
          borderRadius="full"
          align="center"
          justify="center"
          bg={colors.interactive.soft}
        >
          <Paperclip size={sizes.icon.md} color={colors.interactive.main} />
        </Box>
        <Box flex={1}>
          <Text variant="title" color={colors.text.primary}>
            {t('marketplace.deals.changes.upsells.paper.title')}
          </Text>
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.deals.changes.upsells.paper.from', { name })}
          </Text>
        </Box>
      </Box>
      <Box gap="sm">
        <Text variant="bodyMedium" color={colors.text.primary}>
          {line}
        </Text>
        <Box row align="flex-end" justify="space-between" gap="md">
          <MoneyText value={upsell.amount} size="lg" tone="money" showSign />
          <Box align="flex-end" gap="xs">
            <Text variant="caption" color={colors.text.tertiary}>
              {t('marketplace.deals.changes.upsells.paper.total')}
            </Text>
            <MoneyText value={deal.total} size="md" tone="muted" />
          </Box>
        </Box>
      </Box>
      {upsell.dueAt ? (
        <Countdown
          endsAt={upsell.dueAt}
          label={t('marketplace.deals.changes.upsells.paper.expiresIn')}
          size="sm"
        />
      ) : null}
      {upsell.reviewPaused ? (
        <Notice message={t('marketplace.deals.changes.upsells.paper.paused')} />
      ) : null}
      <DealHoldToSign
        label={t('marketplace.deals.changes.upsells.paper.hold')}
        caption={t('marketplace.deals.changes.upsells.paper.holdCaption')}
        hint={t('marketplace.deals.respond.hold.hint')}
        accessibilityLabel={t('marketplace.deals.changes.upsells.paper.a11y', {
          name,
          title: line,
          amount: formatMoney(upsell.amount, i18n.language),
        })}
        accessibilityHint={t('marketplace.deals.respond.hold.a11yHint')}
        onComplete={upsells.onAccept}
        sending={upsells.accepting}
      />
      <CustomButton
        title={t('marketplace.deals.changes.upsells.paper.decline')}
        variant="ghost"
        fullWidth
        onPress={upsells.openDecline}
      />
    </Box>
  );
};

export const DealUpsellPaper = memo(DealUpsellPaperComponent);
