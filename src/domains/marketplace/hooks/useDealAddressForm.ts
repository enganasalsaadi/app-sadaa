import { useCallback, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { applyServerFieldErrors, useLookupItems } from '@/core/api';
import { DEFAULT_PHONE_COUNTRY } from '@/core/config';
import { nationalMobileExample, useActiveMarket, type MobileRule } from '@/core/market';
import { useAppSelector } from '@/core/store';
import { selectUser } from '@/domains/auth';
import { useLazyGetShippingAddressPrefillQuery } from '../api/dealShippingApi';
import {
  createDealAddressSchema,
  type DealAddressFormValues,
} from '../schemas/dealShippingSchema';
import type { DealShippingAddress } from '../types';
import { addressFieldMap, addressFormValues, toAddressBody } from '../utils/dealShipping';

const EMPTY = addressFormValues(null, {});

/**
 * The delivery address form (B5.1), shared by signing (accept / extension) and the later edit.
 * `start(address)` fills it from the deal's address; `startFromLast()` from the creator's last
 * used one, else their account name and phone, and only once so a return trip keeps the edits.
 */
export const useDealAddressForm = () => {
  const { t } = useTranslation();
  const user = useAppSelector(selectUser);
  const { market } = useActiveMarket();
  // Until the market loads the pattern is empty (matches any): the number must still parse, the server decides the rest.
  const mobile = useMemo<MobileRule>(
    () => market ?? { countryCode: DEFAULT_PHONE_COUNTRY, mobilePattern: '', mobileExample: '' },
    [market],
  );
  const schema = useMemo(() => createDealAddressSchema(t, mobile), [mobile, t]);
  const form = useForm<DealAddressFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: EMPTY,
  });
  const governorates = useLookupItems('governorates');
  const [loadLast, last] = useLazyGetShippingAddressPrefillQuery();
  const filled = useRef(false);

  const { reset, setError, getValues, handleSubmit } = form;
  const fallback = useMemo(
    () => ({ name: user?.full_name ?? null, phone: user?.phone ?? null }),
    [user?.full_name, user?.phone],
  );

  const start = useCallback(
    (address: DealShippingAddress | null) => {
      filled.current = true;
      reset(addressFormValues(address, fallback));
    },
    [fallback, reset],
  );

  const startFromLast = useCallback(async () => {
    if (filled.current) return;
    filled.current = true;
    const initial = addressFormValues(null, fallback);
    reset(initial);
    try {
      const previous = await loadLast(undefined, true).unwrap();
      // Typing may have started while it loaded; the last address never overwrites it.
      const untouched = (Object.keys(initial) as (keyof DealAddressFormValues)[]).every(
        key => getValues(key) === initial[key],
      );
      if (previous && untouched) reset(addressFormValues(previous, fallback));
    } catch {
      // No prefill is fine: the account's name and phone stay.
    }
  }, [fallback, getValues, loadLast, reset]);

  /** Server 422 keys onto the fields; `prefix` = `shipping_address.` on accept / extension. */
  const applyErrors = useCallback(
    (error: unknown, prefix?: string) =>
      applyServerFieldErrors(error, addressFieldMap(prefix), setError),
    [setError],
  );

  const toBody = useCallback(() => toAddressBody(getValues(), mobile), [getValues, mobile]);

  /** The governorate's name in the app language, for the summaries. */
  const governorateLabel = useCallback(
    (id: string) => governorates.items.find(item => item.value === id)?.label ?? '',
    [governorates.items],
  );

  return {
    control: form.control,
    setFocus: form.setFocus,
    handleSubmit,
    start,
    startFromLast,
    applyErrors,
    toBody,
    governorates,
    governorateLabel,
    phonePlaceholder: nationalMobileExample(market ?? null),
    isLoadingLast: last.isFetching,
  };
};

export type DealAddressFormModel = ReturnType<typeof useDealAddressForm>;
