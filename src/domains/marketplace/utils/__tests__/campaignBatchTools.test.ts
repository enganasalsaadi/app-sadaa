import { campaignBatchTools } from '../campaignBatchTools';
import type { Campaign, CampaignStatus } from '../../types/campaign';
import type { DealShippingMode } from '../../types/deal';

const campaign = (
  status: CampaignStatus | null,
  dropAt: number | null,
  mode: DealShippingMode | null = 'none',
  seatsOccupied = 0,
): Pick<Campaign, 'status' | 'dropAt' | 'shippingMode' | 'counters'> => ({
  status: { key: status, label: 'x' },
  dropAt,
  shippingMode: { key: mode, label: 'y' },
  counters: { applicationsOpen: 0, seatsOccupied },
});

describe('campaignBatchTools', () => {
  it.each(['open', 'suspended', 'filled', 'closed', 'completed'] as const)('offers the launch room of a %s campaign with a drop', status => {
    expect(campaignBatchTools(campaign(status, 1))).toEqual({ drop: true, shipping: false, announcements: false, any: true });
  });

  it.each(['draft', 'pending_review', 'changes_requested', 'cancelled', 'rejected', 'removed'] as const)(
    'offers nothing while the campaign is %s',
    status => {
      expect(campaignBatchTools(campaign(status, 1, 'gift'))).toEqual({ drop: false, shipping: false, announcements: false, any: false });
    },
  );

  it('offers no launch room without a drop, or for a status it does not know', () => {
    expect(campaignBatchTools(campaign('open', null)).any).toBe(false);
    expect(campaignBatchTools(campaign(null, 1)).any).toBe(false);
  });

  it.each(['gift', 'returnable'] as const)('offers the shipping manifest of a %s campaign, drop or not', mode => {
    expect(campaignBatchTools(campaign('open', null, mode))).toEqual({ drop: false, shipping: true, announcements: false, any: true });
    expect(campaignBatchTools(campaign('completed', 1, mode))).toEqual({ drop: true, shipping: true, announcements: false, any: true });
  });

  it('offers no shipping for a service campaign or a mode it does not know', () => {
    expect(campaignBatchTools(campaign('open', null, 'none')).shipping).toBe(false);
    expect(campaignBatchTools(campaign('open', null, null)).shipping).toBe(false);
  });

  it.each(['open', 'suspended', 'filled', 'closed', 'completed'] as const)(
    'offers the broadcasts of a %s campaign once a seat is taken, with or without a drop or shipping',
    status => {
      expect(campaignBatchTools(campaign(status, null, 'none', 1))).toEqual({
        drop: false,
        shipping: false,
        announcements: true,
        any: true,
      });
    },
  );

  it('offers no broadcast with no seat taken, or while the campaign is not live', () => {
    expect(campaignBatchTools(campaign('open', null, 'none', 0)).announcements).toBe(false);
    expect(campaignBatchTools(campaign('draft', null, 'none', 2)).announcements).toBe(false);
    expect(campaignBatchTools(campaign(null, null, 'none', 2)).announcements).toBe(false);
  });
});
