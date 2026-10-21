import React, { memo, useCallback, useMemo } from 'react';
import { Controller, useWatch, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Clock, LockOpen, Package } from 'lucide-react-native';
import { formatDate } from '@/core/i18n';
import { iconStroke, resolveHue, useTheme } from '@/core/theme';
import { Box, ChipGroup, CustomButton, CustomInput, FormSection, NumberStepper, Text, SheetFrame } from '@/shared/ui';
import { isolateText } from '@/shared/utils';
import {
  DEAL_RETURN_EARLIER_DAYS,
  DEAL_RETURN_HANDED,
  DEAL_RETURN_HANDED_LABEL,
  type DealReturnHanded,
} from '../constants/dealReturn';
import { DEAL_COURIER_OTHER, DEAL_SHIPPING_LIMITS } from '../constants/dealShipping';
import type { DealReturnModel } from '../hooks/useDealReturn';
import type { DealReturnFormValues } from '../schemas/dealReturnSchema';
import type { Deal } from '../types';

const DUE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };

export interface DealReturnSheetProps {
  deal: Deal;
  ret: DealReturnModel;
}

/** «Other» reveals a field for the courier's name. Watches `courier` alone. */
const CourierOtherField = memo<{ control: Control<DealReturnFormValues>; onNext: () => void }>(({ control, onNext }) => {
  const { t } = useTranslation();
  const courier = useWatch({ control, name: 'courier' });
  if (courier !== DEAL_COURIER_OTHER) return null;
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
});

/** «N days ago» stepper, shown only when the handover wasn't today or yesterday. */
const EarlierField = memo<{ control: Control<DealReturnFormValues> }>(({ control }) => {
  const { t } = useTranslation();
  const handed = useWatch({ control, name: 'handed' });
  if (handed !== 'earlier') return null;
  return (
    <Controller
      control={control}
      name="handedDays"
      render={({ field: { value, onChange } }) => (
        <NumberStepper
          value={value}
          onChange={onChange}
          min={DEAL_RETURN_EARLIER_DAYS.min}
          max={DEAL_RETURN_EARLIER_DAYS.max}
          accessibilityLabel={t('marketplace.deals.return.sheet.handed.label')}
          formatValue={days => t('marketplace.deals.return.sheet.handed.daysAgo', { count: days })}
        />
      )}
    />
  );
});

/**
 * The creator's return waybill (PC9.0 frame 1): the courier by one tap (the same chips as the brand's
 * shipping sheet), the number, an optional https link and when the parcel was handed over. One plain
 * save, because it can be changed until the brand answers; the lock lifts the moment it is in.
 */
const DealReturnSheetComponent: React.FC<DealReturnSheetProps> = ({ deal, ret }) => {
  const { t, i18n } = useTranslation();
  const { colors, sizes } = useTheme();
  const { control, setFocus, view, ship } = ret;
  const editing = ship?.status.key === 'shipped';
  const handedItems = useMemo(
    () => DEAL_RETURN_HANDED.map(value => ({ value, label: t(DEAL_RETURN_HANDED_LABEL[value]) })),
    [t],
  );
  const focusTracking = useCallback(() => setFocus('trackingNo'), [setFocus]);
  const focusUrl = useCallback(() => setFocus('trackingUrl'), [setFocus]);
  const warning = resolveHue(colors, view?.late ? 'danger' : 'warning');
  const success = resolveHue(colors, 'success');

  return (
    <SheetFrame
      visible={ret.visible}
      onClose={ret.close}
      title={t(editing ? 'marketplace.deals.return.sheet.editTitle' : 'marketplace.deals.return.sheet.title')}
      body={t('marketplace.deals.return.sheet.body', { name: isolateText(deal.brand.name ?? '') })}
      footer={
        <CustomButton
          title={t(editing ? 'marketplace.deals.return.sheet.saveEdit' : 'marketplace.deals.return.sheet.save')}
          size="lg"
          fullWidth
          leftIcon={<Package />}
          loading={ret.saving}
          onPress={ret.onSave}
        />
      }
    >
      {ret.due && view?.dueAt ? (
        <Box row align="center" gap="sm" p="md" borderRadius="md" bg={warning.soft} accessible>
          <Clock size={sizes.icon.sm} color={warning.main} strokeWidth={iconStroke.bold} />
          <Box flex={1}>
            <Text variant="bodySmall" color={warning.text}>
              {t(view.late ? 'marketplace.deals.return.sheet.dueLate' : 'marketplace.deals.return.sheet.due', {
                time: ret.due.text,
                date: formatDate(view.dueAt, DUE_FORMAT, i18n.language),
              })}
            </Text>
          </Box>
        </Box>
      ) : null}
      <Controller
        control={control}
        name="courier"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormSection title={t('marketplace.deals.shipping.ship.courier')} error={fieldState.error?.message}>
            <ChipGroup
              items={ret.courierOptions.items}
              value={value}
              onChange={onChange}
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
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="handed"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormSection
            title={t('marketplace.deals.return.sheet.handed.label')}
            tag={t('marketplace.deals.return.sheet.handed.optional')}
            error={fieldState.error?.message}
          >
            <ChipGroup
              items={handedItems}
              value={value}
              onChange={next => onChange(next as DealReturnHanded)}
              accessibilityLabel={t('marketplace.deals.return.sheet.handed.label')}
            />
          </FormSection>
        )}
      />
      <EarlierField control={control} />
      {view?.locksCreator ? (
        <Box row align="flex-start" gap="sm" p="md" borderRadius="md" bg={success.soft}>
          <LockOpen size={sizes.icon.sm} color={success.main} strokeWidth={iconStroke.bold} />
          <Box flex={1}>
            <Text variant="bodySmall" color={success.text}>
              {t('marketplace.deals.return.sheet.unlockHint')}
            </Text>
          </Box>
        </Box>
      ) : null}
    </SheetFrame>
  );
};

export const DealReturnSheet = memo(DealReturnSheetComponent);
