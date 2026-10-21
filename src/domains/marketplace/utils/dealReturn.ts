import type { HueTone } from '@/core/theme';
import {
  DEAL_RETURN_EARLIER_DAYS,
  DEAL_RETURN_STATUS_META,
  DEAL_RETURN_WINDOW_DAYS,
  UNKNOWN_DEAL_RETURN_STATUS_META,
} from '../constants/dealReturn';
import type { MarketCourier } from '@/core/market';
import { DEAL_COURIER_OTHER } from '../constants/dealShipping';
import type { DealReturnFormValues } from '../schemas/dealReturnSchema';
import type { Deal, DealReturnShipment, DealReturnStatus, Timestamp } from '../types';
import { courierChoiceOf, safeTrackingUrl, toCourierFields } from './dealShipping';

const DAY_MS = 86_400_000;

export interface DealReturnView {
  /** The server's own label is the title; this is only for the colour. */
  tone: HueTone;
  progress: number;
  moving: boolean;
  /** The waybill is owed and its time has run out: the lock stays and a strike was recorded. */
  late: boolean;
  /** The creator may still enter or change the waybill. */
  creatorCanEdit: boolean;
  /** The brand may still answer (receive, report, waive). */
  brandCanAnswer: boolean;
  /** Waybill due date while it is owed. */
  dueAt: Timestamp | null;
  /** Share of the waybill window already used, 0–1 (display only). */
  dueShare: number;
  /** The brand's silence ends here; only while the parcel is on its way. */
  confirmBy: Timestamp | null;
  /** The creator is still locked out of public campaigns and direct offers. */
  locksCreator: boolean;
  /** The sample is the creator's to keep. */
  kept: boolean;
}

/**
 * The return card's reading of `return_shipment` (PC9.0 · contract §5.5). Titles are the server's
 * `status.label`; this decides tone, where the parcel sits and who may do what. `null` for a deal
 * with no return (a gift, or a campaign that doesn't ask for the sample back).
 */
export const dealReturnView = (
  deal: Pick<Deal, 'returnShipment'>,
  now: number,
): DealReturnView | null => {
  const ship = deal.returnShipment;
  if (!ship) return null;
  const key = ship.status.key;
  const meta = key === null ? UNKNOWN_DEAL_RETURN_STATUS_META : DEAL_RETURN_STATUS_META[key];
  const awaiting = key === 'awaiting_waybill';
  const dueAt = awaiting ? ship.waybillDueAt : null;
  const late = awaiting && (ship.overdue || (dueAt !== null && dueAt <= now));
  const windowMs = DEAL_RETURN_WINDOW_DAYS * DAY_MS;
  return {
    tone: late ? 'danger' : meta.tone,
    progress: meta.progress,
    moving: meta.moving,
    late,
    creatorCanEdit: meta.editable,
    brandCanAnswer: key === 'awaiting_waybill' || key === 'shipped',
    dueAt,
    dueShare: dueAt === null ? 0 : Math.min(1, Math.max(0, 1 - (dueAt - now) / windowMs)),
    confirmBy: key === 'shipped' ? ship.confirmBy : null,
    locksCreator: awaiting,
    kept: key === 'waived',
  };
};

export interface DealReturnAnswers {
  receive: boolean;
  issue: boolean;
  waive: boolean;
}

/**
 * Which answers the brand may give (contract §5.5): receipt and a problem report need the waybill
 * on file (`shipped`); letting the sample go works from the moment the return opens until receipt
 * is confirmed. Anything else (done, reported, waived, unknown) is closed. The server re-checks
 * (`409 deal_return_unavailable`).
 */
export const dealReturnAnswers = (key: DealReturnStatus | null): DealReturnAnswers => ({
  receive: key === 'shipped',
  issue: key === 'shipped',
  waive: key === 'awaiting_waybill' || key === 'shipped',
});

/** Fields the sheet starts from: a fresh waybill, or the one on file when the creator edits it. */
export const returnFormValues = (
  ship: DealReturnShipment | null,
  couriers: readonly MarketCourier[],
  now: number,
): DealReturnFormValues => {
  const base = { handed: 'today' as const, handedDays: DEAL_RETURN_EARLIER_DAYS.min };
  if (!ship?.courier) return { courier: null, courierName: '', trackingNo: '', trackingUrl: '', ...base };
  const courier = courierChoiceOf(ship.courier, couriers);
  const daysAgo = ship.handedAt === null ? 0 : Math.floor((now - ship.handedAt) / DAY_MS);
  return {
    courier,
    courierName: courier === DEAL_COURIER_OTHER ? ship.courier : '',
    trackingNo: ship.trackingNo ?? '',
    trackingUrl: ship.trackingUrl ?? '',
    handed: daysAgo >= 2 ? 'earlier' : daysAgo === 1 ? 'yesterday' : 'today',
    handedDays: Math.min(DEAL_RETURN_EARLIER_DAYS.max, Math.max(DEAL_RETURN_EARLIER_DAYS.min, daysAgo)),
  };
};

/** The day the parcel was handed over, as an offset from now: never in the future. */
export const handedDaysAgo = (values: Pick<DealReturnFormValues, 'handed' | 'handedDays'>): number =>
  values.handed === 'today' ? 0 : values.handed === 'yesterday' ? 1 : values.handedDays;

/**
 * `POST …/return-shipment` body, for schema-valid values. A cleared link is left out; «today» leaves
 * `handed_at` out too (the server counts the handover from the request).
 */
export const toReturnBody = (
  values: DealReturnFormValues,
  now: number,
): Record<string, string> => {
  const url = safeTrackingUrl(values.trackingUrl);
  const days = handedDaysAgo(values);
  const { courier, courierName: typed } = toCourierFields(values);
  return {
    courier,
    ...(typed ? { courier_name: typed } : {}),
    tracking_no: values.trackingNo.trim(),
    ...(url ? { tracking_url: url } : {}),
    ...(days > 0 ? { handed_at: new Date(now - days * DAY_MS).toISOString() } : {}),
  };
};
