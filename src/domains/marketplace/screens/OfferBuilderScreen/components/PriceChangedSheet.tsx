import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowDown, TrendingUp } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, MoneyText, SheetFrame, Text } from '@/shared/ui';
import { useOfferBuilder } from '../OfferBuilderContext';

/** The rate card moved while the brand built the offer: old total struck through, the new one, choose. */
const PriceChangedSheetComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { priceChange, onPriceAccept, onPriceEdit, quote } = useOfferBuilder();
  const after = priceChange?.after ?? quote?.total ?? null;
  const styles = useStyles(
    ({ radii, spacing }): Record<'compare', ViewStyle> => ({
      compare: {
        alignItems: 'center',
        gap: spacing.xs,
        padding: spacing.xl,
        borderRadius: radii.xl,
        backgroundColor: colors.surface.main,
      },
    }),
    [colors.surface.main],
  );

  return (
    <SheetFrame
      visible={priceChange !== null}
      onClose={onPriceAccept}
      title={t('marketplace.offer.priceChanged.title')}
      body={t('marketplace.offer.priceChanged.body')}
      footer={
        <Box gap="sm">
          <CustomButton title={t('marketplace.offer.priceChanged.apply')} size="lg" fullWidth onPress={onPriceAccept} />
          <CustomButton title={t('marketplace.offer.priceChanged.edit')} variant="ghost" fullWidth onPress={onPriceEdit} />
        </Box>
      }
    >
      <Box style={styles.compare}>
        <TrendingUp size={sizes.icon.sm} color={colors.status.info.main} />
        <Text variant="caption" color={colors.text.tertiary}>
          {t('marketplace.offer.priceChanged.total')}
        </Text>
        {priceChange?.before ? <MoneyText value={priceChange.before} size="md" tone="muted" strikethrough /> : null}
        <ArrowDown size={sizes.icon.xs} color={colors.text.tertiary} />
        {after ? <MoneyText value={after} size="lg" animated /> : null}
      </Box>
    </SheetFrame>
  );
};

export const PriceChangedSheet = memo(PriceChangedSheetComponent);
