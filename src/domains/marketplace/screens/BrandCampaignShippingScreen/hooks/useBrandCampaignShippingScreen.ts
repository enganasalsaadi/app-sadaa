import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useForm } from 'react-hook-form';
import { useRoute } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTranslation } from 'react-i18next';
import { createIdempotentAction, normalizeApiError } from '@/core/api';
import type { IdempotentAction } from '@/core/api';
import type { DealsStackScreenProps } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { useGetCampaignQuery } from '../../../api/brandCampaignsApi';
import { useGetCampaignShippingQuery, useShipCampaignBatchMutation } from '../../../api/campaignBatchApi';
import { dealCourierLabels, DEAL_COURIER_PRESETS, type DealCourierChoice } from '../../../constants/dealShipping';
import { useClock } from '../../../hooks/useClock';
import { createCampaignShippingResolver } from '../../../schemas/campaignShippingSchema';
import type { CampaignShipmentReport } from '../../../types/campaignShipping';
import {
  buildShipmentInputs,
  campaignParcels,
  campaignShippingTotals,
  chunkShipments,
  EMPTY_SHIPPING_DRAFT,
  mergeShipmentReports,
  nextParcelOpening,
  parcelCanShip,
  shipmentChunkSignature,
  type CampaignShippingFailure,
  type CampaignShippingFormValues,
  type CampaignShippingSent,
} from '../../../utils/campaignShipping';
import { addressText } from '../../../utils/dealShipping';

type Route = DealsStackScreenProps<'CampaignShipping'>['route'];

const MINUTE = 60_000;
/** Wake just after a lock opens so the parcel is not shown locked at 00:00:00. */
const WAKE_LAG_MS = 400;

/**
 * The batch shipping manifest of one campaign (contract §3.8). The server lists the parcels (and
 * logs that the addresses were read); the brand ticks parcels, fills courier and number, and holds
 * to send. More than 20 go in chunks of 20, each with its own `Idempotency-Key` (rule 06) that
 * survives a retry of the same chunk; the per-row reports are merged: shipped parcels freeze as
 * sent, failed ones rise with the server's words and stay editable, a row whose creator is still
 * in the brief window locks with the server's `ship_from`. Addresses stay hidden until tapped and
 * hide again when the app leaves the foreground.
 */
export const useBrandCampaignShippingScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<Route>().params;
  const query = useGetCampaignShippingQuery(id, { refetchOnMountOrArgChange: true });
  // The title only; the campaign page already holds it.
  const campaign = useGetCampaignQuery(id);
  const [ship] = useShipCampaignBatchMutation();
  const board = query.data ?? null;

  const [failures, setFailures] = useState<Record<string, CampaignShippingFailure>>({});
  const [sent, setSent] = useState<Record<string, CampaignShippingSent>>({});
  const [revealed, setRevealed] = useState<readonly string[]>([]);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // — Clock ——————————————————————————————————————————————————————————
  const minute = useClock(MINUTE);
  const [woke, setWoke] = useState(0);
  const now = Math.max(minute, woke);

  const parcels = useMemo(() => campaignParcels(board?.rows ?? [], failures, sent, now), [board, failures, now, sent]);
  const opening = nextParcelOpening(parcels, now);
  useEffect(() => {
    if (opening === null) return;
    const timer = setTimeout(() => setWoke(Date.now()), Math.max(0, opening - Date.now()) + WAKE_LAG_MS);
    return () => clearTimeout(timer);
  }, [opening]);

  // Sent in this visit and not yet in the server's count (a refetch already includes them).
  const fulfilledAt = query.fulfilledTimeStamp ?? 0;
  const shippedSince = Object.values(sent).filter(entry => entry.sentAt > fulfilledAt).length;
  const totals = useMemo(
    () => campaignShippingTotals(parcels, (board?.totals.shipped ?? 0) + shippedSince),
    [board, parcels, shippedSince],
  );

  // — Form: one draft per listed parcel —————————————————————————————————
  const resolver = useMemo(() => createCampaignShippingResolver(t), [t]);
  const form = useForm<CampaignShippingFormValues>({ resolver, defaultValues: { rows: {} } });
  const { getValues, setValue } = form;
  // A refetch (pull, push) adds the new parcels' drafts and leaves what the brand has typed alone. The
  // ticks and the courier of a parcel whose fields are closed are not registered inputs, so the form's
  // own `values` merge would drop them.
  useEffect(() => {
    if (!board) return;
    const drafts = getValues('rows');
    board.rows.forEach(row => {
      if (!drafts[row.dealId]) setValue(`rows.${row.dealId}`, EMPTY_SHIPPING_DRAFT);
    });
  }, [board, getValues, setValue]);

  const courierLabels = useMemo(() => dealCourierLabels(t), [t]);
  const courierItems = useMemo(
    () => ([...DEAL_COURIER_PRESETS, 'other'] as const).map(value => ({ value, label: courierLabels[value] })),
    [courierLabels],
  );
  const bulkItems = useMemo(
    () => DEAL_COURIER_PRESETS.map(value => ({ value, label: courierLabels[value] })),
    [courierLabels],
  );

  const parcelsRef = useRef(parcels);
  parcelsRef.current = parcels;

  const toggleSelected = useCallback(
    (dealId: string) => {
      const parcel = parcelsRef.current.find(entry => entry.row.dealId === dealId);
      if (!parcel || !parcelCanShip(parcel)) return;
      setValue(`rows.${dealId}.selected`, !getValues(`rows.${dealId}.selected`));
    },
    [getValues, setValue],
  );

  const setAllSelected = useCallback(
    (selected: boolean) => {
      parcelsRef.current.filter(parcelCanShip).forEach(parcel => {
        setValue(`rows.${parcel.row.dealId}.selected`, selected);
      });
    },
    [setValue],
  );

  /** One courier for every parcel that can still ship; the number stays per parcel. */
  const setCourierForAll = useCallback(
    (value: string) => {
      const courier = DEAL_COURIER_PRESETS.find(preset => preset === value);
      if (!courier) return;
      parcelsRef.current.filter(parcelCanShip).forEach(parcel => {
        setValue(`rows.${parcel.row.dealId}.courier`, courier as DealCourierChoice);
      });
    },
    [setValue],
  );

  // — Addresses (PII) —————————————————————————————————————————————————
  const toggleReveal = useCallback((dealId: string) => {
    setRevealed(current =>
      current.includes(dealId) ? current.filter(shown => shown !== dealId) : [...current, dealId],
    );
  }, []);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') setRevealed([]);
    });
    return () => subscription.remove();
  }, []);

  const copyAddress = useCallback(
    (dealId: string) => {
      const address = parcelsRef.current.find(entry => entry.row.dealId === dealId)?.row.address;
      if (!address) return;
      Clipboard.setString(addressText(address));
      toastService.success(t('marketplace.deals.shipping.address.copied'));
    },
    [t],
  );

  // — Send ———————————————————————————————————————————————————————————
  const intents = useRef(new Map<string, IdempotentAction>());
  const sending = useRef(false);

  const settleReport = useCallback(
    (report: CampaignShipmentReport, group: ReturnType<typeof buildShipmentInputs>) => {
      const byDeal = new Map(group.map(input => [input.dealId, input]));
      const listed = new Map(parcelsRef.current.map(parcel => [parcel.row.dealId, parcel.row]));
      const at = Date.now();
      setSent(current => {
        const next = { ...current };
        report.results.forEach(result => {
          const input = byDeal.get(result.dealId);
          const row = listed.get(result.dealId);
          if (result.ok && input && row) {
            next[result.dealId] = { row, courier: input.courier, trackingNo: input.trackingNo, sentAt: at };
          }
        });
        return next;
      });
      setFailures(current => {
        const next = { ...current };
        report.results.forEach(result => {
          if (result.ok) delete next[result.dealId];
          else next[result.dealId] = { code: result.code, message: result.message, shipFrom: result.shipFrom };
        });
        return next;
      });
      report.results.forEach(result => {
        // A shipped parcel is done (a later re-ship starts from a blank waybill); one whose creator is
        // still reviewing the brief locks and leaves the batch.
        if (result.ok) setValue(`rows.${result.dealId}`, EMPTY_SHIPPING_DRAFT);
        else if (result.code === 'campaign_brief_window_open') setValue(`rows.${result.dealId}.selected`, false);
      });
    },
    [setValue],
  );

  const sendBatches = useCallback(
    async (drafts: CampaignShippingFormValues) => {
      const inputs = buildShipmentInputs(parcelsRef.current, drafts.rows, courierLabels);
      if (inputs.length === 0) {
        toastService.info(t('marketplace.campaign.shipping.toast.pickOne'));
        return;
      }
      setBatchError(null);
      const reports: CampaignShipmentReport[] = [];
      for (const group of chunkShipments(inputs)) {
        const signature = shipmentChunkSignature(group);
        const intent = intents.current.get(signature) ?? createIdempotentAction();
        intents.current.set(signature, intent);
        try {
          const report = await intent.run(idempotencyKey => ship({ id, shipments: group, idempotencyKey }).unwrap());
          intents.current.delete(signature);
          reports.push(report);
          settleReport(report, group);
        } catch (err) {
          // Nothing of this chunk is known to have shipped; the same hold retries it under the same key.
          setBatchError(normalizeApiError(err).message);
          break;
        }
      }
      const merged = mergeShipmentReports(reports);
      if (merged.total === 0) return;
      if (merged.failed === 0) {
        toastService.success(t('marketplace.campaign.shipping.toast.allSent', { total: merged.shipped }));
      } else {
        const message = t('marketplace.campaign.shipping.toast.someFailed', {
          shipped: merged.shipped,
          failed: merged.failed,
        });
        if (merged.shipped > 0) toastService.info(message);
        else toastService.error(message);
      }
    },
    [courierLabels, id, settleReport, ship, t],
  );

  const handleSubmit = form.handleSubmit;
  const onSend = useCallback(async (): Promise<void> => {
    if (sending.current) return;
    sending.current = true;
    try {
      await handleSubmit(sendBatches, () => toastService.error(t('marketplace.campaign.shipping.toast.fixFields')))();
    } finally {
      sending.current = false;
    }
  }, [handleSubmit, sendBatches, t]);

  // — Reads ——————————————————————————————————————————————————————————
  const refetch = query.refetch;
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);
  const onRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    board,
    campaignTitle: campaign.data?.title.trim() ?? '',
    // Loading is the first read only; a refetch keeps the manifest on screen.
    isLoading: !board && query.isFetching,
    error: query.error,
    noShipping: !board && query.isError && normalizeApiError(query.error).code === 'campaign_no_shipping',
    isRefreshing,
    onRefresh,
    onRetry,
    control: form.control,
    parcels,
    anyShippable: parcels.some(parcelCanShip),
    totals,
    revealed,
    courierItems,
    bulkItems,
    toggleSelected,
    setAllSelected,
    setCourierForAll,
    toggleReveal,
    copyAddress,
    onSend,
    batchError,
  };
};

export type BrandCampaignShippingModel = ReturnType<typeof useBrandCampaignShippingScreen>;
