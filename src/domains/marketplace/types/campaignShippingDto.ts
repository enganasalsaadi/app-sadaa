import type { DealLabeledDto, DealShippingAddressDto } from './dealDto';

/** `GET /brand/campaigns/{id}/shipping` (contract §3.8). */
export interface CampaignShippingDto {
  campaign_id: string;
  shipping_mode: DealLabeledDto;
  totals: { awaiting: number; ready: number; blocked: number; shipped: number };
  deals: {
    deal_id: string;
    kind: string;
    deal_status: DealLabeledDto;
    creator: { slug: string | null; display_name: string | null; avatar_url: string | null };
    ready: boolean;
    blockers: string[];
    ship_from: string | null;
    ship_by: string | null;
    reshipments_left: number;
    last_shipment: { courier: string; tracking_no: string } | null;
    address: DealShippingAddressDto | null;
  }[];
}

/** `POST /brand/campaigns/{id}/shipments` answers 200 with a report per row. */
export interface CampaignShipmentReportDto {
  total: number;
  shipped: number;
  failed: number;
  results: (
    | { deal_id: string; ok: true }
    | {
        deal_id: string;
        ok: false;
        error_code?: string | null;
        message?: string | null;
        meta?: { ship_from?: string | null } | null;
      }
  )[];
}
