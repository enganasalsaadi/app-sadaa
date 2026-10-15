import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, CustomButton, MoneyText, Notice, Skeleton, Text } from '@/shared/ui';
import { DealHoldToSign } from '../../../components/DealHoldToSign';
import type { DealUpsellBuilderModel } from '../hooks/useDealUpsellBuilderScreen';

const DOCK_SKELETON = moderateScale(56);

export interface UpsellDockProps {
  vm: DealUpsellBuilderModel;
}

/**
 * The builder's pinned bar: the deal's value before → after (the server's quote), whether the
 * wallet covers it, then hold to send. A short wallet turns the action into a top-up of exactly
 * the gap; nothing is charged until the creator signs.
 */
const UpsellDockComponent: React.FC<UpsellDockProps> = ({ vm }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { quote, creatorName } = vm;
  const holdLabel = t('marketplace.deals.upsellBuilder.hold');

  let body: React.ReactNode;
  if (!vm.request) {
    body = (
      <Text variant="bodySmall" color={colors.text.secondary} align="center">
        {t('marketplace.deals.upsellBuilder.pickHint')}
      </Text>
    );
  } else if (!quote) {
    body = vm.quoteError ? (
      <Notice tone="danger" message={vm.quoteError.message || t('marketplace.deals.upsellBuilder.quoteFailed')} />
    ) : (
      <Skeleton width="100%" height={DOCK_SKELETON} borderRadius="full" />
    );
  } else {
    body = (
      <>
        <Box row align="center" justify="space-between" gap="md">
          <Text variant="caption" color={colors.text.secondary}>
            {t('marketplace.deals.upsellBuilder.total')}
          </Text>
          <Box row align="center" gap="sm">
            <MoneyText value={quote.total.from} size="sm" tone="muted" strikethrough />
            <MoneyText value={quote.total.to} size="title" />
          </Box>
        </Box>
        {vm.shortfall ? (
          <Text variant="caption" color={colors.status.warning.text}>
            {t('marketplace.deals.upsellBuilder.walletShort', { amount: formatMoney(vm.shortfall, i18n.language) })}
          </Text>
        ) : (
          <Text variant="caption" color={colors.money.text}>
            {t('marketplace.deals.upsellBuilder.walletOk', { name: creatorName })}
          </Text>
        )}
        {vm.shortfall ? (
          vm.canTopUp ? (
            <CustomButton
              title={t('marketplace.deals.upsellBuilder.topUp', { amount: formatMoney(vm.shortfall, i18n.language) })}
              size="lg"
              fullWidth
              onPress={vm.onTopUp}
            />
          ) : null
        ) : vm.isPricing ? (
          <CustomButton title={holdLabel} size="lg" fullWidth loading />
        ) : (
          <DealHoldToSign
            label={holdLabel}
            caption={t('marketplace.deals.upsellBuilder.holdCaption', { name: creatorName })}
            hint={t('marketplace.deals.respond.hold.hint')}
            accessibilityLabel={holdLabel}
            accessibilityHint={t('marketplace.deals.respond.hold.a11yHint')}
            onComplete={vm.onSend}
            sending={vm.sending}
          />
        )}
      </>
    );
  }

  return (
    <Box px="xl" pt="md" pb="md" gap="md">
      {body}
    </Box>
  );
};

export const UpsellDock = memo(UpsellDockComponent);
