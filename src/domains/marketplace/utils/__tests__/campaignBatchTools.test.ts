import { campaignBatchTools } from '../campaignBatchTools';
import type { Campaign, CampaignStatus } from '../../types/campaign';
import type { DealShippingMode } from '../../types/deal';

const campaign = (
  status: CampaignStatus | null,
  dropAt: number | null,
  mode: DealShippingMode | null = 'none',
): Pick<Campaign, 'status' | 'dropAt' | 'shippingMode'> => ({
  status: { key: status, label: 'x' },
  dropAt,
  shippingMode: { key: mode, label: 'y' },
});

describe('campaignBatchTools', () => {
  it.each(['open', 'suspended', 'filled', 'closed', 'completed'] as const)('offers the launch room of a %s campaign with a drop', status => {
    expect(campaignBatchTools(campaign(status, 1))).toEqual({ drop: true, shipping: false, any: true });
  });

  it.each(['draft', 'pending_review', 'changes_requested', 'cancelled', 'rejected', 'removed'] as const)(
    'offers nothing while the campaign is %s',
    status => {
      expect(campaignBatchTools(campaign(status, 1, 'gift'))).toEqual({ drop: false, shipping: false, any: false });
    },
  );

  it('offers no launch room without a drop, or for a status it does not know', () => {
    expect(campaignBatchTools(campaign('open', null)).any).toBe(false);
    expect(campaignBatchTools(campaign(null, 1)).any).toBe(false);
  });

  it.each(['gift', 'returnable'] as const)('offers the shipping manifest of a %s campaign, drop or not', mode => {
    expect(campaignBatchTools(campaign('open', null, mode))).toEqual({ drop: false, shipping: true, any: true });
    expect(campaignBatchTools(campaign('completed', 1, mode))).toEqual({ drop: true, shipping: true, any: true });
  });

  it('offers no shipping for a service campaign or a mode it does not know', () => {
    expect(campaignBatchTools(campaign('open', null, 'none')).shipping).toBe(false);
    expect(campaignBatchTools(campaign('open', null, null)).shipping).toBe(false);
  });
});
