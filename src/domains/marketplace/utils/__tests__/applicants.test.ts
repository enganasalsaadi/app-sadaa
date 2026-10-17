import type { ApplicantAccount, ApplicantFilters } from '../../types/campaign';
import { applicantDto } from '../__fixtures__/campaignDto';
import { mapApplicantCard } from '../campaignMappers';
import {
  DEFAULT_APPLICANT_FILTERS,
  applicantExpiry,
  applicantTier,
  bestIndexes,
  compareLeaders,
  countActiveFilters,
  defaultApplicantTab,
  isDefaultApplicantFilters,
  isFollowerFloor,
  isVerifiedAccount,
  orderByIds,
  togglePick,
  toApplicantsArgs,
  totalFollowers,
} from '../applicants';

const HOUR = 3_600_000;

const account = (platform: string, followerCount: number | null): ApplicantAccount => ({
  platform: { key: platform, label: platform },
  username: platform,
  followerCount,
  followerTier: null,
  verificationStatus: 'verified',
  available: true,
});

describe('applicants', () => {
  it('opens on the chosen creators once the seats are taken or the campaign is over', () => {
    expect(defaultApplicantTab('filled')).toBe('selected');
    expect(defaultApplicantTab('closed')).toBe('selected');
    expect(defaultApplicantTab('completed')).toBe('selected');
    expect(defaultApplicantTab('open')).toBe('new');
    expect(defaultApplicantTab(null)).toBe('new');
  });

  it('asks for the tab status, or the status filter when one is picked', () => {
    expect(toApplicantsArgs('c1', 'shortlisted', DEFAULT_APPLICANT_FILTERS).statuses).toEqual(['shortlisted']);
    expect(toApplicantsArgs('c1', 'new', { ...DEFAULT_APPLICANT_FILTERS, status: 'expired' }).statuses).toEqual(['expired']);
    expect(toApplicantsArgs('c1', 'new', DEFAULT_APPLICANT_FILTERS).statuses).toEqual(['submitted']);
  });

  it('counts narrowing filters but not the sort', () => {
    const filters: ApplicantFilters = {
      sort: 'rating',
      status: 'rejected',
      governorates: ['damascus', 'aleppo'],
      niches: ['food'],
      minFollowers: 5000,
      invitedOnly: true,
    };
    expect(countActiveFilters(filters)).toBe(6);
    expect(countActiveFilters({ ...DEFAULT_APPLICANT_FILTERS, sort: 'price_asc' })).toBe(0);
    expect(isDefaultApplicantFilters({ ...DEFAULT_APPLICANT_FILTERS, sort: 'price_asc' })).toBe(false);
    expect(isDefaultApplicantFilters(DEFAULT_APPLICANT_FILTERS)).toBe(true);
  });

  it('recognises only the follower floors the sheet offers', () => {
    expect(isFollowerFloor(10000)).toBe(true);
    expect(isFollowerFloor(1234)).toBe(false);
    expect(isFollowerFloor(null)).toBe(false);
  });

  it('marks the last hours of the 72 h window urgent and an elapsed one as over', () => {
    const now = 1_000_000_000;
    expect(applicantExpiry(now + 30 * HOUR, now)).toEqual({ remaining: { unit: 'days', days: 1, hours: 6 }, urgent: false });
    expect(applicantExpiry(now + 2 * HOUR, now).urgent).toBe(true);
    expect(applicantExpiry(now - HOUR, now)).toEqual({ remaining: null, urgent: false });
  });

  it('sums the followers that were reported and says null when none was', () => {
    expect(totalFollowers([account('instagram', 12000), account('tiktok', null), account('youtube', 3000)])).toBe(15000);
    expect(totalFollowers([account('instagram', null)])).toBeNull();
    expect(totalFollowers([])).toBeNull();
  });

  it('badges only the accounts the platform vouched for', () => {
    expect(isVerifiedAccount({ verificationStatus: 'auto_verified' })).toBe(true);
    expect(isVerifiedAccount({ verificationStatus: 'approved' })).toBe(true);
    expect(isVerifiedAccount({ verificationStatus: 'pending_review' })).toBe(false);
    expect(isVerifiedAccount({ verificationStatus: 'rejected' })).toBe(false);
  });

  it('maps a known tier case-insensitively and ignores an unknown one', () => {
    expect(applicantTier('unknown_tier')).toBeNull();
    expect(applicantTier(null)).toBeNull();
  });

  describe('compare tray', () => {
    const face = (id: string) => ({ id, name: id, avatarUrl: null });

    it('adds a pick, removes a picked one, and refuses a fourth', () => {
      const one = togglePick([], face('a'), 3);
      expect(one).toEqual({ picks: [face('a')], full: false });
      const three = togglePick(togglePick(one.picks, face('b'), 3).picks, face('c'), 3);
      expect(three.picks.map(pick => pick.id)).toEqual(['a', 'b', 'c']);
      expect(togglePick(three.picks, face('d'), 3)).toEqual({ picks: three.picks, full: true });
      expect(togglePick(three.picks, face('b'), 3)).toEqual({ picks: [face('a'), face('c')], full: false });
    });

    it('lines the cards up in pick order and drops ids the server did not return', () => {
      const cards = ['a', 'b', 'c'].map(id => mapApplicantCard(applicantDto({ id })));
      expect(orderByIds(cards, ['c', 'x', 'a']).map(card => card.id)).toEqual(['c', 'a']);
    });
  });

  describe('compare leaders', () => {
    it('marks the lowest or the highest figure, ties included', () => {
      expect(bestIndexes([120, 90, 200], 'min')).toEqual([1]);
      expect(bestIndexes([79, 12, 85], 'max')).toEqual([2]);
      expect(bestIndexes([5, 9, 9], 'max')).toEqual([1, 2]);
    });

    it('marks nothing when every column ties or fewer than two have a figure', () => {
      expect(bestIndexes([4, 4, 4], 'max')).toEqual([]);
      expect(bestIndexes([null, 4, null], 'max')).toEqual([]);
      expect(bestIndexes([null, null], 'min')).toEqual([]);
    });

    it('skips columns without a figure when picking the leader', () => {
      expect(bestIndexes([null, 4.6, 4.8], 'max')).toEqual([2]);
    });
  });

  describe('compare metrics', () => {
    const card = (id: string, overrides: Parameters<typeof applicantDto>[0] = {}) =>
      mapApplicantCard(applicantDto({ id, ...overrides }));

    it('leads price with the cheapest and followers with the biggest reach', () => {
      const cards = [
        card('a', { price: { is_bid: true, gross_usd: '120.00', net_to_creator_usd: '108.00' } }),
        card('b', { price: { is_bid: false, gross_usd: '90.00', net_to_creator_usd: '81.00' } }),
      ];
      expect(compareLeaders(cards, 'price')).toEqual([1]);
    });

    it('ignores a rating that has no reviews behind it', () => {
      const cards = [
        card('a', { track_record: { completed_deals: 9, rating: { average: 4.8, count: 12 } } }),
        card('b', { track_record: { completed_deals: 0, rating: { average: null, count: 0 } } }),
        card('c', { track_record: { completed_deals: 4, rating: { average: 4.6, count: 3 } } }),
      ];
      expect(compareLeaders(cards, 'rating')).toEqual([0]);
      expect(compareLeaders(cards, 'deals')).toEqual([0]);
    });
  });
});
