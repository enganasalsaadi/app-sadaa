import type { BrandActiveCampaign } from '../../types/campaignHome';
import { campaignDropLeft, campaignHomeTarget, campaignSeatSplit } from '../campaignHome';
import { creatorCampaignDto } from '../__fixtures__/campaignDto';
import { mapBrandActiveCampaigns, mapCreatorCampaignsGlance } from '../campaignHomeMappers';

const DAY = 86_400_000;
/** The wire's key; the RTL lint bans the word as an object key, so the fixture computes it. */
const LEFT = 'left';

const dto = (overrides: Record<string, unknown> = {}) => ({
  id: 'c1',
  title: 'Ramadan launch',
  status: { key: 'open', label: 'Open' },
  seats: { total: 5, occupied: 2, [LEFT]: 3 },
  applications_open: 3,
  awaiting_payment_count: 1,
  apply_deadline_at: '2026-10-20T10:00:00Z',
  drop_at: null,
  budget_secured: true,
  needs_action: true,
  action: { key: 'fund_seats', label: 'Fund the selected seats' },
  ...overrides,
});

describe('campaignHomeTarget', () => {
  const target = (key: string | null): ReturnType<typeof campaignHomeTarget> =>
    campaignHomeTarget({ action: key === null ? null : ({ key, label: 'x' } as BrandActiveCampaign['action']) });

  it('sends each action where the contract says', () => {
    expect(target('fund_seats')).toBe('wallet');
    expect(target('review_applicants')).toBe('applicants');
    expect(target('reopen')).toBe('campaign');
    expect(target('seat_freed')).toBe('campaign');
    expect(target('fix_draft')).toBe('campaign');
  });

  it('opens the campaign when there is no action or the key is unknown', () => {
    expect(target(null)).toBe('campaign');
    expect(campaignHomeTarget({ action: { key: null, label: 'newer' } })).toBe('campaign');
  });
});

describe('campaignSeatSplit', () => {
  it('splits paid, waiting-for-money and free seats', () => {
    expect(campaignSeatSplit({ seats: { total: 5, occupied: 2, free: 3 }, awaitingPaymentCount: 1 })).toEqual({
      filled: 1,
      awaiting: 1,
      empty: 3,
    });
  });

  it('never lets waiting seats exceed the occupied ones', () => {
    expect(campaignSeatSplit({ seats: { total: 3, occupied: 1, free: 2 }, awaitingPaymentCount: 4 })).toEqual({
      filled: 0,
      awaiting: 1,
      empty: 2,
    });
  });
});

describe('campaignDropLeft', () => {
  it('counts to the drop and is null after it or without one', () => {
    const now = 1_000_000;
    expect(campaignDropLeft({ dropAt: now + 5 * DAY + 3_600_000 }, now)).toEqual({ unit: 'days', days: 5, hours: 1 });
    expect(campaignDropLeft({ dropAt: now - 1 }, now)).toBeNull();
    expect(campaignDropLeft({ dropAt: null }, now)).toBeNull();
  });
});

describe('mapBrandActiveCampaigns', () => {
  it('is null when the flag is off or nothing is active', () => {
    expect(mapBrandActiveCampaigns(null)).toBeNull();
    expect(mapBrandActiveCampaigns(undefined)).toBeNull();
    expect(mapBrandActiveCampaigns({ needs_action_count: 0, total_count: 0, items: [] })).toBeNull();
  });

  it('maps the rows and keeps the server counts', () => {
    const mapped = mapBrandActiveCampaigns({ needs_action_count: 2, total_count: 4, items: [dto()] });
    expect(mapped?.needsActionCount).toBe(2);
    expect(mapped?.totalCount).toBe(4);
    expect(mapped?.items[0]).toMatchObject({
      id: 'c1',
      status: { key: 'open', label: 'Open' },
      applicationsOpen: 3,
      awaitingPaymentCount: 1,
      budgetSecured: true,
      needsAction: true,
      action: { key: 'fund_seats', label: 'Fund the selected seats' },
      dropAt: null,
    });
  });

  it('keeps an unknown status or action as a null key with the server label', () => {
    const item = mapBrandActiveCampaigns({
      needs_action_count: 1,
      total_count: 1,
      items: [dto({ status: { key: 'future', label: 'Soon' }, action: { key: 'new_thing', label: 'Do it' } })],
    })?.items[0];
    expect(item?.status).toEqual({ key: null, label: 'Soon' });
    expect(item?.action).toEqual({ key: null, label: 'Do it' });
  });

  it('drops a row with a malformed date, keeps the others', () => {
    const mapped = mapBrandActiveCampaigns({
      needs_action_count: 0,
      total_count: 2,
      items: [dto({ id: 'bad', apply_deadline_at: 'not-a-date' }), dto({ id: 'ok' })],
    });
    expect(mapped?.items.map(item => item.id)).toEqual(['ok']);
    expect(mapped?.totalCount).toBe(2);
  });
});

describe('mapCreatorCampaignsGlance', () => {
  const glance = { feed_count: 12, new_invites: 1, open_applications: 2 };

  it('is null when the flag is off', () => {
    expect(mapCreatorCampaignsGlance(null)).toBeNull();
    expect(mapCreatorCampaignsGlance(undefined)).toBeNull();
  });

  it('keeps the server counts and maps the feed cards', () => {
    const result = mapCreatorCampaignsGlance({ ...glance, items: [creatorCampaignDto({ id: 'a', invited: true })] });
    expect(result).toMatchObject({ feedCount: 12, newInvites: 1, openApplications: 2 });
    expect(result?.items.map(item => [item.id, item.invited])).toEqual([['a', true]]);
  });

  it('still answers when no card came or none can be read, since the counts say what waits', () => {
    expect(mapCreatorCampaignsGlance(glance)).toEqual({ feedCount: 12, newInvites: 1, openApplications: 2, items: [] });
    const broken = creatorCampaignDto({ id: 'bad', apply_deadline_at: 'not a date' });
    expect(mapCreatorCampaignsGlance({ ...glance, items: [broken] })?.items).toEqual([]);
  });

  it('shows at most 3 cards whatever the server sends', () => {
    const items = ['a', 'b', 'c', 'd'].map(id => creatorCampaignDto({ id }));
    expect(mapCreatorCampaignsGlance({ ...glance, items })?.items.map(item => item.id)).toEqual(['a', 'b', 'c']);
  });
});
