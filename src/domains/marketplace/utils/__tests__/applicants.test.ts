import type { ApplicantAccount, ApplicantFilters } from '../../types/campaign';
import {
  DEFAULT_APPLICANT_FILTERS,
  applicantExpiry,
  applicantTier,
  countActiveFilters,
  defaultApplicantTab,
  isDefaultApplicantFilters,
  isFollowerFloor,
  isVerifiedAccount,
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
});
