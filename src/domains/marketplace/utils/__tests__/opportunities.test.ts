import { mapCreatorCampaign } from '../campaignMappers';
import {
  applyAction,
  countActiveFeedFilters,
  deadlineRemaining,
  genderRequiredReason,
  isAlreadyApplied,
  netHeadline,
  netShare,
  opportunityDeadline,
  setBookmarkedIn,
  toFeedArgs,
} from '../opportunities';
import { creatorCampaignDto, label } from '../__fixtures__/campaignDto';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const breakdown = (gross: string, fee: string, net: string) => ({ gross_usd: gross, fee_usd: fee, net_usd: net });
const card = (overrides = {}) => mapCreatorCampaign(creatorCampaignDto(overrides));

describe('netHeadline', () => {
  it('leads a fixed price with the net, not the gross', () => {
    const headline = netHeadline(card().pricing);
    expect(headline).toEqual({ kind: 'fixed', net: { amount: 9000, currency: 'USD' } });
  });

  it('shows a bid as the span between the nets of its ends', () => {
    const pricing = card({
      pricing: {
        model: label('bidding'),
        fee_bps: 1000,
        fixed: null,
        bid: { min: breakdown('60.00', '6.00', '54.00'), max: breakdown('200.00', '20.00', '180.00') },
      },
    }).pricing;
    expect(netHeadline(pricing)).toEqual({
      kind: 'range',
      min: { amount: 5400, currency: 'USD' },
      max: { amount: 18000, currency: 'USD' },
    });
  });

  it('reads a bid whose ends meet as one number', () => {
    const same = breakdown('100.00', '10.00', '90.00');
    const pricing = card({ pricing: { model: label('bidding'), fee_bps: 1000, fixed: null, bid: { min: same, max: same } } }).pricing;
    expect(netHeadline(pricing)?.kind).toBe('fixed');
  });

  it('has no headline without a price', () => {
    expect(netHeadline({ ...card().pricing, fixed: null, bid: null })).toBeNull();
  });
});

describe('deadlineRemaining', () => {
  it('drains from 1 at publish to 0 at the deadline', () => {
    expect(deadlineRemaining(0, 10 * DAY, 0)).toBe(1);
    expect(deadlineRemaining(0, 10 * DAY, 5 * DAY)).toBe(0.5);
    expect(deadlineRemaining(0, 10 * DAY, 12 * DAY)).toBe(0);
  });

  it('is unknown without both ends or with an inverted window', () => {
    expect(deadlineRemaining(null, DAY, 0)).toBeNull();
    expect(deadlineRemaining(0, null, 0)).toBeNull();
    expect(deadlineRemaining(DAY, 0, 0)).toBeNull();
  });
});

describe('opportunityDeadline', () => {
  it('counts whole days calmly', () => {
    expect(opportunityDeadline(3 * DAY + 5 * HOUR, 0)).toEqual({ unit: 'days', count: 3, urgent: false });
  });

  it('counts hours once under a day and runs warm', () => {
    expect(opportunityDeadline(5 * HOUR + 10_000, 0)).toEqual({ unit: 'hours', count: 5, urgent: true });
  });

  it('says last hour under an hour, and nothing once closed or unset', () => {
    expect(opportunityDeadline(HOUR / 2, 0)).toEqual({ unit: 'lastHour', urgent: true });
    expect(opportunityDeadline(1_000, 2_000)).toBeNull();
    expect(opportunityDeadline(null, 0)).toBeNull();
  });
});

describe('genderRequiredReason', () => {
  it('finds the reason that sends the creator to their profile', () => {
    const reason = { key: 'gender_required', label: 'حدّد جنسك', meta: {} };
    expect(genderRequiredReason(card({ eligibility: { eligible: false, reasons: [reason] } }))?.label).toBe('حدّد جنسك');
  });

  it('is null for an eligible campaign or other reasons', () => {
    expect(genderRequiredReason(card())).toBeNull();
    const other = { key: 'already_applied', label: 'x', meta: {} };
    expect(genderRequiredReason(card({ eligibility: { eligible: false, reasons: [other] } }))).toBeNull();
  });
});

describe('feed filters', () => {
  it('orders the types as the server lists them so one choice is one cache entry', () => {
    const args = toFeedArgs({ activityTypes: ['other', 'ecommerce'], pricingModel: 'fixed' });
    expect(args).toEqual({ activityTypes: ['ecommerce', 'other'], pricingModel: 'fixed' });
    expect(toFeedArgs({ activityTypes: ['ecommerce', 'other'], pricingModel: 'fixed' })).toEqual(args);
  });

  it('counts each chosen type and the pricing model', () => {
    expect(countActiveFeedFilters({})).toBe(0);
    expect(countActiveFeedFilters({ activityTypes: ['ecommerce', 'other'], pricingModel: 'bidding' })).toBe(3);
  });
});

describe('setBookmarkedIn', () => {
  it('flips only the matching card', () => {
    const items = [card({ id: 'a' }), card({ id: 'b' })];
    setBookmarkedIn(items, 'b', true);
    expect(items.map(item => item.bookmarked)).toEqual([false, true]);
  });
});

const reason = (key: string) => ({ key, label: `why ${key}`, meta: {} });
const BID = {
  model: label('bidding'),
  fee_bps: 1000,
  fixed: null,
  bid: { min: breakdown('60.00', '6.00', '54.00'), max: breakdown('200.00', '20.00', '180.00') },
};

describe('netShare', () => {
  it('is the net over the gross of the fixed price', () => {
    expect(netShare(card().pricing)).toBe(0.9);
  });

  it('is null for a bid, which has no single price', () => {
    expect(netShare(card({ pricing: BID }).pricing)).toBeNull();
  });
});

describe('isAlreadyApplied', () => {
  it('reads the server reason', () => {
    expect(isAlreadyApplied(card())).toBe(false);
    expect(
      isAlreadyApplied(card({ eligibility: { eligible: false, reasons: [reason('already_applied')] } })),
    ).toBe(true);
  });
});

describe('applyAction', () => {
  it('offers apply for a fixed price and a bid for a bidding campaign', () => {
    expect(applyAction(card())).toEqual({ kind: 'apply' });
    expect(applyAction(card({ pricing: BID }))).toEqual({ kind: 'bid' });
  });

  it('sends a creator whose only gap is the gender to the profile', () => {
    const gender = card({ eligibility: { eligible: false, reasons: [reason('gender_required')] } });
    expect(applyAction(gender)).toEqual({ kind: 'gender' });
  });

  it('blocks with every server reason when anything else is missing, gender included', () => {
    const rows = [reason('gender_required'), reason('min_followers')];
    const blocked = applyAction(card({ eligibility: { eligible: false, reasons: rows } }));
    expect(blocked.kind).toBe('blocked');
    expect(blocked.kind === 'blocked' && blocked.reasons.map(row => row.key)).toEqual(['gender_required', 'min_followers']);
  });

  it('reads a campaign that stopped recruiting as closed, keeping the reasons', () => {
    const closed = applyAction(
      card({ accepting_applications: false, eligibility: { eligible: false, reasons: [reason('already_applied')] } }),
    );
    expect(closed.kind).toBe('closed');
    expect(closed.kind === 'closed' && closed.reasons).toHaveLength(1);
  });
});
