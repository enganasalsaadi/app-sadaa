import { campaignBatchTools } from '../campaignBatchTools';
import type { Campaign, CampaignStatus } from '../../types/campaign';

const campaign = (status: CampaignStatus | null, dropAt: number | null): Pick<Campaign, 'status' | 'dropAt'> => ({
  status: { key: status, label: 'x' },
  dropAt,
});

describe('campaignBatchTools', () => {
  it.each(['open', 'suspended', 'filled', 'closed', 'completed'] as const)('offers the launch room of a %s campaign with a drop', status => {
    expect(campaignBatchTools(campaign(status, 1))).toEqual({ drop: true, any: true });
  });

  it.each(['draft', 'pending_review', 'changes_requested', 'cancelled', 'rejected', 'removed'] as const)(
    'offers nothing while the campaign is %s',
    status => {
      expect(campaignBatchTools(campaign(status, 1))).toEqual({ drop: false, any: false });
    },
  );

  it('offers no launch room without a drop, or for a status it does not know', () => {
    expect(campaignBatchTools(campaign('open', null)).any).toBe(false);
    expect(campaignBatchTools(campaign(null, 1)).any).toBe(false);
  });
});
