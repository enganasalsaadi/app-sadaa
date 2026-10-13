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
  toRatePriceBounds,
} from '@/domains/auth';
import {
  useCreateRateCardMutation,
  useDeleteRateCardMutation,
  useUpdateRateCardMutation,
} from '../../../api/rateCardsApi';
import { DURATION_OPTION, RATE_CARD_SERVER_FIELDS, RUSH_HOURS_OPTION } from '../../../constants/rateCards';
import { useRateCardSources } from '../../../hooks/useRateCardSources';
import { createRateCardSchema, type RateCardFormValues } from '../../../schemas/rateCardSchema';
import {
  addonDefinitions,
  addonServerFields,
  allowedValues,
  pickAddonOptions,
  toAddonForms,
  type AddonDef,
  type AddonOptionDef,
  type AddonOptionValue,
  type AddonInputRow,
} from '../../../utils/rateCardAddonForm';
import {
  emptyRateCardForm,
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

export interface AddonOptionField {
  key: string;
  title: string;
  items: ChipItem[];
  /** The catalog has one value only: shown as text, not a picker (exclusivity 14 days). */
  fixed: string | null;
}

export interface AddonField {
  type: AddonDef['type'];
  label: string;
  /** `false` = no option value fits the delivery time (rush needs 2+ days). */
  available: boolean;
  options: AddonOptionField[];
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

  const bounds = useMemo(
    () => (catalog ? toRatePriceBounds(catalog.price_bounds) : DEFAULT_RATE_PRICE_BOUNDS),
    [catalog],
  );

  // The rules follow the picked service, so the schema is built per validation.
  const resolver = useCallback<Resolver<RateCardFormValues>>(
    (values, context, options) => {
      const service =
        catalog && values.group && values.service
          ? findCatalogService(catalog, groupToPlatform(values.group), values.service)
          : null;
      const addons = catalog && service ? addonDefinitions(catalog, service) : [];
      return yupResolver(createRateCardSchema(t, { service, bounds, addons }))(values, context, options);
    },
    [bounds, catalog, t],
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
    if (!card || !catalog || prefilled.current) return;
    prefilled.current = true;
    const saved = findCatalogService(catalog, card.platform, card.service.key);
    reset(toRateCardForm(card, saved ? addonDefinitions(catalog, saved) : []));
  }, [card, catalog, reset]);

  const guard = useDiscardGuard(isDirty && !done);
  useEffect(() => {
    if (done) navigation.goBack();
  }, [done, navigation]);

  const [group, serviceKey, deliveryDays] = useWatch({
    control,
    name: ['group', 'service', 'deliveryDays'],
  });
  const platform = group ? groupToPlatform(group) : null;
  const service = useMemo(
    () => (catalog && group && serviceKey ? findCatalogService(catalog, platform, serviceKey) : null),
    [catalog, group, platform, serviceKey],
  );
  const addonDefs = useMemo(
    () => (catalog && service ? addonDefinitions(catalog, service) : []),
    [catalog, service],
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
      setValue('addons', catalog ? toAddonForms(addonDefinitions(catalog, next)) : [], opts);
    },
    [catalog, cards, groupServices, platform, setValue],
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

  // ─── Add-ons (rendered from the catalog) ───────────────────────────────
  const optionTitle = useCallback(
    (option: AddonOptionDef) =>
      option.label ??
      t(option.key === RUSH_HOURS_OPTION ? 'account.rates.editor.rushWindow' : 'account.rates.editor.addonDuration'),
    [t],
  );
  const valueLabel = useCallback(
    (option: AddonOptionDef, entry: AddonOptionValue) => {
      if (entry.label) return entry.label;
      if (typeof entry.value !== 'number') return entry.key;
      if (option.key === RUSH_HOURS_OPTION) return t('account.rates.hours', { count: entry.value });
      if (option.key === DURATION_OPTION) return t('account.rates.days', { count: entry.value });
      return entry.key;
    },
    [t],
  );

  const addonFields = useMemo<AddonField[]>(
    () =>
      addonDefs.map(def => {
        const options = def.options.map(option => {
          const [only] = option.values;
          return {
            key: option.key,
            title: optionTitle(option),
            items: allowedValues(option, deliveryDays).map(entry => ({
              value: entry.key,
              label: valueLabel(option, entry),
            })),
            fixed: option.values.length === 1 && only ? valueLabel(option, only) : null,
          };
        });
        return {
          type: def.type,
          label: def.label,
          available: options.every(option => option.items.length > 0),
          options,
        };
      }),
    [addonDefs, deliveryDays, optionTitle, valueLabel],
  );

  // A shorter delivery can rule out a picked option: move to an allowed one, or turn the add-on off.
  useEffect(() => {
    getValues('addons').forEach((row, index) => {
      const def = addonDefs.find(entry => entry.type === row.type);
      if (!row.enabled || !def) return;
      const options = pickAddonOptions(def, deliveryDays, row.options);
      if (!options) setValue(`addons.${index}.enabled`, false, { shouldDirty: true });
      else if (def.options.some(option => options[option.key] !== row.options[option.key])) {
        setValue(`addons.${index}.options`, options, { shouldDirty: true });
      }
    });
  }, [addonDefs, deliveryDays, getValues, setValue]);

  const onToggleAddon = useCallback(
    (index: number, next: boolean) => {
      const row = getValues(`addons.${index}`);
      const def = addonDefs.find(entry => entry.type === row?.type);
      if (!row || !def) return;
      if (next) {
        const options = pickAddonOptions(def, getValues('deliveryDays'), row.options);
        if (!options) return;
        setValue(`addons.${index}.options`, options, { shouldDirty: true });
      }
      setValue(`addons.${index}.enabled`, next, { shouldDirty: true });
    },
    [addonDefs, getValues, setValue],
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
      let sent: AddonInputRow[] = [];
      try {
        if (card) {
          const patch = toRateCardPatch(values, card, service, addonDefs);
          sent = patch.addons;
          if (Object.keys(patch.body).length > 0) {
            await updateRateCard({ id: card.id, patch: patch.body }).unwrap();
          }
        } else {
          const input = toRateCardInput(values, service, addonDefs);
          if (!input) return;
          sent = input.addons;
          await createRateCard(input.body).unwrap();
        }
        toastService.success(t('account.rates.editor.saved'));
        setDone(true);
      } catch (err) {
        const fields = { ...RATE_CARD_SERVER_FIELDS, ...addonServerFields(addonDefs, sent) };
        applyServerFieldErrors(err, fields, setError);
        reportFailure(err);
      }
    })();
  }, [addonDefs, card, createRateCard, handleSubmit, reportFailure, service, setError, t, updateRateCard]);

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
    addons: addonFields,
    onToggleAddon,
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
