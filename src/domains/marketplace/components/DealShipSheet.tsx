import React, { memo, useCallback, useMemo, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import { Controller, useWatch, type Control, type UseFormSetFocus } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Truck } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, ChipGroup, CustomButton, CustomInput, FormSection, Text } from '@/shared/ui';
import { isolateLtr } from '@/shared/utils';
import {
  DEAL_COURIER_PRESETS,
  DEAL_SHIPPING_LIMITS,
  type DealCourierChoice,
} from '../constants/dealShipping';
import type { DealShipFormValues } from '../schemas/dealShippingSchema';
import { courierName } from '../utils/dealShipping';
import { DealSheetFrame } from './DealSheetFrame';
import { DealWaybillBarcode } from './DealWaybillBarcode';

const BARCODE_WIDTH = moderateScale(84);

export type DealShipSheetKind = 'ship' | 'edit' | 'reship';

const COPY = {
  ship: {
    title: 'marketplace.deals.shipping.ship.title',
    body: 'marketplace.deals.shipping.ship.body',
    submit: 'marketplace.deals.shipping.ship.submit',
  },
  edit: {
    title: 'marketplace.deals.shipping.ship.editTitle',
    body: 'marketplace.deals.shipping.ship.editBody',
    submit: 'marketplace.deals.shipping.ship.editSubmit',
  },
  reship: {
    title: 'marketplace.deals.shipping.ship.reshipTitle',
    body: 'marketplace.deals.shipping.ship.body',
    submit: 'marketplace.deals.shipping.ship.reshipSubmit',
  },
} as const;

export interface DealShipSheetProps {
  kind: DealShipSheetKind | null;
  onClose: () => void;
  control: Control<DealShipFormValues>;
  setFocus: UseFormSetFocus<DealShipFormValues>;
  courierLabels: Readonly<Record<DealCourierChoice, string>>;
  /** «Shipment N» on the live label. */
  sequence: number;
  partyName: string;
  onSubmit: () => void;
  submitting: boolean;
}

/** The label filling in as the brand types: courier, number, a barcode drawn from it. */
const LiveLabel = memo<{
  control: Control<DealShipFormValues>;
  labels: Readonly<Record<DealCourierChoice, string>>;
  sequence: number;
}>(({ control, labels, sequence }) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const [courier, typed, trackingNo] = useWatch({
    control,
    name: ['courier', 'courierName', 'trackingNo'],
  });
  const name = courierName({ courier, courierName: typed }, labels);
  const styles = useStyles(
    ({ radii, spacing }): Record<'label' | 'number' | 'code', ViewStyle> => ({
      label: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radii.md,
        backgroundColor: colors.brand.main,
      },
      number: { direction: 'ltr' },
      code: {
        width: BARCODE_WIDTH,
        padding: spacing.xs,
        borderRadius: radii.xs,
        backgroundColor: colors.surface.main,
      },
    }),
    [colors.brand.main, colors.surface.main],
  );
  return (
    <Box style={styles.label} accessible={false} importantForAccessibility="no-hide-descendants">
      <Truck size={sizes.icon.md} color={colors.text.onBrand} />
      <Box flex={1} gap="xs">
        <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
          {[
            name || t('marketplace.deals.shipping.ship.courierPending'),
            t('marketplace.deals.shipping.waybill.sequence', {
              number: formatNumber(sequence, {}, i18n.language),
            }),
          ].join(' · ')}
        </Text>
        <Text variant="title" color={colors.text.onBrand} numberOfLines={1} style={styles.number}>
          {trackingNo.trim()
            ? isolateLtr(trackingNo.trim())
            : t('marketplace.deals.shipping.ship.numberPending')}
        </Text>
      </Box>
      {trackingNo.trim() ? (
        <Box style={styles.code}>
          <DealWaybillBarcode value={trackingNo} />
        </Box>
      ) : null}
    </Box>
  );
});

/** «Other» reveals a field for the courier's name. Watches `courier` alone. */
const CourierOtherField = memo<{ control: Control<DealShipFormValues>; onNext: () => void }>(
  ({ control, onNext }) => {
    const { t } = useTranslation();
    const courier = useWatch({ control, name: 'courier' });
    if (courier !== 'other') return null;
    return (
      <Controller
        control={control}
        name="courierName"
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
            onSubmitEditing={onNext}
            error={fieldState.error?.message}
          />
        )}
      />
    );
  },
);

/**
 * The waybill sheet (M5): pick or type the courier, the tracking number, an optional https
 * tracking link. One sheet for a first shipment, an edit (until receipt or a report) and a
 * re-ship after a report. The label at the top fills in as the brand types.
 */
const DealShipSheetComponent: React.FC<DealShipSheetProps> = ({
  kind,
  onClose,
  control,
  setFocus,
  courierLabels,
  sequence,
  partyName,
  onSubmit,
  submitting,
}) => {
  const { t } = useTranslation();
  // Keep the copy while the sheet slides away after `kind` drops to null.
  const shown = useRef<DealShipSheetKind>(kind ?? 'ship');
  if (kind) shown.current = kind;
  const copy = COPY[shown.current];
  const items = useMemo(
    () =>
      [...DEAL_COURIER_PRESETS, 'other' as const].map(choice => ({
        value: choice,
        label: courierLabels[choice],
      })),
    [courierLabels],
  );
  const focusTracking = useCallback(() => setFocus('trackingNo'), [setFocus]);
  const focusUrl = useCallback(() => setFocus('trackingUrl'), [setFocus]);

  return (
    <DealSheetFrame
      visible={kind !== null}
      onClose={onClose}
      title={t(copy.title)}
      body={t(copy.body, { name: partyName })}
      footer={
        <CustomButton
          title={t(copy.submit)}
          size="lg"
          fullWidth
          leftIcon={<Truck />}
          loading={submitting}
          onPress={onSubmit}
        />
      }
    >
      <LiveLabel control={control} labels={courierLabels} sequence={sequence} />
      <Controller
        control={control}
        name="courier"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormSection
            title={t('marketplace.deals.shipping.ship.courier')}
            error={fieldState.error?.message}
          >
            <ChipGroup
              items={items}
              value={value}
              onChange={next => onChange(next as DealCourierChoice)}
              accessibilityLabel={t('marketplace.deals.shipping.ship.courier')}
            />
          </FormSection>
        )}
      />
      <CourierOtherField control={control} onNext={focusTracking} />
      <Controller
        control={control}
        name="trackingNo"
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
            onSubmitEditing={focusUrl}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="trackingUrl"
        render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
          <CustomInput
            ref={ref}
            label={t('marketplace.deals.shipping.ship.trackingUrl')}
            placeholder={t('marketplace.deals.shipping.ship.trackingUrlPlaceholder')}
            hint={t('marketplace.deals.shipping.ship.trackingUrlHint')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="URL"
            maxLength={DEAL_SHIPPING_LIMITS.trackingUrl}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            error={fieldState.error?.message}
          />
        )}
      />
    </DealSheetFrame>
  );
};

export const DealShipSheet = memo(DealShipSheetComponent);
