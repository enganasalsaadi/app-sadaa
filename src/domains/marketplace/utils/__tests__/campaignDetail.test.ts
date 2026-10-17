import { mapCampaignDetail, mapCampaignHistoryRow } from '../campaignMappers';
import {
  campaignCountdown,
  campaignHistoryEvents,
  campaignIsland,
  campaignTermsLocked,
} from '../campaignDetail';
import { detailDto, historyRowDto, label } from '../__fixtures__/campaignDto';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const campaign = (overrides = {}) => mapCampaignDetail(detailDto(overrides));
const NO_TIMERS = {
  accepting_applications: true,
  deadline_passed: false,
  ghost: null,
  suspension: null,
  zero_applicants: null,
};
const calm = (overrides = {}) => campaign({ seat_freed: null, timers: NO_TIMERS, ...overrides });

describe('campaignIsland', () => {
  const now = Date.parse('2026-10-17T09:00:00+03:00');

  it('puts a suspension first, with its cancel date', () => {
    const endsAt = '2026-10-24T09:00:00+03:00';
    const island = campaignIsland(
      calm({
        status: label('suspended'),
        timers: { ...NO_TIMERS, suspension: { ends_at: endsAt, reopen_needs_deadline: false } },
      }),
      now,
    );
    expect(island).toMatchObject({ kind: 'suspended', dueAt: Date.parse(endsAt) });
  });

  it('shows a waiting applicant only after the 48h warning fired', () => {
    const ghost = (warns: string) => ({
      ...NO_TIMERS,
      ghost: { warns_at: warns, suspends_at: '2026-10-18T09:00:00+03:00' },
    });
    expect(campaignIsland(calm({ timers: ghost('2026-10-17T09:00:00+03:00') }), now)).toMatchObject({
      kind: 'ghost',
      windowMs: DAY,
    });
    expect(campaignIsland(calm({ timers: ghost('2026-10-17T10:00:00+03:00') }), now)).toBeNull();
  });

  it('shows the empty deadline before a waiting applicant and a freed seat last', () => {
    const zero = { decide_by: '2026-10-24T09:00:00+03:00', extend_available: true, extend_to: null, options: [] };
    expect(campaignIsland(calm({ timers: { ...NO_TIMERS, zero_applicants: zero } }), now)).toMatchObject({
      kind: 'zeroApplicants',
    });
    const freed = { free_seats: 2, reducible: 2, options: ['replace'], deadline_passed: false };
    expect(campaignIsland(calm({ seat_freed: freed }), now)).toEqual({ kind: 'seatFreed', freeSeats: 2 });
  });

  it('stays quiet when nothing waits or the campaign is not live', () => {
    expect(campaignIsland(calm({ status: label('open') }), now)).toBeNull();
    expect(campaignIsland(campaign({ status: label('completed') }), now)).toBeNull();
    expect(campaignIsland(campaign({ status: label('draft') }), now)).toBeNull();
  });
});

describe('campaignCountdown', () => {
  it('counts whole days, then hours, then minutes, rounding up', () => {
    expect(campaignCountdown(6 * DAY + HOUR, 7 * DAY, 0)).toMatchObject({ unit: 'days', value: 7 });
    expect(campaignCountdown(23 * HOUR, DAY, 0)).toMatchObject({ unit: 'hours', value: 23 });
    expect(campaignCountdown(10 * 60_000 + 1, DAY, 0)).toMatchObject({ unit: 'minutes', value: 11 });
  });

  it('drains the ring as the window runs out and never goes negative', () => {
    expect(campaignCountdown(DAY / 2, DAY, 0).remaining).toBeCloseTo(0.5);
    expect(campaignCountdown(0, DAY, DAY)).toEqual({ remaining: 0, unit: 'minutes', value: 0 });
    expect(campaignCountdown(3 * DAY, DAY, 0).remaining).toBe(1);
  });
});

describe('campaignTermsLocked', () => {
  it('locks a live campaign once a seat is taken or an application waits', () => {
    const counters = (applications: number, seats: number) => ({ applications_open: applications, seats_occupied: seats });
    expect(campaignTermsLocked(calm({ status: label('open'), counters: counters(0, 0) }))).toBe(false);
    expect(campaignTermsLocked(calm({ status: label('open'), counters: counters(2, 0) }))).toBe(true);
    expect(campaignTermsLocked(calm({ status: label('filled'), counters: counters(0, 3) }))).toBe(true);
  });

  it('leaves a draft editable whatever its counters say', () => {
    expect(campaignTermsLocked(calm({ status: label('draft') }))).toBe(false);
  });
});

describe('campaignHistoryEvents', () => {
  const rows = (...dtos: ReturnType<typeof historyRowDto>[]) => dtos.map(mapCampaignHistoryRow);

  it('lists the newest first', () => {
    const events = campaignHistoryEvents(
      rows(
        historyRowDto({ id: 'old', occurred_at: '2026-10-16T09:00:00+03:00' }),
        historyRowDto({ id: 'new', occurred_at: '2026-10-17T09:00:00+03:00' }),
      ),
    );
    expect(events.map(event => event.id)).toEqual(['new', 'old']);
  });

  it('renders equal from/to keys as a note, in the app words when the reason is known', () => {
    const [note] = campaignHistoryEvents(
      rows(historyRowDto({ from: label('open'), to: label('open'), reason: 'ghost_warning' })),
    );
    expect(note).toMatchObject({ note: true, titleKey: 'marketplace.campaign.detail.history.reason.ghost_warning' });
  });

  it('falls back to the row label for an unknown note reason', () => {
    const [note] = campaignHistoryEvents(
      rows(historyRowDto({ from: label('open'), to: label('open'), reason: 'something_new' })),
    );
    expect(note).toMatchObject({ note: true, titleKey: null, title: 'L:open' });
  });

  it('gives a transition its status label and the reason only when known', () => {
    const [known, unknown] = campaignHistoryEvents(
      rows(
        historyRowDto({ id: 'a', reason: 'zero_applicants', occurred_at: '2026-10-17T09:00:00+03:00' }),
        historyRowDto({ id: 'b', reason: 'mystery', occurred_at: '2026-10-16T09:00:00+03:00' }),
      ),
    );
    expect(known).toMatchObject({ note: false, title: 'L:open', whyKey: 'marketplace.campaign.detail.history.reason.zero_applicants' });
    expect(unknown).toMatchObject({ note: false, whyKey: null });
  });
});
