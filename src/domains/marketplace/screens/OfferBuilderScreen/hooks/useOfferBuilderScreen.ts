import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation, usePreventRemove, useRoute, type NavigatorScreenParams } from '@react-navigation/native';
import { skipToken } from '@reduxjs/toolkit/query';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { normalizeApiError, type AppApiError } from '@/core/api';
import type { Money } from '@/core/money';
import { navigate, type DealFlowStackScreenProps, type RootTabParamList } from '@/core/navigation';
import { getPersistentDeviceId } from '@/core/notification';
import { appStorage, StorageKeys } from '@/core/storage';
import { useAppSelector } from '@/core/store';
import { toastService } from '@/core/toast';
import { selectUser } from '@/domains/auth';
import { useGetPublicMediaKitQuery, useSetKitShortlistedMutation } from '@/domains/identity';
import { useDeleteDealOfferDraftMutation, useGetDealOfferPreflightQuery } from '../../../api/dealOfferApi';
import { useGetDealQuery, useRunDealActionMutation } from '../../../api/dealsApi';
import { createOfferSchema, OFFER_STEP_FIELDS } from '../../../schemas/offerSchema';
import type { Deal, DealShippingMode } from '../../../types/deal';
import { DEAL_BLOCKER_CODE, type DealBlocker, type DealBlockerCode, type DealQuote } from '../../../types/dealOffer';
import {
  readBlockerDealId,
  readErrorFields,
  readPriceChangedQuote,
  readUnavailableLines,
} from '../../../utils/dealOfferMappers';
import { EMPTY_OFFER_FORM, offerFormFromDeal, toOfferInput, type OfferFormValues } from '../../../utils/offerForm';
import { toOfferCreator, toOfferServices } from '../../../utils/offerServices';
import { useBriefAttachments, type BriefFileSource } from './useBriefAttachments';
import { useOfferBrief } from './useOfferBrief';
import { useOfferDraft } from './useOfferDraft';
import { useOfferLines } from './useOfferLines';
import { useOfferQuote } from './useOfferQuote';

type ScreenProps = DealFlowStackScreenProps<'OfferBuilder'>;

export const OFFER_STEPS = ['services', 'brief', 'review'] as const;
export type OfferStep = (typeof OFFER_STEPS)[number];
export type OfferPhase = 'checking' | 'blocked' | 'building' | 'sent';
export type OfferSheet = 'receipt' | 'delivery' | 'contract' | 'files' | null;

export interface OfferPriceChange {
  before: Money | null;
  after: Money | null;
}

export interface OfferSent {
  deal: Deal;
  /** What the wallet lacked at the last quote: the top-up the brand is offered. */
  shortfall: Money | null;
  quote: DealQuote | null;
}

const isBlockerCode = (code: string | null): code is DealBlockerCode =>
  code !== null && (DEAL_BLOCKER_CODE as readonly string[]).includes(code);

const isProductMode = (value: string | undefined): value is Exclude<DealShippingMode, 'none'> =>
  value === 'gift' || value === 'returnable';

const toMain = (params: NavigatorScreenParams<RootTabParamList>) => navigate('Main', params);

/**
 * The brand's offer builder for one creator: a preflight gate, three steps on one form
 * (services → brief → review & sign), a live server quote, a quietly autosaved server draft,
 * and the send. Blockers from any call (preflight, quote, save, send) turn the screen into the
 * calm blocked state; a moved price opens the price-changed sheet. Totals are the server's.
 */
export const useOfferBuilderScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<ScreenProps['navigation']>();
  const { params } = useRoute<ScreenProps['route']>();
  const slug = params.slug;

  // — Creator + services ————————————————————————————————————————————
  const kitQuery = useGetPublicMediaKitQuery(slug);
  const kit = kitQuery.data?.kit;
  const services = useMemo(() => (kit ? toOfferServices(kit) : []), [kit]);
  const creator = useMemo(() => (kit ? toOfferCreator(kit) : null), [kit]);
  const creatorName = creator?.name ?? '';
  const user = useAppSelector(selectUser);
  const brandName = user?.display_name ?? user?.full_name ?? '';
  const brandAvatar = user?.avatar_url ?? null;

  // — Preflight + blockers ——————————————————————————————————————————
  const preflightQuery = useGetDealOfferPreflightQuery({ creatorSlug: slug });
  const preflight = preflightQuery.data ?? null;
  const [runtimeBlockers, setRuntimeBlockers] = useState<DealBlocker[] | null>(null);
  const blockers = useMemo<DealBlocker[]>(() => {
    if (runtimeBlockers) return runtimeBlockers;
    return preflight && !preflight.canOffer ? preflight.blockers : [];
  }, [preflight, runtimeBlockers]);

  // — Form ————————————————————————————————————————————————————————
  const schema = useMemo(() => createOfferSchema(t), [t]);
  const form = useForm<OfferFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues: EMPTY_OFFER_FORM,
  });
  const { control, getValues, reset, setValue, trigger } = form;
  const [lines, hasProduct, shippingMode, requestedDeliveryDays, hashtags, mentions, talkingPoints, donts, promoCode, trackingLink] =
    useWatch({
      control,
      name: [
        'lines',
        'hasProduct',
        'shippingMode',
        'requestedDeliveryDays',
        'hashtags',
        'mentions',
        'talkingPoints',
        'donts',
        'promoCode',
        'trackingLink',
      ],
    });
  const offer = useMemo(
    () =>
      toOfferInput({
        lines,
        hasProduct,
        shippingMode,
        requestedDeliveryDays,
        hashtags,
        mentions,
        talkingPoints,
        donts,
        promoCode,
        trackingLink,
      }),
    [donts, hasProduct, hashtags, lines, mentions, promoCode, requestedDeliveryDays, shippingMode, talkingPoints, trackingLink],
  );

  const linesModel = useOfferLines(form, lines, services);
  const brief = useOfferBrief(form, talkingPoints);
  const setRequestedDays = useCallback(
    (days: number | null) => setValue('requestedDeliveryDays', days),
    [setValue],
  );

  // Services picked on the media kit start the offer (once, and only those still priced).
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current || services.length === 0 || params.draftId) return;
    prefilled.current = true;
    const picked = (params.rateCardIds ?? []).filter(id => services.some(service => service.rateCardId === id));
    if (picked.length > 0) {
      setValue(
        'lines',
        picked.map(rateCardId => ({ rateCardId, quantity: 1, addons: [] })),
      );
    }
  }, [params.draftId, params.rateCardIds, services, setValue]);

  // A card that left the kit (hidden, unpriced) leaves the offer too.
  useEffect(() => {
    if (!kit) return;
    const current = getValues('lines');
    const kept = current.filter(line => services.some(service => service.rateCardId === line.rateCardId));
    if (kept.length !== current.length) setValue('lines', kept, { shouldValidate: kept.length === 0 });
  }, [getValues, kit, services, setValue]);

  // — Draft, resume, attachments —————————————————————————————————————
  const draft = useOfferDraft(slug, offer);
  const attachments = useBriefAttachments(draft.draftId);
  const [loadDraftId, setLoadDraftId] = useState<string | null>(params.draftId ?? null);
  const [resumeDismissed, setResumeDismissed] = useState(params.draftId !== undefined);
  const resumeDraftId = preflight?.resumeDraftId ?? null;
  const showResume = !resumeDismissed && resumeDraftId !== null && loadDraftId === null;
  // The resume sheet reads the draft's save time; continuing then reuses the same cache entry.
  const draftToRead = loadDraftId ?? (showResume ? resumeDraftId : null);
  const draftQuery = useGetDealQuery(draftToRead ? { role: 'brand', id: draftToRead } : skipToken);
  const loadedDraft = useRef<string | null>(null);
  const { adopt, forget } = draft;
  const { restore } = attachments;
  useEffect(() => {
    if (!loadDraftId || loadedDraft.current === loadDraftId) return;
    const deal = draftQuery.data?.deal;
    if (deal && deal.id === loadDraftId) {
      loadedDraft.current = loadDraftId;
      if (deal.status.key !== 'draft') {
        toastService.error(t('marketplace.offer.resume.failed'));
        setLoadDraftId(null);
        return;
      }
      const values = offerFormFromDeal(deal);
      reset(values);
      adopt(deal.id, toOfferInput(values));
      restore(deal.briefAttachments);
      if (!params.draftId) toastService.success(t('marketplace.offer.resume.restored'));
      return;
    }
    if (draftQuery.isError && draftToRead === loadDraftId) {
      loadedDraft.current = loadDraftId;
      toastService.error(t('marketplace.offer.resume.failed'));
      setLoadDraftId(null);
    }
  }, [adopt, draftQuery.data, draftQuery.isError, draftToRead, loadDraftId, params.draftId, reset, restore, t]);

  const [deleteDraft] = useDeleteDealOfferDraftMutation();
  const onResume = useCallback(() => {
    setResumeDismissed(true);
    if (resumeDraftId) setLoadDraftId(resumeDraftId);
  }, [resumeDraftId]);
  const onStartFresh = useCallback(() => {
    setResumeDismissed(true);
    // One draft per creator: the old one goes so the new offer doesn't count twice.
    if (resumeDraftId) deleteDraft(resumeDraftId).unwrap().catch(() => undefined);
    forget();
  }, [deleteDraft, forget, resumeDraftId]);

  // — Phase ———————————————————————————————————————————————————————
  const [sent, setSent] = useState<OfferSent | null>(null);
  const kitFailed = !kit && kitQuery.isError;
  const loadingDraft = loadDraftId !== null && loadedDraft.current !== loadDraftId;
  const phase: OfferPhase = sent
    ? 'sent'
    : blockers.length > 0
      ? 'blocked'
      : (preflightQuery.isLoading || !kit || loadingDraft)
        ? 'checking'
        : 'building';

  // — Quote ———————————————————————————————————————————————————————
  const quoteState = useOfferQuote(slug, offer, phase === 'building');
  const { quote, error: quoteError, refetch: refetchQuote } = quoteState;
  const handledQuoteError = useRef<AppApiError | null>(null);
  const { refetch: refetchKit } = kitQuery;

  const routeError = useCallback(
    (error: AppApiError) => {
      if (isBlockerCode(error.code)) {
        setRuntimeBlockers([{ code: error.code, label: error.message, dealId: readBlockerDealId(error.details) }]);
        return;
      }
      const dropped = readUnavailableLines(error.details);
      if (dropped.length > 0) {
        refetchKit();
        toastService.info(t('marketplace.offer.services.changed'));
        return;
      }
      if (readErrorFields(error.details).includes('requested_delivery_days')) {
        setValue('requestedDeliveryDays', null);
        return;
      }
      toastService.error(error.message);
    },
    [refetchKit, setValue, t],
  );

  useEffect(() => {
    if (!quoteError || handledQuoteError.current === quoteError) return;
    handledQuoteError.current = quoteError;
    // Transport / 5xx already show the global snackbar or modal; the dock keeps the last price.
    if (quoteError.statusCode === 403 || quoteError.statusCode === 409 || quoteError.statusCode === 422) {
      routeError(quoteError);
    }
  }, [quoteError, routeError]);

  // — Steps —————————————————————————————————————————————————————————
  const [step, setStep] = useState<OfferStep>('services');
  const [advancing, setAdvancing] = useState(false);
  const stepIndex = OFFER_STEPS.indexOf(step);

  const goNext = useCallback(async () => {
    if (advancing) return;
    if (step === 'services') {
      if (!(await trigger([...OFFER_STEP_FIELDS.services]))) return;
      setAdvancing(true);
      const result = await draft.ensureDraft();
      setAdvancing(false);
      if (!result.ok) {
        routeError(result.error);
        return;
      }
      setStep('brief');
      return;
    }
    if (step === 'brief') {
      if (!(await trigger([...OFFER_STEP_FIELDS.brief]))) return;
      if (attachments.isUploading) {
        toastService.info(t('marketplace.offer.brief.files.waiting'));
        return;
      }
      draft.flush();
      setStep('review');
    }
  }, [advancing, attachments.isUploading, draft, routeError, step, t, trigger]);

  const goBack = useCallback(() => {
    setStep(current => (current === 'review' ? 'brief' : 'services'));
  }, []);
  const goToStep = useCallback(
    (target: OfferStep) => {
      if (OFFER_STEPS.indexOf(target) < stepIndex) setStep(target);
    },
    [stepIndex],
  );

  // Back (gesture / hardware) walks the steps; the close button leaves for real.
  const [closing, setClosing] = useState(false);
  usePreventRemove(!closing && phase === 'building' && step !== 'services', () => goBack());
  const onClose = useCallback(() => setClosing(true), []);
  const hasDraft = draft.draftId !== null;
  const { flush } = draft;
  const closed = useRef(false);
  useEffect(() => {
    if (!closing || closed.current) return;
    closed.current = true;
    if (hasDraft && phase === 'building') {
      flush();
      toastService.info(t('marketplace.offer.closedWithDraft'));
    }
    navigation.goBack();
  }, [closing, flush, hasDraft, navigation, phase, t]);

  // — Sheets ————————————————————————————————————————————————————————
  const [sheet, setSheet] = useState<OfferSheet>(null);
  const openReceipt = useCallback(() => setSheet('receipt'), []);
  const openDeliverySheet = useCallback(() => setSheet('delivery'), []);
  const openContract = useCallback(() => setSheet('contract'), []);
  const closeSheet = useCallback(() => setSheet(null), []);
  // The picker opens only once the source sheet is gone: iOS can't present over a closing modal.
  const pendingSource = useRef<BriefFileSource | null>(null);
  const openFilesSheet = useCallback(() => setSheet('files'), []);
  const chooseFileSource = useCallback((source: BriefFileSource) => {
    pendingSource.current = source;
    setSheet(null);
  }, []);
  const { pickFrom } = attachments;
  const onFilesSheetDismissed = useCallback(() => {
    const source = pendingSource.current;
    pendingSource.current = null;
    if (source) pickFrom(source);
  }, [pickFrom]);

  // — Shipping memory ———————————————————————————————————————————————
  const setHasProduct = useCallback(
    (next: boolean) => {
      setValue('hasProduct', next);
      if (!next) {
        setValue('shippingMode', 'none', { shouldValidate: false });
        return;
      }
      const last = appStorage.get(StorageKeys.DEAL_LAST_SHIPPING_MODE);
      setValue('shippingMode', isProductMode(last) ? last : 'none');
    },
    [setValue],
  );
  const lastShippingMode = useMemo(() => {
    const last = appStorage.get(StorageKeys.DEAL_LAST_SHIPPING_MODE);
    return isProductMode(last) ? last : null;
  }, []);

  // — Send ——————————————————————————————————————————————————————————
  const [runAction, { isLoading: sending }] = useRunDealActionMutation();
  const [priceChange, setPriceChange] = useState<OfferPriceChange | null>(null);
  const sendingRef = useRef(false);

  const onSign = useCallback(async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    try {
      const saved = await draft.flush();
      if (!saved.ok) {
        routeError(saved.error);
        return;
      }
      const deviceId = await getPersistentDeviceId();
      const result = await runAction({
        ref: { role: 'brand', id: saved.id },
        path: 'send',
        body: { device_id: deviceId },
      }).unwrap();
      if (isProductMode(offer.shippingMode)) {
        appStorage.set(StorageKeys.DEAL_LAST_SHIPPING_MODE, offer.shippingMode);
      }
      setSent({
        deal: result.deal,
        shortfall: quote && !quote.wallet.isSufficient ? quote.wallet.shortfall : null,
        quote,
      });
    } catch (err) {
      const error = normalizeApiError(err);
      if (error.code === 'deal_price_changed') {
        const fresh = readPriceChangedQuote(error.details);
        setPriceChange({ before: quote?.total ?? null, after: fresh?.total ?? null });
        refetchQuote();
        return;
      }
      routeError(error);
    } finally {
      sendingRef.current = false;
    }
  }, [draft, offer.shippingMode, quote, refetchQuote, routeError, runAction]);

  const onPriceAccept = useCallback(() => {
    setPriceChange(null);
    toastService.info(t('marketplace.offer.priceChanged.applied'));
  }, [t]);
  const onPriceEdit = useCallback(() => {
    setPriceChange(null);
    setStep('services');
  }, []);

  // — Blocked + sent actions ————————————————————————————————————————
  const [setShortlisted, { isLoading: savingShortlist }] = useSetKitShortlistedMutation();
  const isShortlisted = kit?.is_shortlisted === true;
  const onBlockerAction = useCallback(
    async (blocker: DealBlocker) => {
      switch (blocker.code) {
        case 'kyc_required':
          toMain({ screen: 'SettingsTab', params: { screen: 'CompanyVerification', initial: false } });
          return;
        case 'deal_creator_unavailable':
          if (isShortlisted) {
            toMain({ screen: 'HomeTab', params: { screen: 'Shortlist', initial: false } });
            return;
          }
          try {
            await setShortlisted({ slug, shortlisted: true }).unwrap();
            toastService.success(t('account.mediaKit.showcase.shortlist.saved'));
          } catch {
            toastService.error(t('marketplace.shortlist.failed'));
          }
          return;
        case 'deal_offer_exists':
          toMain(
            blocker.dealId
              ? { screen: 'DealsTab', params: { screen: 'DealDetail', params: { id: blocker.dealId }, initial: false } }
              : { screen: 'DealsTab' },
          );
          return;
        case 'deal_offer_limit':
        case 'deal_draft_limit':
          toMain({ screen: 'DealsTab' });
          return;
        case null:
          navigation.goBack();
          return;
        default: {
          const _exhaustive: never = blocker.code;
          return _exhaustive;
        }
      }
    },
    [isShortlisted, navigation, setShortlisted, slug, t],
  );

  const onTopUp = useCallback(() => {
    if (!sent?.shortfall) return;
    toMain({ screen: 'WalletTab', params: { screen: 'TopUp', params: { amount: sent.shortfall }, initial: false } });
  }, [sent]);
  const onOpenDeal = useCallback(() => {
    if (!sent) return;
    toMain({ screen: 'DealsTab', params: { screen: 'DealDetail', params: { id: sent.deal.id }, initial: false } });
  }, [sent]);
  const onDone = useCallback(() => navigation.goBack(), [navigation]);
  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onOpenGuide = useCallback(() => {
    navigation.navigate('DealGuide', { role: 'brand', context: 'deal', hasProduct: offer.shippingMode !== 'none' });
  }, [navigation, offer.shippingMode]);

  const onRetryGate = useCallback(() => {
    refetchKit();
    preflightQuery.refetch();
  }, [preflightQuery, refetchKit]);

  return {
    phase,
    kitFailed,
    onRetryGate,
    creator,
    creatorName,
    brandName,
    brandAvatar,
    kit,
    services,
    preflight,
    blockers,
    onBlockerAction,
    savingShortlist,
    isShortlisted,
    form,
    offer,
    lines: linesModel,
    brief,
    setRequestedDays,
    quote,
    isPricing: quoteState.isPricing,
    quoteBlocker: quote?.blockers[0] ?? null,
    step,
    stepIndex,
    goNext,
    goBack,
    goToStep,
    advancing,
    onClose,
    saveState: draft.saveState,
    attachments,
    showResume,
    onResume,
    onStartFresh,
    resumedAt: showResume ? (draftQuery.data?.deal.updatedAt ?? null) : null,
    sheet,
    openReceipt,
    openDeliverySheet,
    openContract,
    closeSheet,
    openFilesSheet,
    chooseFileSource,
    onFilesSheetDismissed,
    setHasProduct,
    lastShippingMode,
    onSign,
    sending,
    priceChange,
    onPriceAccept,
    onPriceEdit,
    sent,
    onTopUp,
    onOpenDeal,
    onDone,
    onBack,
    onOpenGuide,
  };
};

export type OfferBuilderModel = ReturnType<typeof useOfferBuilderScreen>;
