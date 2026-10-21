import React, { memo } from 'react';
import { Controller, useWatch, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, ChipGroup, CustomInput, Text } from '@/shared/ui';
import type { ChipGroupItem } from '@/shared/ui';
import { DEAL_COURIER_OTHER, DEAL_SHIPPING_LIMITS } from '../../../constants/dealShipping';
import type { CampaignShippingFormValues } from '../../../utils/campaignShipping';

export interface ParcelFormProps {
  dealId: string;
  control: Control<CampaignShippingFormValues>;
  courierItems: readonly ChipGroupItem[];
}

/** «Other» reveals a field for the courier's name. Watches this parcel's courier alone. */
const OtherCourierField = memo<Pick<ParcelFormProps, 'dealId' | 'control'>>(({ dealId, control }) => {
  const { t } = useTranslation();
  const courier = useWatch({ control, name: `rows.${dealId}.courier` });
  if (courier !== DEAL_COURIER_OTHER) return null;
  return (
    <Controller
      control={control}
      name={`rows.${dealId}.courierName`}
      render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
        <CustomInput
          ref={ref}
          label={t('marketplace.deals.shipping.ship.courierName')}
          placeholder={t('marketplace.deals.shipping.ship.courierNamePlaceholder')}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          maxLength={DEAL_SHIPPING_LIMITS.courier}
          returnKeyType="next"
          error={fieldState.error?.message}
        />
      )}
    />
  );
});

/**
 * One parcel's waybill, opened when it is ticked: courier chips, the tracking number, an optional
 * https link. The same fields and limits as shipping a single deal. Server field errors never come
 * back per row (the report carries one message), so only the schema's errors show here.
 */
const ParcelFormComponent: React.FC<ParcelFormProps> = ({ dealId, control, courierItems }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box gap="md" px="md" pb="md">
      <Controller
        control={control}
        name={`rows.${dealId}.courier`}
        render={({ field: { value, onChange }, fieldState }) => (
          <Box gap="xs">
            <ChipGroup
              items={courierItems}
              value={value}
              onChange={onChange}
              accessibilityLabel={t('marketplace.deals.shipping.ship.courier')}
            />
            {fieldState.error?.message ? (
              <Text variant="caption" color={colors.status.danger.text}>
                {fieldState.error.message}
              </Text>
            ) : null}
          </Box>
        )}
      />
      <OtherCourierField dealId={dealId} control={control} />
      <Controller
        control={control}
        name={`rows.${dealId}.trackingNo`}
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.deals.shipping.ship.trackingNo')}
            placeholder={t('marketplace.deals.shipping.ship.trackingNoPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={DEAL_SHIPPING_LIMITS.trackingNo}
            returnKeyType="next"
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name={`rows.${dealId}.trackingUrl`}
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.deals.shipping.ship.trackingUrl')}
            placeholder={t('marketplace.deals.shipping.ship.trackingUrlPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="URL"
            maxLength={DEAL_SHIPPING_LIMITS.trackingUrl}
            returnKeyType="done"
            error={fieldState.error?.message}
          />
        )}
      />
    </Box>
  );
};

export const ParcelForm = memo(ParcelFormComponent);
