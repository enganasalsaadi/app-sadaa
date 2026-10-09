import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { useDiscardGuard } from '@/core/hooks';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { applyServerFieldErrors, normalizeApiError } from '@/core/api';
import type { SettingsStackParamList } from '@/core/navigation';
import { toastService } from '@/core/toast';
import {
  DEFAULT_RATE_PRICE_BOUNDS,
  findCatalogService,
  isRushAllowed,
  toRatePriceBounds,
} from '@/domains/auth';
import {
  useCreateRateCardMutation,
  useDeleteRateCardMutation,
  useUpdateRateCardMutation,
} from '../../../api/rateCardsApi';
import { RATE_CARD_SERVER_FIELDS, RUSH_ADDON } from '../../../constants/rateCards';
import { useRateCardSources } from '../../../hooks/useRateCardSources';
import { createRateCardSchema, type RateCardFormValues } from '../../../schemas/rateCardSchema';
import {
  emptyRateCardForm,
  findRushAddon,
  groupToPlatform,
  hasFreeSlot,
  platformToGroup,
  serviceDefaults,
  takenPackageKeys,
  toRateCardForm,
  toRateCardInput,
  toRateCardPatch,
} from '../../../utils/rateCardForm';

type Navigation = NativeStackNavigationProp<SettingsStackParamList, 'RateCardEditor'>;
type Route = RouteProp<SettingsStackParamList, 'RateCardEditor'>;

interface ChipItem {
  value: string;
  label: string;
}

export const useRateCardEditorScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const params = useRoute<Route>().params;
  const cardId = params?.cardId ?? null;
  const isEdit = cardId !== null;

  const sources = useRateCardSources();
  const { catalog, cards, groups } = sources;
  const card = cardId ? cards?.find(entry => entry.id === cardId) ?? null : null;

  const [createRateCard, { isLoading: isCreating }] = useCreateRateCardMutation();
  const [updateRateCard, { isLoading: isUpdating }] = useUpdateRateCardMutation();
  const [deleteRateCard, { isLoading: isDeleting }] = useDeleteRateCardMutation();
  const [done, setDone] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const rush = useMemo(() => (catalog ? findRushAddon(catalog) : null), [catalog]);
  const bounds = useMemo(
    () => (catalog ? toRatePriceBounds(catalog.price_bounds) : DEFAULT_RATE_PRICE_BOUNDS),
    [catalog],
  );
  const rushBounds = useMemo(
    () => (rush ? toRatePriceBounds({ min_usd: rush.min, max_usd: rush.max }) : DEFAULT_RATE_PRICE_BOUNDS),
    [rush],
  );

  // The rules follow the picked service, so the schema is built per validation.
  const resolver = useCallback<Resolver<RateCardFormValues>>(
    (values, context, options) => {
      const service =
        catalog && values.group && values.service
          ? findCatalogService(catalog, groupToPlatform(values.group), values.service)
          : null;
      return yupResolver(createRateCardSchema(t, { service, bounds, rushBounds }))(values, context, options);
    },
    [bounds, catalog, rushBounds, t],
  );

  const { control, handleSubmit, reset, setError, setValue, getValues, formState } =
    useForm<RateCardFormValues>({
      mode: 'onTouched',
      resolver,
      defaultValues: emptyRateCardForm(params?.group ?? null),
    });
  const { isDirty } = formState;

  // Edit: prefill once the card is known; a refetch never wipes edits in progress.
  const prefilled = useRef(false);
  useEffect(() => {
    if (!card || prefilled.current) return;
    prefilled.current = true;
    reset(toRateCardForm(card));
  }, [card, reset]);

  const guard = useDiscardGuard(isDirty && !done);
  useEffect(() => {
    if (done) navigation.goBack();
  }, [done, navigation]);

  const [group, serviceKey, deliveryDays, rushEnabled] = useWatch({
    control,
    name: ['group', 'service', 'deliveryDays', 'rushEnabled'],
  });
  const platform = group ? groupToPlatform(group) : null;
  const service = useMemo(
    () => (catalog && group && serviceKey ? findCatalogService(catalog, platform, serviceKey) : null),
    [catalog, group, platform, serviceKey],
  );

  /** Package keys priced by other cards of this service. */
  const taken = useMemo(
    () => (cards && serviceKey ? takenPackageKeys(cards, platform, serviceKey, cardId) : new Set<string>()),
    [cardId, cards, platform, serviceKey],
  );

  // ─── Pickers (create only) ─────────────────────────────────────────────
  const groupItems = useMemo<ChipItem[]>(
    () =>
      cards
        ? groups
            .filter(entry =>
              entry.services.some(item =>
                hasFreeSlot(item, takenPackageKeys(cards, entry.platform, item.key)),
              ),
            )
            .map(entry => ({
              value: platformToGroup(entry.platform),
              label: entry.label ?? t('account.rates.inPerson'),
            }))
        : [],
    [cards, groups, t],
  );

  const groupServices = useMemo(
    () => groups.find(entry => group && platformToGroup(entry.platform) === group)?.services ?? [],
    [group, groups],
  );
  const serviceItems = useMemo<ChipItem[]>(
    () =>
      cards
        ? groupServices
            .filter(item => hasFreeSlot(item, takenPackageKeys(cards, platform, item.key)))
            .map(item => ({ value: item.key, label: item.label }))
        : [],
    [cards, groupServices, platform],
  );

  /** `auto`: picked for the user (single free service), so leaving needs no confirmation. */
  const applyService = useCallback(
    (key: string | null, auto = false) => {
      const next = key ? groupServices.find(item => item.key === key) ?? null : null;
      const opts = { shouldDirty: !auto };
      setValue('service', next?.key ?? null, { ...opts, shouldValidate: !!next && !auto });
      if (!next || !cards) return;
      const defaults = serviceDefaults(next, takenPackageKeys(cards, platform, next.key));
      setValue('packageValue', defaults.packageValue, opts);
      setValue('deliveryDays', defaults.deliveryDays, opts);
      setValue('revisions', defaults.revisions, opts);
      setValue('retention', defaults.retention, opts);
      setValue('rushEnabled', false, opts);
      setValue('rushHours', null, opts);
      setValue('rushPrice', null, opts);
    },
    [cards, groupServices, platform, setValue],
  );

  const onPickGroup = useCallback(
    (value: string) => setValue('group', value, { shouldDirty: true, shouldValidate: true }),
    [setValue],
  );
  const onPickService = useCallback((value: string) => applyService(value), [applyService]);

  // A new group invalidates the service; a group with one free service picks it.
  const lastGroup = useRef(group);
  useEffect(() => {
    if (isEdit || lastGroup.current === group) return;
    lastGroup.current = group;
    applyService(serviceItems.length === 1 ? serviceItems[0]?.value ?? null : null);
  }, [applyService, group, isEdit, serviceItems]);

  // Opened from a group's "Add" with a single free service: preselect it once.
  const autoPicked = useRef(false);
  useEffect(() => {
    if (isEdit || autoPicked.current || !group || getValues('service') || serviceItems.length !== 1) return;
    autoPicked.current = true;
    applyService(serviceItems[0]?.value ?? null, true);
  }, [applyService, getValues, group, isEdit, serviceItems]);

  // ─── Fields of the picked service ──────────────────────────────────────
  const packageItems = useMemo<ChipItem[]>(
    () =>
      service?.package?.options
        .filter(option => !taken.has(String(option.value)))
        .map(option => ({ value: String(option.value), label: option.label })) ?? [],
    [service, taken],
  );
  const revisionItems = useMemo<ChipItem[]>(
    () => service?.criteria.revisions.options.map(o => ({ value: String(o.value), label: o.label })) ?? [],
    [service],
  );
  const retentionItems = useMemo<ChipItem[]>(
    () => service?.criteria.retention?.options.map(o => ({ value: o.value, label: o.label })) ?? [],
    [service],
  );

  // ─── Rush delivery ─────────────────────────────────────────────────────
  const rushOffered = !!rush && !!service?.addons.includes(RUSH_ADDON);
  const rushHourItems = useMemo<ChipItem[]>(
    () =>
      rush?.hours
        .filter(option => isRushAllowed(option.value, deliveryDays))
        .map(option => ({
          value: String(option.value),
          label: option.label ?? t('account.rates.hours', { count: option.value }),
        })) ?? [],
    [deliveryDays, rush, t],
  );
  const rushAvailable = rushHourItems.length > 0;

  // A shorter delivery can rule out the picked window: move to the slowest allowed one, or turn rush off.
  useEffect(() => {
    if (!rushEnabled) return;
    const current = getValues('rushHours');
    if (current != null && isRushAllowed(current, deliveryDays)) return;
    const fallback = rushHourItems[rushHourItems.length - 1];
    if (fallback) setValue('rushHours', Number(fallback.value), { shouldDirty: true });
    else setValue('rushEnabled', false, { shouldDirty: true });
  }, [deliveryDays, getValues, rushEnabled, rushHourItems, setValue]);

  const onToggleRush = useCallback(
    (next: boolean) => {
      setValue('rushEnabled', next, { shouldDirty: true });
      if (!next || getValues('rushHours') != null) return;
      const preferred = rushHourItems.find(item => Number(item.value) === rush?.defaultHours);
      const pick = preferred ?? rushHourItems[rushHourItems.length - 1];
      if (pick) setValue('rushHours', Number(pick.value), { shouldDirty: true });
    },
    [getValues, rush?.defaultHours, rushHourItems, setValue],
  );

  const formatDays = useCallback((count: number) => t('account.rates.days', { count }), [t]);

  // ─── Save / delete ─────────────────────────────────────────────────────
  const reportFailure = useCallback(
    (err: unknown) => {
      // 422 is toasted by baseQuery, 403/5xx open the global modals.
      const apiError = normalizeApiError(err);
      if (apiError.statusCode !== 422 && !apiError.isForbidden && !apiError.isServerError) {
        toastService.error(t('errors.generic'));
      }
    },
    [t],
  );

  const onSave = useCallback(() => {
    handleSubmit(async values => {
      if (!service) return;
      try {
        if (card) {
          const patch = toRateCardPatch(values, card, service);
          if (Object.keys(patch).length > 0) await updateRateCard({ id: card.id, patch }).unwrap();
        } else {
          const input = toRateCardInput(values, service);
          if (!input) return;
          await createRateCard(input).unwrap();
        }
        toastService.success(t('account.rates.editor.saved'));
        setDone(true);
      } catch (err) {
        applyServerFieldErrors(err, RATE_CARD_SERVER_FIELDS, setError);
        reportFailure(err);
      }
    })();
  }, [card, createRateCard, handleSubmit, reportFailure, service, setError, t, updateRateCard]);

  const onConfirmDelete = useCallback(async () => {
    if (!card) return;
    try {
      await deleteRateCard(card.id).unwrap();
      setDeleteVisible(false);
      toastService.success(t('account.rates.editor.deleted'));
      setDone(true);
    } catch (err) {
      setDeleteVisible(false);
      reportFailure(err);
    }
  }, [card, deleteRateCard, reportFailure, t]);

  const openDelete = useCallback(() => setDeleteVisible(true), []);
  const closeDelete = useCallback(() => setDeleteVisible(false), []);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);
  const { refetch } = sources;
  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  const groupLabel = groupItems.find(item => item.value === group)?.label
    ?? groups.find(entry => group && platformToGroup(entry.platform) === group)?.label
    ?? (group ? t('account.rates.inPerson') : null);

  return {
    isEdit,
    control,
    isLoading: sources.isLoading,
    isError: sources.isError,
    error: sources.error,
    isRetrying: sources.isFetching,
    retry,
    /** Edit of a card that no longer exists (deleted elsewhere). */
    isNotFound: isEdit && !!cards && !card && !done,
    goBack,
    // Create pickers
    groupItems,
    serviceItems,
    onPickGroup,
    onPickService,
    noFreeSlot: !isEdit && !!cards && groupItems.length === 0,
    // Edit summary (platform + service are fixed once saved)
    locked: card
      ? { group: groupLabel ?? '', service: card.service.label }
      : null,
    // Service fields
    service,
    packageItems,
    revisionItems,
    retentionItems,
    formatDays,
    rush: rushOffered && rush
      ? { label: rush.label, available: rushAvailable, hourItems: rushHourItems, onToggle: onToggleRush }
      : null,
    includes: card?.includes ?? [],
    onSave,
    isSaving: isCreating || isUpdating,
    deleteSheet: {
      visible: deleteVisible,
      onOpen: openDelete,
      onClose: closeDelete,
      onConfirm: onConfirmDelete,
      loading: isDeleting,
    },
    guard,
  };
};

export type RateCardEditorModel = ReturnType<typeof useRateCardEditorScreen>;
