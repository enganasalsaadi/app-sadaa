import React, { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { BottomSheet, Box, CustomButton, NumberStepper, Text } from '@/shared/ui';
import { DEAL_OFFER_LIMITS } from '../../../constants/dealOffer';
import { formatDays } from '../../../utils/offerDuration';
import { useOfferBuilder } from '../OfferBuilderContext';
import { SheetTitle } from '../../../components/SheetTitle';

/** A deadline longer than the creator's fastest, in whole days (server cap 90). */
const DeliveryDaysSheetComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { sheet, closeSheet, quote, offer, setRequestedDays } = useOfferBuilder();
  const visible = sheet === 'delivery';
  const min = Math.min((quote?.minDeliveryDays ?? 0) + 1, DEAL_OFFER_LIMITS.maxRequestedDeliveryDays);
  const max = DEAL_OFFER_LIMITS.maxRequestedDeliveryDays;
  const [days, setDays] = useState(min);

  // Each opening starts from the current deadline (or the first day past the fastest).
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDays(Math.min(max, Math.max(min, offer.requestedDeliveryDays ?? min)));
  }

  const apply = useCallback(() => {
    setRequestedDays(days);
    closeSheet();
  }, [closeSheet, days, setRequestedDays]);
  const label = useCallback((value: number) => formatDays(t, value), [t]);
  const duration = formatDays(t, days);

  return (
    <BottomSheet visible={visible} onClose={closeSheet}>
      <Box px="xl" pb="2xl" gap="xl">
        <SheetTitle
          title={t('marketplace.offer.delivery.sheetTitle')}
          body={t('marketplace.offer.delivery.sheetBody', {
            fastest: formatDays(t, quote?.minDeliveryDays ?? 1),
            max,
          })}
        />
        <Box align="center" gap="md">
          <NumberStepper
            value={days}
            onChange={setDays}
            min={min}
            max={max}
            formatValue={label}
            accessibilityLabel={t('marketplace.offer.delivery.sheetTitle')}
          />
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('marketplace.offer.delivery.sheetCaption', { duration })}
          </Text>
        </Box>
        <Box gap="sm">
          <CustomButton title={t('marketplace.offer.delivery.apply', { duration })} size="lg" fullWidth onPress={apply} />
          <CustomButton title={t('marketplace.offer.delivery.cancel')} variant="ghost" fullWidth onPress={closeSheet} />
        </Box>
      </Box>
    </BottomSheet>
  );
};

export const DeliveryDaysSheet = memo(DeliveryDaysSheetComponent);
