import { mapCampaignDetail } from '../campaignMappers';
import {
  buildCampaignAttention,
  campaignAttentionKind,
  campaignReadiness,
  campaignTimeLeft,
  waitingApplications,
} from '../campaignList';
import { detailDto, label } from '../__fixtures__/campaignDto';

const campaign = (overrides = {}) => mapCampaignDetail(detailDto(overrides));
const NO_SEAT_FREED = { seat_freed: null };

describe('campaignAttentionKind', () => {
  it('flags a suspension and requested changes by status', () => {
    expect(campaignAttentionKind(campaign({ status: label('suspended'), ...NO_SEAT_FREED }))).toBe('suspended');
    expect(campaignAttentionKind(campaign({ status: label('changes_requested'), ...NO_SEAT_FREED }))).toBe(
      'changes_requested',
    );
  });

  it('flags a freed seat only on a live campaign', () => {
    expect(campaignAttentionKind(campaign({ status: label('open') }))).toBe('seat_freed');
    expect(campaignAttentionKind(campaign({ status: label('completed') }))).toBeNull();
  });

  it('leaves a calm campaign out', () => {
    expect(campaignAttentionKind(campaign({ status: label('open'), ...NO_SEAT_FREED }))).toBeNull();
  });
});

describe('buildCampaignAttention', () => {
  it('orders by urgency and lists a campaign once', () => {
    const freed = campaign({ id: 'a', status: label('open') });
    const edits = campaign({ id: 'b', status: label('changes_requested'), ...NO_SEAT_FREED });
    const suspended = campaign({ id: 'c', status: label('suspended'), ...NO_SEAT_FREED });
    const found = buildCampaignAttention([freed, edits, suspended, freed]);
    expect(found.map(item => item.campaign.id)).toEqual(['c', 'a', 'b']);
    expect(found.map(item => item.kind)).toEqual(['suspended', 'seat_freed', 'changes_requested']);
  });

  it('is empty when nothing waits', () => {
    expect(buildCampaignAttention([campaign({ ...NO_SEAT_FREED })])).toEqual([]);
  });
});

describe('campaignReadiness', () => {
  it('counts the parts that are not missing out of seven', () => {
    expect(campaignReadiness({ missing: [] })).toEqual({ done: 7, total: 7 });
    expect(campaignReadiness({ missing: ['pricing', 'schedule', 'apply_deadline_at'] })).toEqual({ done: 4, total: 7 });
  });

  it('never goes below zero when the server lists more than this build knows', () => {
    expect(campaignReadiness({ missing: Array.from({ length: 9 }, (_, i) => `k${i}`) }).done).toBe(0);
  });
});

describe('waitingApplications', () => {
  it('sums open applications, but only when every page has loaded', () => {
    const rows = [campaign({ id: 'a' }), campaign({ id: 'b', counters: { applications_open: 2, seats_occupied: 0 } })];
    expect(waitingApplications(rows, false)).toBe(5);
    expect(waitingApplications(rows, true)).toBeNull();
  });
});

describe('campaignTimeLeft', () => {
  const NOW = 1_000_000;
  it('gives days + hours, hours + minutes, then minutes', () => {
    expect(campaignTimeLeft(NOW + (5 * 24 + 4) * 3_600_000, NOW)).toEqual({ unit: 'days', days: 5, hours: 4 });
    expect(campaignTimeLeft(NOW + (3 * 60 + 20) * 60_000, NOW)).toEqual({ unit: 'hours', hours: 3, minutes: 20 });
    expect(campaignTimeLeft(NOW + 90_000, NOW)).toEqual({ unit: 'minutes', minutes: 2 });
  });

  it('is null with no deadline or once it has passed', () => {
    expect(campaignTimeLeft(null, NOW)).toBeNull();
    expect(campaignTimeLeft(NOW, NOW)).toBeNull();
  });
});
