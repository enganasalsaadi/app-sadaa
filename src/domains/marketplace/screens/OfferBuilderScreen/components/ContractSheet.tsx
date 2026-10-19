import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, SheetFrame, Text } from '@/shared/ui';
import { useOfferBuilder } from '../OfferBuilderContext';

/** The contract terms exactly as they lock in on signing (from the quote). */
const ContractSheetComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { sheet, closeSheet, quote } = useOfferBuilder();
  const items = quote?.contractTerms?.items ?? [];

  return (
    <SheetFrame
      visible={sheet === 'contract'}
      onClose={closeSheet}
      title={t('marketplace.offer.review.contractTitle')}
      body={t('marketplace.offer.review.contractSub')}
      footer={<CustomButton title={t('marketplace.offer.review.contractOk')} variant="secondary" fullWidth onPress={closeSheet} />}
    >
      {items.length > 0 ? (
        <Box gap="md" p="lg" borderRadius="lg" bg={colors.surface.main}>
          {items.map(item => (
            <Box key={item.key} row gap="sm">
              <ShieldCheck size={sizes.icon.sm} color={colors.interactive.main} />
              <Box flex={1}>
                <Text variant="bodySmall" color={colors.text.primary}>
                  {item.text}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Text variant="bodySmall" color={colors.text.secondary}>
          {t('marketplace.offer.review.contractMissing')}
        </Text>
      )}
      <Text variant="caption" color={colors.text.tertiary}>
        {t('marketplace.offer.review.contractFine')}
      </Text>
    </SheetFrame>
  );
};

export const ContractSheet = memo(ContractSheetComponent);
