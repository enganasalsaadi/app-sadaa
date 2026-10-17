import React, { memo } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { BottomSheet, Box, CustomButton, Text } from '@/shared/ui';
import { useOfferBuilder } from '../OfferBuilderContext';
import { SheetTitle } from '../../../components/SheetTitle';

const SHEET_SHARE = 0.85;

/** The contract terms exactly as they lock in on signing (from the quote). */
const ContractSheetComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { height } = useWindowDimensions();
  const { sheet, closeSheet, quote } = useOfferBuilder();
  const items = quote?.contractTerms?.items ?? [];

  return (
    <BottomSheet visible={sheet === 'contract'} onClose={closeSheet} maxHeight={height * SHEET_SHARE}>
      <Box px="xl" pb="2xl" gap="lg">
        <SheetTitle title={t('marketplace.offer.review.contractTitle')} body={t('marketplace.offer.review.contractSub')} />
        {items.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Box gap="md">
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
          </ScrollView>
        ) : (
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.offer.review.contractMissing')}
          </Text>
        )}
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.offer.review.contractFine')}
        </Text>
        <CustomButton title={t('marketplace.offer.review.contractOk')} variant="secondary" fullWidth onPress={closeSheet} />
      </Box>
    </BottomSheet>
  );
};

export const ContractSheet = memo(ContractSheetComponent);
