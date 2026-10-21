import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Wallet } from 'lucide-react-native';
import { applyServerFieldErrors, normalizeApiError, useLookupItems } from '@/core/api';
import { useDiscardGuard } from '@/core/hooks';
import { DEFAULT_PHONE_COUNTRY } from '@/core/config';
import { nationalMobileExample, type MobileRule } from '@/core/market';
import type { WalletStackScreenProps } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { useGetProfileQuery } from '@/domains/auth';
import {
  useCreatePayoutMethodMutation,
  useDeletePayoutMethodMutation,
  useSetDefaultPayoutMethodMutation,
  useUpdatePayoutMethodMutation,
} from '../../../api/payoutMethodApi';
import { PAYOUT_GROUP_DEF, PAYOUT_SERVER_FIELDS, type PayoutField } from '../../../constants/payoutMethods';
import { usePaymentChannels } from '../../../hooks/usePaymentChannels';
import { usePayoutMethods } from '../../../hooks/usePayoutMethods';
import { createPayoutMethodSchema, type PayoutMethodFormValues } from '../../../schemas/payoutMethodSchema';
import type { PaymentChannel, PayoutMethod } from '../../../types';
import { nextPrimaryAfterDelete } from '../../../utils/payoutMethodMappers';
import {
  emptyPayoutMethodForm,
  inferPayoutGroup,
  payoutFields,
  type PayoutChannelRef,
  toPayoutDetails,
  toPayoutMethodForm,
  toPayoutMethodPatch,
} from '../../../utils/payoutMethodForm';

type Navigation = WalletStackScreenProps<'PayoutMethodForm'>['navigation'];
type Route = WalletStackScreenProps<'PayoutMethodForm'>['route'];

/** Fields typed with the keyboard, in focus order (the governorate is a chip pick). */
export type PayoutTextField = Exclude<PayoutField, 'governorate'> | 'label';

const NOT_FOUND = 404;

/** Placeholders for the form's first render, before the market loads (the screen shows a skeleton then). */
const NO_CHANNEL: PayoutChannelRef = { code: '', group: 'e_wallet' };
const FALLBACK_MOBILE: MobileRule = { countryCode: DEFAULT_PHONE_COUNTRY, mobilePattern: '', mobileExample: '' };

/** Taken when the sheet opens: the list loses the method as soon as the delete starts. */
interface DeleteTarget {
  method: PayoutMethod;
  title: string;
  /** Who the server will promote when the primary goes (handoff §7). */
  nextPrimaryTitle: string | null;
  /** The only method: no withdrawals until another is added. */
  isLast: boolean;
}

/**
 * Add (`{ channel }`) or edit (`{ id }`) one payout method. The channel is fixed once saved;
 * the primary switch calls its own endpoint after the save, and delete asks first (handoff §7).
 */
export const usePayoutMethodFormScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<Route>();
  const editId = 'id' in params ? params.id : null;
  const isEdit = editId !== null;
  const [pickedChannel, setPickedChannel] = useState<PaymentChannel | null>(() =>
    'channel' in params ? params.channel : null,
  );
  const { find, market, isLoading: isMarketLoading, isError: isMarketError, refetch: refetchMarket } = usePaymentChannels();

  const list = usePayoutMethods();
  const { methods, views } = list;
  const method = editId ? methods?.find(entry => entry.id === editId) ?? null : null;
  // Kept while deleting: the optimistic removal must not flash "not found" under the sheet.
  const [deleting, setDeleting] = useState<DeleteTarget | null>(null);
  const current = method ?? deleting?.method ?? null;
  // A saved method keeps working after its channel leaves the catalog: the kind of details is read off them.
  const channel = useMemo<PayoutChannelRef | null>(() => {
    if (current) {
      return { code: current.channel, group: find(current.channel)?.group ?? inferPayoutGroup(current.details) };
    }
    const picked = isEdit ? null : find(pickedChannel);
    return picked?.supportsPayout ? { code: picked.code, group: picked.group } : null;
  }, [current, find, isEdit, pickedChannel]);

  const { data: user } = useGetProfileQuery();
  const governorates = useLookupItems('governorates');
  const [createMethod, { isLoading: isCreating }] = useCreatePayoutMethodMutation();
  const [updateMethod, { isLoading: isUpdating }] = useUpdatePayoutMethodMutation();
  const [setDefault, { isLoading: isSettingDefault }] = useSetDefaultPayoutMethodMutation();
  const [deleteMethod, { isLoading: isDeleting }] = useDeletePayoutMethodMutation();
  const isSaving = isCreating || isUpdating || isSettingDefault;
  const [done, setDone] = useState(false);
  const [channelSheetVisible, setChannelSheetVisible] = useState(false);

  // Unknown channel only on a broken link; the not-found state covers it, the schema needs one.
  const schema = useMemo(
    () => createPayoutMethodSchema(t, channel ?? NO_CHANNEL, market ?? null),
    [channel, market, t],
  );
  const { control, handleSubmit, reset, setError, setFocus, setValue, clearErrors, formState } =
    useForm<PayoutMethodFormValues>({
      mode: 'onTouched',
      resolver: yupResolver(schema),
      defaultValues: emptyPayoutMethodForm(false, market ?? FALLBACK_MOBILE),
    });
  const { isDirty } = formState;

  const isFirst = !isEdit && methods?.length === 0;

  // Prefill once the list is known: the saved method, or the account's name and phone.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current || !methods || !market) return;
    if (isEdit) {
      if (!method) return;
      prefilled.current = true;
      reset(toPayoutMethodForm(method, market));
      return;
    }
    prefilled.current = true;
    reset(emptyPayoutMethodForm(methods.length === 0, market, { holderName: user?.full_name, phone: user?.phone }));
  }, [isEdit, market, method, methods, reset, user?.full_name, user?.phone]);

  const guard = useDiscardGuard(isDirty && !done);
  useEffect(() => {
    if (done) navigation.goBack();
  }, [done, navigation]);

  // ─── Channel ───────────────────────────────────────────────────────────
  const fields = useMemo(() => (channel ? payoutFields(channel) : []), [channel]);
  const textFields = useMemo<PayoutTextField[]>(
    () => [...fields.filter((field): field is Exclude<PayoutField, 'governorate'> => field !== 'governorate'), 'label'],
    [fields],
  );
  const focusNext = useCallback(
    (field: PayoutTextField) => {
      const next = textFields[textFields.indexOf(field) + 1];
      if (next) setFocus(next);
    },
    [setFocus, textFields],
  );

  const openChannelSheet = useCallback(() => setChannelSheetVisible(true), []);
  const closeChannelSheet = useCallback(() => setChannelSheetVisible(false), []);
  // Shared fields (name, phone) carry over; the other channel's errors don't.
  const onPickChannel = useCallback(
    (next: PaymentChannel) => {
      setPickedChannel(next);
      navigation.setParams({ channel: next });
      clearErrors();
    },
    [clearErrors, navigation],
  );

  // ─── Primary switch ────────────────────────────────────────────────────
  const makeDefault = useWatch({ control, name: 'makeDefault' });
  const primaryView = views.find(view => view.isDefault && view.id !== current?.id) ?? null;
  const primaryLocked = isFirst || !!current?.is_default;
  const primaryCaption = isFirst
    ? t('finance.payouts.form.primaryFirst')
    : current?.is_default
      ? t('finance.payouts.form.primaryCurrent')
      : primaryView
        ? t('finance.payouts.form.primaryNow', { name: primaryView.title })
        : t('finance.payouts.form.primaryHint');
  const onToggleDefault = useCallback(
    (next: boolean) => setValue('makeDefault', next, { shouldDirty: true }),
    [setValue],
  );

  // ─── Save ──────────────────────────────────────────────────────────────
  const { refetch } = list;
  const reportFailure = useCallback(
    (err: unknown) => {
      const apiError = normalizeApiError(err);
      // Limit or a method deleted elsewhere: the list is stale, so back to a fresh one.
      if (apiError.code === 'payout_method_limit' || apiError.statusCode === NOT_FOUND) {
        if (apiError.statusCode === NOT_FOUND) toastService.error(t('finance.payouts.form.gone'));
        refetch();
        setDone(true);
        return;
      }
      applyServerFieldErrors(err, PAYOUT_SERVER_FIELDS, setError);
      // 422 is toasted by baseQuery, 403/5xx open the global modals.
      if (apiError.statusCode !== 422 && !apiError.isForbidden && !apiError.isServerError) {
        toastService.error(t('errors.generic'));
      }
    },
    [refetch, setError, t],
  );

  /** The method is saved either way; a failed primary switch is only a warning. */
  const makePrimary = useCallback(
    async (id: string) => {
      try {
        await setDefault(id).unwrap();
      } catch {
        toastService.warning(t('finance.payouts.form.primaryFailed'));
      }
    },
    [setDefault, t],
  );

  const onSave = useCallback(() => {
    handleSubmit(async values => {
      if (!channel || isSaving) return;
      try {
        if (current) {
          const patch = toPayoutMethodPatch(values, current, channel, market ?? null);
          const promote = values.makeDefault && !current.is_default;
          if (Object.keys(patch).length === 0 && !promote) {
            setDone(true);
            return;
          }
          if (Object.keys(patch).length > 0) await updateMethod({ id: current.id, patch }).unwrap();
          if (promote) await makePrimary(current.id);
        } else {
          const label = values.label.trim();
          const created = await createMethod({
            channel: channel.code,
            ...(label ? { label } : {}),
            details: toPayoutDetails(values, channel, market ?? null),
          }).unwrap();
          if (values.makeDefault && created && !created.is_default) await makePrimary(created.id);
        }
        toastService.success(t('finance.payouts.form.saved'));
        setDone(true);
      } catch (err) {
        reportFailure(err);
      }
    })();
  }, [channel, createMethod, current, handleSubmit, isSaving, makePrimary, market, reportFailure, t, updateMethod]);

  // ─── Delete ────────────────────────────────────────────────────────────
  const openDelete = useCallback(() => {
    if (!method || !methods) return;
    const titleOf = (id: string) => views.find(view => view.id === id)?.title ?? null;
    const next = nextPrimaryAfterDelete(methods, method.id);
    setDeleting({
      method,
      title: titleOf(method.id) ?? '',
      nextPrimaryTitle: next ? titleOf(next.id) : null,
      isLast: methods.length === 1,
    });
  }, [method, methods, views]);
  const closeDelete = useCallback(() => {
    if (!isDeleting) setDeleting(null);
  }, [isDeleting]);

  const onConfirmDelete = useCallback(async () => {
    if (!deleting) return;
    try {
      await deleteMethod(deleting.method.id).unwrap();
    } catch (err) {
      if (normalizeApiError(err).statusCode !== NOT_FOUND) {
        setDeleting(null);
        reportFailure(err);
        return;
      }
      // Already gone elsewhere: same outcome for the creator.
      refetch();
    }
    toastService.success(t('finance.payouts.form.deleted'));
    setDone(true);
  }, [deleteMethod, deleting, refetch, reportFailure, t]);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const retry = useCallback(() => {
    refetch();
    refetchMarket();
  }, [refetch, refetchMarket]);

  const info = channel ? find(channel.code) : null;
  const groupDef = channel ? PAYOUT_GROUP_DEF[channel.group] : null;

  return {
    isEdit,
    control,
    isLoading: list.isLoading || isMarketLoading,
    isError: list.isError || isMarketError,
    error: list.error,
    isRetrying: list.isFetching,
    retry,
    /** A deleted method, or a link with an unknown channel. */
    isNotFound: !list.isLoading && !list.isError && !done && (isEdit ? !!methods && !current : !channel),
    goBack,
    channel: channel
      ? {
          icon: info?.icon ?? Wallet,
          name: views.find(view => view.id === current?.id)?.channelName ?? info?.name ?? channel.code,
          currencies: current?.currencies.length ? current.currencies : (info?.currencies ?? []),
          canChange: !isEdit,
          value: channel.code,
        }
      : null,
    /** The market's mobile rule: the locked country of the phone field and its placeholder. */
    mobile: {
      countryCode: (market ?? FALLBACK_MOBILE).countryCode,
      placeholder: nationalMobileExample(market ?? null),
    },
    channelSheet: {
      visible: channelSheetVisible,
      onOpen: openChannelSheet,
      onClose: closeChannelSheet,
      onPick: onPickChannel,
    },
    fields,
    sectionTitle: groupDef ? t(groupDef.sectionKey) : '',
    holderHint: groupDef ? t(groupDef.holderHintKey) : undefined,
    governorates,
    focusNext,
    primary: {
      value: makeDefault,
      locked: primaryLocked,
      caption: primaryCaption,
      onToggle: onToggleDefault,
    },
    onSave,
    isSaving,
    deleteSheet: {
      visible: deleting !== null,
      onOpen: openDelete,
      onClose: closeDelete,
      onConfirm: onConfirmDelete,
      loading: isDeleting,
      title: deleting?.title ?? '',
      nextPrimaryTitle: deleting?.nextPrimaryTitle ?? null,
      isLast: deleting?.isLast ?? false,
    },
    guard,
  };
};

export type PayoutMethodFormScreenModel = ReturnType<typeof usePayoutMethodFormScreen>;
