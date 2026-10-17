import type { DealShippingAddress, Labeled, Timestamp } from './deal';

// Batch shipping manifest (contract §3.8, CM9). Same stance as the other campaign types: an unknown
// enum value from a newer server maps to `null` and the server `label` still renders.

/** `first`: funded, nothing shipped yet. `reship`: the creator reported a problem; never blocked. */
export const CAMPAIGN_SHIPPING_KIND = ['first', 'reship'] as const;
export type CampaignShippingKind = (typeof CAMPAIGN_SHIPPING_KIND)[number];

/** Why a first shipment can't go yet. */
export const CAMPAIGN_SHIPPING_BLOCKER = ['brief_window', 'address_missing'] as const;
export type CampaignShippingBlocker = (typeof CAMPAIGN_SHIPPING_BLOCKER)[number];

export interface CampaignShippingTotals {
  awaiting: number;
  ready: number;
  blocked: number;
  shipped: number;
}

/** One parcel to send: a funded linked deal. */
export interface CampaignShippingRow {
  dealId: string;
  kind: CampaignShippingKind | null;
  dealStatus: Labeled<string>;
  slug: string | null;
  name: string | null;
  avatarUrl: string | null;
  ready: boolean;
  /** Known blockers only; a code this app doesn't know still keeps `ready` false. */
  blockers: CampaignShippingBlocker[];
  /** While the creator's brief review runs: the moment the first shipment opens. */
  shipFrom: Timestamp | null;
  shipBy: Timestamp | null;
  reshipmentsLeft: number;
  lastShipment: { courier: string; trackingNo: string } | null;
  /** PII (rule 07): read on demand, never logged or stored. */
  address: DealShippingAddress | null;
}

export interface CampaignShippingBoard {
  campaignId: string;
  shippingMode: Labeled<string>;
  totals: CampaignShippingTotals;
  rows: CampaignShippingRow[];
}

/** What the brand sends for one parcel (`POST /{id}/shipments`, `shipments[]`). */
export interface CampaignShipmentInput {
  dealId: string;
  courier: string;
  trackingNo: string;
  /** A well-formed https link, or `null` (left out of the body). */
  trackingUrl: string | null;
}

/** One row of the server's per-row report: it shipped, or it didn't and says why. */
export type CampaignShipmentResult =
  | { dealId: string; ok: true }
  | {
      dealId: string;
      ok: false;
      /** The deal error code (`campaign_brief_window_open`, `deal_address_missing`, …). */
      code: string | null;
      message: string;
      /** `campaign_brief_window_open`: when the first shipment opens. */
      shipFrom: Timestamp | null;
    };

export interface CampaignShipmentReport {
  total: number;
  shipped: number;
  failed: number;
  results: CampaignShipmentResult[];
}
