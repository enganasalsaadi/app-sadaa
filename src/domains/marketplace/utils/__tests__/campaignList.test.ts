import { mapCampaignDetail } from '../campaignMappers';
import {
  campaignAttentionKind,
  campaignReadiness,
  campaignTimeLeft,
  countCampaignAttention,
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

describe('countCampaignAttention', () => {
  it('counts every campaign that waits once, even when it is listed twice', () => {
    const freed = campaign({ id: 'a', status: label('open') });
    const edits = campaign({ id: 'b', status: label('changes_requested'), ...NO_SEAT_FREED });
    const calm = campaign({ id: 'c', status: label('open'), ...NO_SEAT_FREED });
    expect(countCampaignAttention([freed, edits, calm, freed])).toBe(2);
  });

  it('is zero when nothing waits', () => {
    expect(countCampaignAttention([campaign({ ...NO_SEAT_FREED })])).toBe(0);
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
