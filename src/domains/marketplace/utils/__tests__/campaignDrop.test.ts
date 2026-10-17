import type { CampaignDropBoard, CampaignDropCreator, CampaignDropState } from '../../types/campaignDrop';
import {
  campaignDropChips,
  campaignDropClockParts,
  campaignDropVerifiedShare,
  campaignDropView,
  filterDropLanes,
  secondsBetween,
  sortDropBar,
  sortDropLanes,
  sortDropReminders,
} from '../campaignDrop';

const OPENS = 1_000_000;
const DROP = 2_000_000;

const board = (phase: CampaignDropBoard['phase']): CampaignDropBoard => ({
  campaignId: 'c1',
  dropAt: DROP,
  publishOpensAt: OPENS,
  draftDueAt: 500_000,
  phase,
  reminders: [],
  totals: {
    linked: 0,
    awaiting_payment: 0,
    working: 0,
    in_review: 0,
    late: 0,
    verified: 0,
    defaulted: 0,
    ended: 0,
  },
  creators: [],
});

const creator = (dealId: string, state: CampaignDropState | null, lateUntil: number | null = null): CampaignDropCreator => ({
  dealId,
  state: { key: state, label: dealId },
  dealStatus: { key: 'in_progress', label: 'x' },
  slug: null,
  name: dealId,
  avatarUrl: null,
  items: { total: 2, inReview: 0, verified: 0 },
  dueAt: null,
  lateUntil,
});

describe('campaignDropView', () => {
  it('counts to the live link first, with the drop as the second line', () => {
    expect(campaignDropView(board('upcoming'), OPENS - 1)).toEqual({
      phase: 'upcoming',
      next: { moment: 'publish_open', at: OPENS },
      then: DROP,
    });
  });

  it('counts to the drop once the live link is open', () => {
    expect(campaignDropView(board('publish_open'), OPENS + 1)).toEqual({
      phase: 'publish_open',
      next: { moment: 'drop', at: DROP },
      then: null,
    });
  });

  it('goes on air at the drop', () => {
    expect(campaignDropView(board('upcoming'), DROP)).toEqual({ phase: 'live', next: null, then: null });
  });

  it('moves forward from a stale copy by the clock, never back from the server’s phase', () => {
    expect(campaignDropView(board('upcoming'), OPENS).phase).toBe('publish_open');
    expect(campaignDropView(board('live'), OPENS - 500).phase).toBe('live');
    expect(campaignDropView(board(null), OPENS - 1).phase).toBe('upcoming');
  });
});

describe('sortDropLanes', () => {
  it('puts late creators first, the soonest grace ending leading, then keeps the live work ahead of the settled', () => {
    const rows = [
      creator('verified', 'verified'),
      creator('working', 'working'),
      creator('late-b', 'late', 900),
      creator('late-a', 'late', 100),
      creator('unknown', null),
      creator('review', 'in_review'),
    ];
    expect(sortDropLanes(rows).map(row => row.dealId)).toEqual([
      'late-a',
      'late-b',
      'working',
      'review',
      'verified',
      'unknown',
    ]);
  });

  it('keeps the server order between equals and leaves the input alone', () => {
    const rows = [creator('b', 'working'), creator('a', 'working')];
    expect(sortDropLanes(rows).map(row => row.dealId)).toEqual(['b', 'a']);
    expect(rows.map(row => row.dealId)).toEqual(['b', 'a']);
  });
});

describe('sortDropBar', () => {
  it('reads as progress toward live: verified, in review, working, late, awaiting payment', () => {
    const rows = [
      creator('pay', 'awaiting_payment'),
      creator('late', 'late'),
      creator('work', 'working'),
      creator('ok', 'verified'),
      creator('rev', 'in_review'),
    ];
    expect(sortDropBar(rows).map(row => row.dealId)).toEqual(['ok', 'rev', 'work', 'late', 'pay']);
  });
});

describe('campaignDropChips / filterDropLanes', () => {
  const totals = { ...board(null).totals, linked: 4, working: 2, late: 1, verified: 1 };

  it('lists «all» then only the states that have creators, counted from the totals', () => {
    expect(campaignDropChips(totals)).toEqual([
      { key: 'all', count: 4 },
      { key: 'late', count: 1 },
      { key: 'working', count: 2 },
      { key: 'verified', count: 1 },
    ]);
  });

  it('filters by state and keeps everyone for «all»', () => {
    const rows = [creator('a', 'working'), creator('b', 'late'), creator('c', null)];
    expect(filterDropLanes(rows, 'working').map(row => row.dealId)).toEqual(['a']);
    expect(filterDropLanes(rows, 'all')).toHaveLength(3);
  });
});

describe('campaignDropVerifiedShare', () => {
  it('is verified over linked, 0 with nobody linked', () => {
    expect(campaignDropVerifiedShare({ ...board(null).totals, linked: 4, verified: 3 })).toBe(0.75);
    expect(campaignDropVerifiedShare(board(null).totals)).toBe(0);
  });
});

describe('sortDropReminders', () => {
  it('orders the longest lead first without touching the input', () => {
    const reminders = [
      { minutesBefore: 0, at: 3, sent: false },
      { minutesBefore: 1440, at: 1, sent: true },
      { minutesBefore: 120, at: 2, sent: false },
    ];
    expect(sortDropReminders(reminders).map(r => r.minutesBefore)).toEqual([1440, 120, 0]);
    expect(reminders[0]?.minutesBefore).toBe(0);
  });
});

describe('campaignDropClockParts / secondsBetween', () => {
  it('splits seconds into days, hours, minutes and seconds', () => {
    expect(campaignDropClockParts(2 * 86_400 + 3 * 3600 + 4 * 60 + 5)).toEqual({ days: 2, hours: 3, minutes: 4, seconds: 5 });
    expect(campaignDropClockParts(-5)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it('never goes negative', () => {
    expect(secondsBetween(0, 1500)).toBe(2);
    expect(secondsBetween(5000, 0)).toBe(0);
  });
});
