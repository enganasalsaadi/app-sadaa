import type { DealCourierChoice } from '../constants/dealShipping';
import type { DealShipFormValues } from '../schemas/dealShippingSchema';
import type { Timestamp } from '../types/deal';
import type {
  CampaignShipmentInput,
  CampaignShipmentReport,
  CampaignShippingRow,
  CampaignShippingTotals,
} from '../types/campaignShipping';
import { courierName, safeTrackingUrl } from './dealShipping';

/** The server takes 1–20 parcels per request (contract §3.8); more go in turns. */
export const CAMPAIGN_SHIPMENT_CHUNK = 20;

/** What the brand has typed for one parcel, kept in the form while the manifest is open. */
export interface CampaignShippingDraft extends DealShipFormValues {
  /** Ticked into the batch: its fields open and it ships on the next hold. */
  selected: boolean;
}

export interface CampaignShippingFormValues {
  rows: Record<string, CampaignShippingDraft>;
}

export const EMPTY_SHIPPING_DRAFT: CampaignShippingDraft = {
  selected: false,
  courier: null,
  courierName: '',
  trackingNo: '',
  trackingUrl: '',
};

/** A row the server refused after the batch went: what it said, kept on the row until it is sent again. */
export interface CampaignShippingFailure {
  code: string | null;
  message: string;
  /** `campaign_brief_window_open`: when the first shipment opens. */
  shipFrom: Timestamp | null;
}

/** A parcel that left in this visit; the manifest no longer lists it, so the row keeps what was sent. */
export interface CampaignShippingSent {
  row: CampaignShippingRow;
  courier: string;
  trackingNo: string;
  sentAt: number;
}

/**
 * Where a parcel stands on the manifest: `failed` and `ready` can ship, `locked` waits for the
 * creator (brief review or address), `sent` has left.
 */
export type CampaignParcelState = 'failed' | 'ready' | 'locked' | 'sent';

export interface CampaignParcel {
  row: CampaignShippingRow;
  state: CampaignParcelState;
  /** A re-ship after a reported problem: never locked. */
  reship: boolean;
  /** The creator's brief review still runs until then (first shipment only). */
  opensAt: Timestamp | null;
  addressMissing: boolean;
  failure: CampaignShippingFailure | null;
  sent: CampaignShippingSent | null;
}

/** Failed parcels first (they need a hand), then the ones to ship, then the locked, the sent last. */
const STATE_RANK = {
  failed: 0,
  ready: 1,
  locked: 2,
  sent: 3,
} as const satisfies Record<CampaignParcelState, number>;

const lockOf = (row: CampaignShippingRow, now: number, shipFromOverride: Timestamp | null) => {
  if (row.kind === 'reship') return { opensAt: null, addressMissing: false, locked: false };
  const from = shipFromOverride ?? row.shipFrom;
  // The clock may open the window before a stale copy of the manifest says so; the server re-checks.
  const briefOpen = from !== null ? from > now : row.blockers.includes('brief_window');
  const addressMissing = row.blockers.includes('address_missing');
  // The server says «not ready» for a reason this app doesn't know: honour it.
  const unknown = !row.ready && row.blockers.length === 0;
  return {
    opensAt: briefOpen && from !== null ? from : null,
    addressMissing,
    locked: briefOpen || addressMissing || unknown,
  };
};

/**
 * The manifest as the screen draws it: every listed row with its state at `now`, then the parcels
 * sent in this visit. A failed row that says the brief window is still open locks with the server's
 * `ship_from` (sending it again would only fail again).
 */
export const campaignParcels = (
  rows: readonly CampaignShippingRow[],
  failures: Readonly<Record<string, CampaignShippingFailure>>,
  sent: Readonly<Record<string, CampaignShippingSent>>,
  now: number,
): CampaignParcel[] => {
  const listed = new Set(rows.map(row => row.dealId));
  const open = rows.map<CampaignParcel>(row => {
    const done = sent[row.dealId] ?? null;
    const failure = failures[row.dealId] ?? null;
    const lock = lockOf(row, now, failure?.shipFrom ?? null);
    const state: CampaignParcelState = done ? 'sent' : lock.locked ? 'locked' : failure ? 'failed' : 'ready';
    return {
      row,
      state,
      reship: row.kind === 'reship',
      opensAt: lock.opensAt,
      addressMissing: lock.addressMissing,
      failure: state === 'locked' ? null : failure,
      sent: done,
    };
  });
  // Sent in this visit and already gone from a refreshed manifest.
  const gone = Object.values(sent)
    .filter(entry => !listed.has(entry.row.dealId))
    .map<CampaignParcel>(entry => ({
      row: entry.row,
      state: 'sent',
      reship: entry.row.kind === 'reship',
      opensAt: null,
      addressMissing: false,
      failure: null,
      sent: entry,
    }));
  const all = [...open, ...gone];
  // `sort` is stable: the server's order holds inside a state.
  return all.sort((a, b) => STATE_RANK[a.state] - STATE_RANK[b.state]);
};

/** The numbers over the list, from what is on screen; `shipped` is the server's plus this visit's. */
export const campaignShippingTotals = (
  parcels: readonly CampaignParcel[],
  shippedBefore: number,
): CampaignShippingTotals => {
  const pending = parcels.filter(parcel => parcel.state !== 'sent');
  const blocked = pending.filter(parcel => parcel.state === 'locked').length;
  return {
    awaiting: pending.length,
    ready: pending.length - blocked,
    blocked,
    shipped: shippedBefore,
  };
};

/** Whether the parcel can be ticked into a batch. */
export const parcelCanShip = (parcel: Pick<CampaignParcel, 'state'>): boolean =>
  parcel.state === 'ready' || parcel.state === 'failed';

/** The body rows of one batch, for the ticked parcels only; call on schema-valid drafts. */
export const buildShipmentInputs = (
  parcels: readonly CampaignParcel[],
  drafts: Readonly<Record<string, CampaignShippingDraft>>,
  labels: Readonly<Record<DealCourierChoice, string>>,
): CampaignShipmentInput[] =>
  parcels.flatMap(parcel => {
    const draft = drafts[parcel.row.dealId];
    if (!draft?.selected || !parcelCanShip(parcel)) return [];
    return [
      {
        dealId: parcel.row.dealId,
        courier: courierName(draft, labels),
        trackingNo: draft.trackingNo.trim(),
        trackingUrl: safeTrackingUrl(draft.trackingUrl),
      },
    ];
  });

export const chunkShipments = <T>(items: readonly T[], size: number = CAMPAIGN_SHIPMENT_CHUNK): T[][] => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
};

/** Idempotency identity of a chunk: the same parcels with the same waybills replay, an edit is a new intent. */
export const shipmentChunkSignature = (chunk: readonly CampaignShipmentInput[]): string => JSON.stringify(chunk);

/** One report from the reports of the chunks, in the order they went. */
export const mergeShipmentReports = (reports: readonly CampaignShipmentReport[]): CampaignShipmentReport =>
  reports.reduce<CampaignShipmentReport>(
    (merged, report) => ({
      total: merged.total + report.total,
      shipped: merged.shipped + report.shipped,
      failed: merged.failed + report.failed,
      results: [...merged.results, ...report.results],
    }),
    { total: 0, shipped: 0, failed: 0, results: [] },
  );

/** The next moment a locked parcel opens, to wake the screen exactly then. */
export const nextParcelOpening = (parcels: readonly CampaignParcel[], now: number): Timestamp | null =>
  parcels.reduce<Timestamp | null>((next, parcel) => {
    const at = parcel.opensAt;
    return at !== null && at > now && (next === null || at < next) ? at : next;
  }, null);
