import React, { memo, useCallback } from 'react';
import { Controller } from 'react-hook-form';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react-native';
import { DEFAULT_PHONE_COUNTRY } from '@/core/config';
import { ChipGroup, CustomButton, CustomInput, FormSection, PhoneInput, SheetFrame } from '@/shared/ui';
import { DEAL_SHIPPING_LIMITS } from '../constants/dealShipping';
import type { DealAddressFormModel } from '../hooks/useDealAddressForm';
import type { DealAddressFormValues } from '../schemas/dealShippingSchema';

const LIMITS = DEAL_SHIPPING_LIMITS.address;
const ignoreCountry = () => undefined;

type TextField = Exclude<keyof DealAddressFormValues, 'phone' | 'governorateId'>;

export interface DealAddressSheetProps {
  visible: boolean;
  onClose: () => void;
  onDismissed?: () => void;
  form: DealAddressFormModel;
  /** `sign`: before accepting (continue to the signature); `edit`: saving a change. */
  purpose: 'sign' | 'edit';
  brandName: string;
  onSubmit: () => void;
  submitting?: boolean;
}

interface TextFieldDef {
  name: TextField;
  label: ParseKeys;
  placeholder: ParseKeys;
  max: number;
  next: keyof DealAddressFormValues | null;
  multiline?: boolean;
}

/** The typed lines in focus order (phone and governorate sit between name and city). */
const FIELDS = {
  recipientName: {
    name: 'recipientName',
    label: 'marketplace.deals.shipping.address.recipient',
    placeholder: 'marketplace.deals.shipping.address.recipientPlaceholder',
    max: LIMITS.recipientName.max,
    next: 'phone',
  },
  city: {
    name: 'city',
    label: 'marketplace.deals.shipping.address.city',
    placeholder: 'marketplace.deals.shipping.address.cityPlaceholder',
    max: LIMITS.city.max,
    next: 'area',
  },
  area: {
    name: 'area',
    label: 'marketplace.deals.shipping.address.area',
    placeholder: 'marketplace.deals.shipping.address.areaPlaceholder',
    max: LIMITS.area.max,
    next: 'addressLine',
  },
  addressLine: {
    name: 'addressLine',
    label: 'marketplace.deals.shipping.address.line',
    placeholder: 'marketplace.deals.shipping.address.linePlaceholder',
    max: LIMITS.addressLine.max,
    next: 'landmark',
    multiline: true,
  },
  landmark: {
    name: 'landmark',
    label: 'marketplace.deals.shipping.address.landmark',
    placeholder: 'marketplace.deals.shipping.address.landmarkPlaceholder',
    max: LIMITS.landmark,
    next: 'notes',
  },
  notes: {
    name: 'notes',
    label: 'marketplace.deals.shipping.address.notes',
    placeholder: 'marketplace.deals.shipping.address.notesPlaceholder',
    max: LIMITS.notes,
    next: null,
    multiline: true,
  },
} as const satisfies Record<TextField, TextFieldDef>;

/** One typed line; Next moves to the field after it. */
const AddressInput = memo<{ form: DealAddressFormModel; def: TextFieldDef }>(({ form, def }) => {
  const { t } = useTranslation();
  const { setFocus } = form;
  const next = def.next;
  const onNext = useCallback(() => {
    if (next) setFocus(next);
  }, [next, setFocus]);
  return (
    <Controller
      control={form.control}
      name={def.name}
      render={({ field: { ref, value, onChange, onBlur }, fieldState }) => (
        <CustomInput
          ref={ref}
          label={t(def.label)}
          placeholder={t(def.placeholder)}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          maxLength={def.max}
          multiline={def.multiline}
          numberOfLines={def.multiline ? 2 : undefined}
          returnKeyType={next ? 'next' : 'done'}
          onSubmitEditing={onNext}
          error={fieldState.error?.message}
        />
      )}
    />
  );
});

/**
 * Where the product goes (B5.1): who receives it, a Syrian mobile the courier calls, the
 * governorate, city, area, the street line, an optional landmark and notes. Before accepting it
 * leads on to the signature; later it saves a change. Seen by the brand only while it ships.
 */
const DealAddressSheetComponent: React.FC<DealAddressSheetProps> = ({
  visible,
  onClose,
  onDismissed,
  form,
  purpose,
  brandName,
  onSubmit,
  submitting = false,
}) => {
  const { t } = useTranslation();
  const { setFocus } = form;
  const focusCity = useCallback(() => setFocus('city'), [setFocus]);
  return (
    <SheetFrame
      visible={visible}
      onClose={onClose}
      onDismissed={onDismissed}
      title={t('marketplace.deals.shipping.address.sheetTitle')}
      body={t('marketplace.deals.shipping.address.sheetBody', { name: brandName })}
      footer={
        <CustomButton
          title={
            purpose === 'sign'
              ? t('marketplace.deals.shipping.address.continue')
              : t('marketplace.deals.shipping.address.save')
          }
          size="lg"
          fullWidth
          leftIcon={<MapPin />}
          loading={submitting}
          onPress={onSubmit}
        />
      }
    >
      <AddressInput form={form} def={FIELDS.recipientName} />
      <Controller
        control={form.control}
        name="phone"
        render={({ field: { ref, value, onChange }, fieldState }) => (
          <PhoneInput
            ref={ref}
            label={t('marketplace.deals.shipping.address.phone')}
            placeholder={t('marketplace.deals.shipping.address.phonePlaceholder')}
            value={value}
            onChangeText={onChange}
            countryCode={DEFAULT_PHONE_COUNTRY}
            onChangeCountry={ignoreCountry}
            countryLocked
            returnKeyType="next"
            onSubmitEditing={focusCity}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={form.control}
        name="governorateId"
        render={({ field: { value, onChange }, fieldState }) => (
          <FormSection
            title={t('marketplace.deals.shipping.address.governorate')}
            error={fieldState.error?.message}
          >
            <ChipGroup
              items={form.governorates.items}
              value={value || null}
              onChange={onChange}
              loading={form.governorates.isLoading}
              skeletonCount={8}
              accessibilityLabel={t('marketplace.deals.shipping.address.governorate')}
            />
          </FormSection>
        )}
      />
      <AddressInput form={form} def={FIELDS.city} />
      <AddressInput form={form} def={FIELDS.area} />
      <AddressInput form={form} def={FIELDS.addressLine} />
      <AddressInput form={form} def={FIELDS.landmark} />
      <AddressInput form={form} def={FIELDS.notes} />
    </SheetFrame>
  );
};

export const DealAddressSheet = memo(DealAddressSheetComponent);
