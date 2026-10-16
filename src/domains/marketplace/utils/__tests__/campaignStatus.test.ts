import {
  APPLICATION_STATUS_META,
  APPLICATION_TAB_STATUSES,
  CAMPAIGN_STATUS_META,
  CAMPAIGN_TAB_STATUSES,
  CAMPAIGN_TABS,
  UNKNOWN_APPLICATION_STATUS_META,
  UNKNOWN_CAMPAIGN_STATUS_META,
} from '../../constants/campaignStatus';
import {
  APPLICANT_COUNT_KEY,
  APPLICATION_STATUS,
  CAMPAIGN_STATUS,
  isApplicationStatus,
  isCampaignStatus,
} from '../../types';
import { getApplicationStatusMeta, getCampaignStatusMeta } from '../campaignStatus';

describe('status guards', () => {
  it('accepts the 11 campaign and 8 application statuses and rejects unknown ones', () => {
    expect(CAMPAIGN_STATUS).toHaveLength(11);
    expect(APPLICATION_STATUS).toHaveLength(8);
    CAMPAIGN_STATUS.forEach(status => expect(isCampaignStatus(status)).toBe(true));
    APPLICATION_STATUS.forEach(status => expect(isApplicationStatus(status)).toBe(true));
    expect(isCampaignStatus('paused')).toBe(false);
    expect(isApplicationStatus(undefined)).toBe(false);
  });

  it('counts every application status the brand can see (all but withdrawn)', () => {
    expect([...APPLICANT_COUNT_KEY].sort()).toEqual(
      APPLICATION_STATUS.filter(status => status !== 'withdrawn').sort(),
    );
  });
});

describe('campaign status meta', () => {
  it('tones what needs the brand warning, live work teal, finals neutral or danger', () => {
    expect(CAMPAIGN_STATUS_META.changes_requested.tone).toBe('warning');
    expect(CAMPAIGN_STATUS_META.suspended.tone).toBe('warning');
    expect(CAMPAIGN_STATUS_META.open.tone).toBe('interactive');
    expect(CAMPAIGN_STATUS_META.cancelled.tone).toBe('neutral');
    expect(CAMPAIGN_STATUS_META.rejected.tone).toBe('danger');
  });

  it('marks exactly the four terminal statuses final', () => {
    const finals = CAMPAIGN_STATUS.filter(status => CAMPAIGN_STATUS_META[status].final);
    expect(finals).toEqual(['completed', 'cancelled', 'rejected', 'removed']);
  });

  it('lets creators read only campaigns published once and not taken down', () => {
    const readable = CAMPAIGN_STATUS.filter(status => CAMPAIGN_STATUS_META[status].readableByCreator);
    expect(readable).toEqual(['open', 'suspended', 'filled', 'closed', 'completed']);
  });

  it('builds the brand tab filters from the contract grouping', () => {
    expect(CAMPAIGN_TAB_STATUSES.drafts).toEqual(['draft', 'changes_requested']);
    expect(CAMPAIGN_TAB_STATUSES.review).toEqual(['pending_review']);
    expect(CAMPAIGN_TAB_STATUSES.live).toEqual(['open', 'suspended', 'filled', 'closed']);
    expect(CAMPAIGN_TAB_STATUSES.finished).toEqual(['completed', 'cancelled', 'rejected', 'removed']);
  });

  it('keeps tab filters and per-status tabs in agreement, covering every status once', () => {
    CAMPAIGN_TABS.forEach(tab =>
      CAMPAIGN_TAB_STATUSES[tab].forEach(status => expect(CAMPAIGN_STATUS_META[status].tab).toBe(tab)),
    );
    const grouped = CAMPAIGN_TABS.flatMap(tab => [...CAMPAIGN_TAB_STATUSES[tab]]);
    expect([...grouped].sort()).toEqual([...CAMPAIGN_STATUS].sort());
  });

  it('falls back to a neutral meta for an unknown status instead of crashing', () => {
    expect(getCampaignStatusMeta(null)).toBe(UNKNOWN_CAMPAIGN_STATUS_META);
    expect(getCampaignStatusMeta('open')).toBe(CAMPAIGN_STATUS_META.open);
  });
});

describe('application status meta', () => {
  it('counts only submitted and shortlisted as pending', () => {
    const pending = APPLICATION_STATUS.filter(status => APPLICATION_STATUS_META[status].pending);
    expect(pending).toEqual(['submitted', 'shortlisted']);
  });

  it('shows every non-selected outcome neutrally (no reasons, no danger)', () => {
    (['rejected', 'not_selected', 'expired', 'cancelled', 'withdrawn'] as const).forEach(status =>
      expect(APPLICATION_STATUS_META[status].tone).toBe('neutral'),
    );
  });

  it('builds the creator tab filters and covers every status once', () => {
    expect(APPLICATION_TAB_STATUSES.open).toEqual(['submitted', 'shortlisted']);
    expect(APPLICATION_TAB_STATUSES.selected).toEqual(['selected']);
    const grouped = Object.values(APPLICATION_TAB_STATUSES).flat();
    expect([...grouped].sort()).toEqual([...APPLICATION_STATUS].sort());
    grouped.forEach(status => {
      const tab = (Object.keys(APPLICATION_TAB_STATUSES) as (keyof typeof APPLICATION_TAB_STATUSES)[]).find(
        key => (APPLICATION_TAB_STATUSES[key] as readonly string[]).includes(status),
      );
      expect(APPLICATION_STATUS_META[status].tab).toBe(tab);
    });
  });

  it('falls back to a neutral meta for an unknown status', () => {
    expect(getApplicationStatusMeta(null)).toBe(UNKNOWN_APPLICATION_STATUS_META);
    expect(getApplicationStatusMeta('selected')).toBe(APPLICATION_STATUS_META.selected);
  });
});
