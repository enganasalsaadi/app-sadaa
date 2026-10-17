import { CAMPAIGN_SHIPPING_BLOCKER, CAMPAIGN_SHIPPING_KIND } from '../types/campaignShipping';
import type {
  CampaignShipmentReport,
  CampaignShipmentResult,
  CampaignShippingBoard,
  CampaignShippingRow,
} from '../types/campaignShipping';
import type { CampaignShipmentReportDto, CampaignShippingDto } from '../types/campaignShippingDto';
import { mapShippingAddress, oneOf, toTimestampOrNull } from './dealMappers';

// DTO → domain for the shipping manifest (rule 04). Unknown enum values become `null` (labels still
// render); a malformed required time throws, never a wrong countdown.

const mapRow = (dto: CampaignShippingDto['deals'][number]): CampaignShippingRow => ({
  dealId: dto.deal_id,
  kind: oneOf(CAMPAIGN_SHIPPING_KIND, dto.kind),
  dealStatus: { key: dto.deal_status.key, label: dto.deal_status.label },
  slug: dto.creator.slug,
  name: dto.creator.display_name,
  avatarUrl: dto.creator.avatar_url,
  ready: dto.ready,
  blockers: dto.blockers.flatMap(blocker => {
    const known = oneOf(CAMPAIGN_SHIPPING_BLOCKER, blocker);
    return known ? [known] : [];
  }),
  shipFrom: toTimestampOrNull(dto.ship_from),
  shipBy: toTimestampOrNull(dto.ship_by),
  reshipmentsLeft: dto.reshipments_left,
  lastShipment: dto.last_shipment && {
    courier: dto.last_shipment.courier,
    trackingNo: dto.last_shipment.tracking_no,
  },
  address: dto.address ? mapShippingAddress(dto.address) : null,
});

export const mapCampaignShipping = (dto: CampaignShippingDto): CampaignShippingBoard => ({
  campaignId: dto.campaign_id,
  shippingMode: { key: dto.shipping_mode.key, label: dto.shipping_mode.label },
  totals: {
    awaiting: dto.totals.awaiting,
    ready: dto.totals.ready,
    blocked: dto.totals.blocked,
    shipped: dto.totals.shipped,
  },
  rows: dto.deals.map(mapRow),
});

const mapResult = (dto: CampaignShipmentReportDto['results'][number]): CampaignShipmentResult => {
  if (dto.ok) return { dealId: dto.deal_id, ok: true };
  return {
    dealId: dto.deal_id,
    ok: false,
    code: dto.error_code ?? null,
    message: dto.message ?? '',
    shipFrom: toTimestampOrNull(dto.meta?.ship_from),
  };
};

export const mapCampaignShipmentReport = (dto: CampaignShipmentReportDto): CampaignShipmentReport => ({
  total: dto.total,
  shipped: dto.shipped,
  failed: dto.failed,
  results: dto.results.map(mapResult),
});
