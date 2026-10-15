import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { DEFAULT_PHONE_COUNTRY } from '@/core/config';
import { DEAL_COURIER_PRESETS, type DealCourierChoice } from '../constants/dealShipping';
import type {
  DealAddressFormValues,
  DealShipFormValues,
} from '../schemas/dealShippingSchema';
import type {
  Deal,
  DealRole,
  DealShipment,
  DealShippingAddress,
  Timestamp,
} from '../types';

const DAY_MS = 86_400_000;

/**
 * Where the shipping section stands, from the viewer's side (M5). `address`: signed, not funded
 * yet (creator only, their own address). `toShip`: funded, nothing on the way. `inTransit`: the
 * latest shipment is on its way. `issue`: the creator reported it. `received`: the product
 * arrived and the work went on (a small receipt row).
 */
export type DealShippingPhase = 'address' | 'toShip' | 'inTransit' | 'issue' | 'received';

export interface DealShippingView {
  phase: DealShippingPhase;
  /** The latest shipment (the received one once `received`). */
  current: DealShipment | null;
  /** Older shipments, newest first. */
  earlier: DealShipment[];
  address: DealShippingAddress | null;
  addressEditable: boolean;
  shipBy: Timestamp | null;
  reshipsLeft: number;
  /** Creator only: the free cancel (missed ship window or unanswered issue) is open now. */
  freeCancel: boolean;
}

type ShippingInput = Pick<Deal, 'status' | 'shippingMode' | 'shipping'>;

/** Before the money is held the creator may still fix the address; nothing ships yet. */
const SIGNED_UNFUNDED = new Set(['negotiating_deadline', 'awaiting_payment', 'escrow_locked']);

const isInTransit = (shipment: DealShipment | null): boolean =>
  shipment !== null && shipment.receivedAt === null && shipment.issue === null;

export const dealShippingView = (
  deal: ShippingInput,
  role: DealRole,
  now: number,
): DealShippingView | null => {
  const { shipping } = deal;
  if (!shipping || deal.shippingMode.key === null || deal.shippingMode.key === 'none') return null;
  const ordered = [...shipping.shipments].sort((a, b) => b.sequence - a.sequence);
  const latest = ordered[0] ?? null;
  const status = deal.status.key;
  const shippingNow = status === 'product_shipping' || status === 'shipping_issue';
  const base = {
    address: shipping.address,
    addressEditable: role === 'creator' && shipping.addressEditable,
    shipBy: shipping.shipBy,
    reshipsLeft: shipping.reshipsLeft,
    freeCancel:
      role === 'creator' &&
      shippingNow &&
      shipping.freeCancelFrom !== null &&
      shipping.freeCancelFrom <= now,
  };
  const view = (phase: DealShippingPhase, current: DealShipment | null): DealShippingView => ({
    ...base,
    phase,
    current,
    earlier: ordered.filter(shipment => shipment !== current),
  });

  if (status === 'product_shipping') {
    return isInTransit(latest) ? view('inTransit', latest) : view('toShip', null);
  }
  if (status === 'shipping_issue') {
    return latest?.issue ? view('issue', latest) : view('toShip', null);
  }
  if (status !== null && SIGNED_UNFUNDED.has(status)) {
    return role === 'creator' && shipping.address ? view('address', null) : null;
  }
  const received = ordered.find(shipment => shipment.receivedAt !== null) ?? null;
  return received ? view('received', received) : null;
};

/** The shipping decision bar under the deal page; `null` when nobody has to act here. */
export type DealShippingDockKind =
  | 'brandShip'
  | 'brandAnswerIssue'
  | 'creatorReceive'
  | 'creatorFreeCancel'
  | 'creatorAddress';

export const dealShippingDock = (
  view: DealShippingView | null,
  role: DealRole,
): DealShippingDockKind | null => {
  if (!view) return null;
  if (role === 'brand') {
    if (view.phase === 'toShip') return 'brandShip';
    if (view.phase === 'issue') return 'brandAnswerIssue';
    return null;
  }
  if (view.phase === 'inTransit') return 'creatorReceive';
  if (view.freeCancel) return 'creatorFreeCancel';
  if (view.phase === 'toShip' && view.address === null && view.addressEditable) return 'creatorAddress';
  return null;
};

/** Whole days on the way, counted up to the day a delay can be reported (the server's date). */
export interface DealTransitDays {
  elapsed: number;
  total: number;
  reportFrom: Timestamp;
  /** A «delayed» report is accepted now. */
  reportOpen: boolean;
  /** Whole days until it is (0 once open). */
  daysToReport: number;
}

export const transitDays = (shipment: DealShipment, now: number): DealTransitDays => {
  const total = Math.max(1, Math.round((shipment.delayedReportFrom - shipment.shippedAt) / DAY_MS));
  const elapsed = Math.min(total, Math.max(0, Math.floor((now - shipment.shippedAt) / DAY_MS)));
  const reportOpen = now >= shipment.delayedReportFrom;
  return {
    elapsed,
    total,
    reportFrom: shipment.delayedReportFrom,
    reportOpen,
    daysToReport: reportOpen ? 0 : Math.ceil((shipment.delayedReportFrom - now) / DAY_MS),
  };
};

// https only, no userinfo or port tricks. RN's URL polyfill has no reliable `hostname`.
const TRACKING_URL = /^https:\/\/([a-z0-9.-]+)(?::\d{1,5})?([/?#]\S*)?$/i;
const DOMAIN = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

/**
 * A courier's tracking link the app may open. Couriers are too many and too local for a host
 * allow-list (rule 07 exception, approved 2026-10-15): any well-formed https link, nothing else.
 */
export const safeTrackingUrl = (raw: string | null): string | null => {
  const url = raw?.trim() ?? '';
  const host = TRACKING_URL.exec(url)?.[1]?.toLowerCase() ?? '';
  return DOMAIN.test(host) ? url : null;
};

/** E.164 of a typed Syrian mobile ("0944…", "944…"), or `null`. Mirrors the server's rule. */
const SYRIAN_MOBILE = /^\+9639\d{8}$/;

export const toSyrianMobile = (national: string): string | null => {
  const e164 = parsePhoneNumberFromString(national, DEFAULT_PHONE_COUNTRY)?.number;
  return e164 && SYRIAN_MOBILE.test(e164) ? e164 : null;
};

const toNationalPhone = (e164: string | null | undefined): string =>
  (e164 && parsePhoneNumberFromString(e164)?.nationalNumber) || '';

/** What the address form starts from: the deal's address, else the last one used, else the account. */
export const addressFormValues = (
  address: DealShippingAddress | null,
  fallback: { name?: string | null; phone?: string | null },
): DealAddressFormValues => ({
  recipientName: address?.recipientName ?? fallback.name ?? '',
  phone: toNationalPhone(address?.phone ?? fallback.phone),
  governorateId: address?.governorate?.id ?? '',
  city: address?.city ?? '',
  area: address?.area ?? '',
  addressLine: address?.addressLine ?? '',
  landmark: address?.landmark ?? '',
  notes: address?.notes ?? '',
});

/** The server's address body (B5.1); call only on schema-valid values. */
export const toAddressBody = (values: DealAddressFormValues): Record<string, string | null> => ({
  recipient_name: values.recipientName.trim(),
  phone: toSyrianMobile(values.phone) ?? values.phone,
  governorate_id: values.governorateId,
  city: values.city.trim(),
  area: values.area.trim(),
  address_line: values.addressLine.trim(),
  landmark: values.landmark.trim() || null,
  notes: values.notes.trim() || null,
});

/** Server 422 keys → address form fields; accept / extension prefix them with `shipping_address.`. */
export const addressFieldMap = (prefix = '') =>
  ({
    [`${prefix}recipient_name`]: 'recipientName',
    [`${prefix}phone`]: 'phone',
    [`${prefix}governorate_id`]: 'governorateId',
    [`${prefix}city`]: 'city',
    [`${prefix}area`]: 'area',
    [`${prefix}address_line`]: 'addressLine',
    [`${prefix}landmark`]: 'landmark',
    [`${prefix}notes`]: 'notes',
  }) as const satisfies Record<string, keyof DealAddressFormValues>;

/** The lines a courier reads, in order: area and city, the street line, the landmark. */
export const addressPlace = (address: DealShippingAddress): string =>
  [address.area, address.city, address.governorate?.label]
    .filter((part, index, parts): part is string => Boolean(part) && parts.indexOf(part) === index)
    .join('، ');

/** The whole address as one text, for the brand to paste to the courier. */
export const addressText = (address: DealShippingAddress): string =>
  [
    address.recipientName,
    address.phone,
    addressPlace(address),
    address.addressLine,
    address.landmark,
    address.notes,
  ]
    .filter(Boolean)
    .join('\n');

/** Which chip an existing courier name lands on: a preset by its label, else «other». */
export const courierChoiceOf = (
  name: string,
  labels: Readonly<Record<DealCourierChoice, string>>,
): DealCourierChoice => {
  const trimmed = name.trim();
  return DEAL_COURIER_PRESETS.find(preset => labels[preset] === trimmed) ?? 'other';
};

export const shipFormValues = (
  shipment: DealShipment | null,
  labels: Readonly<Record<DealCourierChoice, string>>,
): DealShipFormValues => {
  if (!shipment) return { courier: null, courierName: '', trackingNo: '', trackingUrl: '' };
  const courier = courierChoiceOf(shipment.courier, labels);
  return {
    courier,
    courierName: courier === 'other' ? shipment.courier : '',
    trackingNo: shipment.trackingNo,
    trackingUrl: shipment.trackingUrl ?? '',
  };
};

/** The courier's name as sent and shown: the preset's label, or what the brand typed. */
export const courierName = (
  values: Pick<DealShipFormValues, 'courier' | 'courierName'>,
  labels: Readonly<Record<DealCourierChoice, string>>,
): string => {
  if (values.courier === null) return '';
  return values.courier === 'other' ? values.courierName.trim() : labels[values.courier];
};

/**
 * `POST|PUT …/shipment` body; call only on schema-valid values. An edit sends a cleared link as
 * `null` so the old one goes; a new shipment just leaves it out.
 */
export const toShipmentBody = (
  values: DealShipFormValues,
  labels: Readonly<Record<DealCourierChoice, string>>,
  editing: boolean,
): Record<string, string | null> => {
  const url = safeTrackingUrl(values.trackingUrl);
  return {
    courier: courierName(values, labels),
    tracking_no: values.trackingNo.trim(),
    ...(url || editing ? { tracking_url: url } : {}),
  };
};
