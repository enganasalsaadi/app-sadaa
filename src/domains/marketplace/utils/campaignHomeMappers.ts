import { CAMPAIGN_STATUS } from '../types/campaign';
import {
  BRAND_CAMPAIGN_ACTION,
  type BrandActiveCampaign,
  type BrandActiveCampaignDto,
  type BrandActiveCampaigns,
  type BrandActiveCampaignsDto,
} from '../types/campaignHome';
import { toLabeled, toLabeledOrNull, toTimestampOrNull } from './dealMappers';

export const mapBrandActiveCampaign = (dto: BrandActiveCampaignDto): BrandActiveCampaign => ({
  id: dto.id,
  title: dto.title,
  status: toLabeled(CAMPAIGN_STATUS, dto.status),
  seats: { total: dto.seats.total, occupied: dto.seats.occupied, free: dto.seats.left },
  applicationsOpen: dto.applications_open,
  awaitingPaymentCount: dto.awaiting_payment_count,
  applyDeadlineAt: toTimestampOrNull(dto.apply_deadline_at),
  dropAt: toTimestampOrNull(dto.drop_at),
  budgetSecured: dto.budget_secured,
  needsAction: dto.needs_action,
  action: toLabeledOrNull(BRAND_CAMPAIGN_ACTION, dto.action),
});

/**
 * `null` (flag off, nothing active, or no row readable) hides the rail. A row with a malformed
 * date is dropped rather than shown wrong; the counts stay the server's.
 */
export const mapBrandActiveCampaigns = (
  dto: BrandActiveCampaignsDto | null | undefined,
): BrandActiveCampaigns | null => {
  if (!dto) return null;
  const items = dto.items.flatMap(item => {
    try {
      return [mapBrandActiveCampaign(item)];
    } catch {
      return [];
    }
  });
  if (items.length === 0) return null;
  return { needsActionCount: dto.needs_action_count, totalCount: dto.total_count, items };
};
