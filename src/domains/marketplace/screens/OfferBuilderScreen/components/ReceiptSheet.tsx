import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoney } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, MoneyText, SheetFrame, Text } from '@/shared/ui';
import { useOfferBuilder } from '../OfferBuilderContext';

/** The quote line by line, as the contract will print it. */
const ReceiptSheetComponent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { sheet, closeSheet, quote } = useOfferBuilder();

  return (
    <SheetFrame
      visible={sheet === 'receipt'}
      onClose={closeSheet}
      title={t('marketplace.offer.receipt.title')}
      body={t('marketplace.offer.receipt.body')}
      footer={<CustomButton title={t('marketplace.offer.receipt.done')} variant="secondary" fullWidth onPress={closeSheet} />}
    >
      {quote ? (
        <Box gap="md" p="lg" borderRadius="lg" bg={colors.surface.main}>
          {quote.lines.map(line => (
            <Box key={line.rateCardId} row justify="space-between" align="flex-start" gap="md">
              <Box flex={1} gap="xs">
                <Text variant="bodyMedium" color={colors.text.primary}>
                  {t('marketplace.offer.review.lineTitle', { count: line.quantity, title: line.title })}
                </Text>
                <Text variant="caption" color={colors.text.tertiary}>
                  {t('marketplace.offer.receipt.unit', { price: formatMoney(line.unitPrice, i18n.language) })}
                </Text>
                {line.addons.map(addon => (
                  <Box key={addon.type} row justify="space-between" gap="sm">
                    <Text variant="caption" color={colors.text.secondary}>
                      {t('marketplace.offer.review.addon', { label: addon.label })}
                    </Text>
                    <MoneyText value={addon.price} size="sm" tone="muted" showSign />
                  </Box>
                ))}
              </Box>
              <MoneyText value={line.total} size="md" />
            </Box>
          ))}
          <Box row justify="space-between" align="center" pt="md" borderTopWidth="hairline" borderColor={colors.border.default}>
            <Text variant="title" color={colors.text.primary}>
              {t('marketplace.offer.receipt.total')}
            </Text>
            <MoneyText value={quote.total} size="title" />
          </Box>
        </Box>
      ) : null}
      <Text variant="caption" color={colors.text.tertiary}>
        {t('marketplace.offer.receipt.fine')}
      </Text>
    </SheetFrame>
  );
};

export const ReceiptSheet = memo(ReceiptSheetComponent);
