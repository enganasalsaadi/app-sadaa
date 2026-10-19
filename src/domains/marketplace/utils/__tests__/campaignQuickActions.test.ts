import { mapCampaignDetail } from '../campaignMappers';
import { campaignQuickActions, isDangerQuickAction } from '../campaignQuickActions';
import { detailDto, label, T0 } from '../__fixtures__/campaignDto';

const now = Date.parse(T0);
const campaign = (overrides = {}) =>
  mapCampaignDetail(detailDto({ counters: { applications_open: 2, seats_occupied: 0 }, ...overrides }));
const quick = (overrides = {}) => campaignQuickActions(campaign(overrides), now);

describe('campaignQuickActions', () => {
  it('offers an open campaign its common edits, four at most', () => {
    expect(quick()).toEqual(['extendDeadline', 'addSeats', 'edit', 'duplicate']);
  });

  it('leads a suspended campaign with its reopen, ending it with the word the menu uses', () => {
    expect(quick({ status: label('suspended') })).toEqual(['reopen', 'duplicate', 'cancel']);
    expect(
      quick({ status: label('suspended'), counters: { applications_open: 0, seats_occupied: 2 } }),
    ).toEqual(['reopen', 'duplicate', 'close']);
  });

  it('leads a filled or closed campaign with its creators', () => {
    const counters = { applications_open: 0, seats_occupied: 5 };
    expect(quick({ status: label('filled'), counters })).toEqual(['creators', 'addSeats', 'edit', 'duplicate']);
    expect(quick({ status: label('closed'), counters })).toEqual(['creators', 'duplicate']);
  });

  it('drops an action that cannot run now', () => {
    expect(quick({ seats_total: 20 })).toEqual(['extendDeadline', 'edit', 'duplicate']);
  });

  it('keeps a draft to resuming, copying and deleting', () => {
    expect(quick({ status: label('draft') })).toEqual(['resume', 'duplicate', 'delete']);
    expect(quick({ status: label('changes_requested') })).toEqual(['resume', 'duplicate', 'cancel']);
  });

  it('only copies a campaign in review, finished or of an unknown status', () => {
    ['pending_review', 'completed', 'cancelled', 'rejected', 'removed', 'brand_new'].forEach(key => {
      expect(quick({ status: label(key) })).toEqual(['duplicate']);
    });
  });

  it('draws the ones that end or erase in the danger color', () => {
    expect(['close', 'cancel', 'delete'].every(action => isDangerQuickAction(action as 'close'))).toBe(true);
    expect(isDangerQuickAction('duplicate')).toBe(false);
  });
});
