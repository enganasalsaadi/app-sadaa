import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { skipToken } from '@reduxjs/toolkit/query';
import { useTranslation } from 'react-i18next';
import { normalizeApiError, type AddonType } from '@/core/api';
import { navigate, type DealsStackParamList, type DealsStackScreenProps } from '@/core/navigation';
import { getPersistentDeviceId } from '@/core/notification';
import { useAppSelector } from '@/core/store';
import { toastService } from '@/core/toast';
import { selectUser } from '@/domains/auth';
import { useGetPublicMediaKitQuery } from '@/domains/identity';
import { toUpsellBody, useGetDealUpsellQuoteQuery } from '../../../api/dealUpsellApi';
import { useGetDealQuery } from '../../../api/dealsApi';
import { DEAL_OFFER_LIMITS } from '../../../constants/dealOffer';
import { useDealAction } from '../../../hooks/useDealAction';
import type { DealUpsellRequest } from '../../../types';
import { reportDealFailure } from '../../../utils/dealAction';
import { itemAddonChoices } from '../../../utils/dealUpsell';
import type { OfferLineValue } from '../../../utils/offerForm';
import { toOfferServices } from '../../../utils/offerServices';

/** Long enough to fold a burst of taps (quantity, add-ons) into one price request. */
const QUOTE_DEBOUNCE_MS = 350;

export type UpsellMode = 'deliverable' | 'addon';

/**
 * The brand adding to a running deal (M8): one more deliverable from the creator's rate cards
 * (with its add-ons) or an add-on on a deliverable already in the deal. The server prices the
 * exact addition and says what the wallet is short; nothing is charged until the creator signs.
 * Sending is press-and-hold with this device, one idempotency key per addition (rule 06).
 */
export const useDealUpsellBuilderScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<DealsStackScreenProps<'DealUpsellBuilder'>['navigation']>();
  const { id } = useRoute<RouteProp<DealsStackParamList, 'DealUpsellBuilder'>>().params;
  const ref = useMemo(() => ({ role: 'brand' as const, id }), [id]);
  const user = useAppSelector(selectUser);
  const canTopUp = user?.capabilities?.top_up_wallet?.allowed === true;

  const detail = useGetDealQuery(ref);
  const deal = detail.data?.deal ?? null;
  const slug = deal?.creator.slug ?? null;
  const kit = useGetPublicMediaKitQuery(slug ?? skipToken);
  const services = useMemo(() => (kit.data?.kit ? toOfferServices(kit.data.kit) : []), [kit.data?.kit]);

  const [mode, setMode] = useState<UpsellMode>('deliverable');
  const [line, setLine] = useState<OfferLineValue | null>(null);
  const [itemId, setItemId] = useState<string | null>(null);
  const [addonType, setAddonType] = useState<string | null>(null);

  // — Deliverable ———————————————————————————————————————————————————
  const room = DEAL_OFFER_LIMITS.maxItemsPerDeal - (deal?.items.length ?? 0);
  const maxQuantity = Math.max(1, Math.min(DEAL_OFFER_LIMITS.maxQuantityPerLine, room));
  const toggleService = useCallback(
    (rateCardId: string) => {
      if (line?.rateCardId === rateCardId) {
        setLine(null);
        return;
      }
      if (room < 1) {
        toastService.info(t('marketplace.offer.services.dealCapToast', { max: DEAL_OFFER_LIMITS.maxItemsPerDeal }));
        return;
      }
      setLine({ rateCardId, quantity: 1, addons: [] });
    },
    [line?.rateCardId, room, t],
  );
  const setQuantity = useCallback(
    (_rateCardId: string, quantity: number) =>
      setLine(current => (current ? { ...current, quantity: Math.min(Math.max(quantity, 1), maxQuantity) } : current)),
    [maxQuantity],
  );
  const toggleAddon = useCallback(
    (_rateCardId: string, type: AddonType) =>
      setLine(current => {
        if (!current) return current;
        const on = current.addons.includes(type);
        return { ...current, addons: on ? current.addons.filter(addon => addon !== type) : [...current.addons, type] };
      }),
    [],
  );

  // — Add-on on an item ———————————————————————————————————————————————
  const items = deal?.items ?? [];
  const item = items.find(entry => entry.id === itemId) ?? null;
  const addonChoices = useMemo(
    () => (item ? itemAddonChoices(item, services.find(service => service.rateCardId === item.rateCardId)) : []),
    [item, services],
  );
  const pickItem = useCallback((next: string) => {
    setItemId(next);
    setAddonType(null);
  }, []);

  // — Price ——————————————————————————————————————————————————————————
  const request = useMemo<DealUpsellRequest | null>(() => {
    if (mode === 'deliverable') {
      return line ? { kind: 'deliverable', rateCardId: line.rateCardId, quantity: line.quantity, addons: line.addons } : null;
    }
    return itemId && addonType ? { kind: 'addon', itemId, addonType } : null;
  }, [addonType, itemId, line, mode]);
  const key = JSON.stringify(request);
  const [debouncedKey, setDebouncedKey] = useState(key);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKey(key), QUOTE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [key]);
  const args = useMemo(() => {
    const parsed = JSON.parse(debouncedKey) as DealUpsellRequest | null;
    return parsed ? { dealId: id, request: parsed } : null;
  }, [debouncedKey, id]);
  const priced = useGetDealUpsellQuoteQuery(args ?? skipToken);
  const refetchQuote = priced.refetch;
  const quote = request ? (priced.data ?? null) : null;
  const isPricing = request !== null && (key !== debouncedKey || priced.isFetching);
  const quoteError = request && priced.error ? normalizeApiError(priced.error) : null;

  // — Send ———————————————————————————————————————————————————————————
  const send = useDealAction(ref, { idempotent: true });
  const runSend = send.run;
  const resetIntent = send.resetIntent;
  useEffect(() => {
    resetIntent();
  }, [key, resetIntent]);
  const creatorName = deal?.creator.name ?? '';
  const onSend = useCallback(async (): Promise<boolean> => {
    if (!request) return false;
    const deviceId = await getPersistentDeviceId();
    const outcome = await runSend('upsells', { body: toUpsellBody(request, deviceId) });
    if (outcome.ok) {
      toastService.success(t('marketplace.deals.changes.upsells.toast.proposed', { name: creatorName }));
      navigation.goBack();
      return true;
    }
    if (outcome.conflict) {
      // The wallet moved since the quote: price it again so the dock shows the new gap.
      if (outcome.error.code === 'deal_upsell_insufficient_funds') refetchQuote();
      return false;
    }
    reportDealFailure(outcome.error);
    return false;
  }, [creatorName, navigation, refetchQuote, request, runSend, t]);

  const shortfall = quote && !quote.wallet.isSufficient ? quote.wallet.shortfall : null;
  const onTopUp = useCallback(() => {
    if (!shortfall) return;
    navigate('Main', {
      screen: 'WalletTab',
      params: { screen: 'TopUp', params: { amount: shortfall }, initial: false },
    });
  }, [shortfall]);

  const onRetry = useCallback(() => {
    detail.refetch();
    kit.refetch();
  }, [detail, kit]);

  return {
    deal,
    creatorName,
    isLoading: !deal && detail.isFetching,
    loadError: !deal && detail.isError ? detail.error : null,
    onRetry,
    closed: deal !== null && !deal.upsellWindow.open,
    mode,
    setMode,
    // Deliverable
    services,
    servicesLoading: kit.isLoading,
    line,
    maxQuantity,
    toggleService,
    setQuantity,
    toggleAddon,
    // Add-on
    items,
    itemId,
    pickItem,
    addonChoices,
    addonType,
    setAddonType,
    // Price and send
    request,
    quote,
    isPricing,
    quoteError,
    onSend,
    sending: send.isRunning,
    shortfall,
    canTopUp,
    onTopUp,
  };
};

export type DealUpsellBuilderModel = ReturnType<typeof useDealUpsellBuilderScreen>;
