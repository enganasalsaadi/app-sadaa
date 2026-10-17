import {
  damascusDayKey,
  damascusDaysUntil,
  damascusMoment,
  deadlineDayRange,
  deadlineFromDay,
  deliveryDayChoices,
  dropGapHours,
  dropTimelineOf,
  dropTimeOptions,
  earliestDropAt,
  isDropTooEarly,
  preferredDropMinute,
  scheduleModePatch,
} from '../campaignSchedule';

const HOUR = 3_600_000;
const at = (iso: string) => Date.parse(iso);
/** 12:00 on 17 Oct 2026 in Damascus (UTC+3). */
const NOW = at('2026-10-17T09:00:00Z');

describe('Damascus days', () => {
  it('reads the day in Damascus, not on the phone', () => {
    expect(damascusDayKey(at('2026-10-17T22:30:00Z'))).toBe('2026-10-18');
    expect(damascusDayKey(NOW)).toBe('2026-10-17');
  });

  it('turns a Damascus day and time into the moment', () => {
    expect(damascusMoment('2026-11-12', 20 * 60)).toBe(at('2026-11-12T17:00:00Z'));
    expect(damascusMoment('12/11/2026', 0)).toBeNull();
  });

  it('counts whole days ahead', () => {
    expect(damascusDaysUntil(at('2026-10-28T20:59:00Z'), NOW)).toBe(11);
    expect(damascusDaysUntil(at('2026-10-17T20:00:00Z'), NOW)).toBe(0);
  });
});

describe('application deadline', () => {
  it('offers today up to 30 days ahead', () => {
    expect(deadlineDayRange(NOW)).toEqual({ min: '2026-10-17', max: '2026-11-16' });
  });

  it('closes at the end of the chosen day', () => {
    expect(deadlineFromDay('2026-10-28', NOW)).toBe(at('2026-10-28T20:59:00Z'));
  });

  it('stays under the 30-day cap on the last day', () => {
    expect(deadlineFromDay('2026-11-16', NOW)).toBe(NOW + 30 * 24 * HOUR - HOUR);
  });

  it('refuses a day that is already over', () => {
    expect(deadlineFromDay('2026-10-16', NOW)).toBeNull();
  });
});

describe('drop', () => {
  const deadline = at('2026-10-28T20:59:00Z');

  it('needs 5 days after the deadline for content only, 10 with a product', () => {
    expect(dropGapHours('none')).toBe(120);
    expect(dropGapHours('gift')).toBe(240);
    expect(dropGapHours('returnable')).toBe(240);
    expect(earliestDropAt(deadline, 'none', NOW)).toBe(deadline + 120 * HOUR);
    expect(earliestDropAt(null, 'gift', NOW)).toBe(NOW + 240 * HOUR);
  });

  it('flags a drop too close to the deadline', () => {
    const base = { applyDeadlineAt: deadline, shippingMode: 'none' as const };
    expect(isDropTooEarly({ ...base, dropAt: deadline + 100 * HOUR }, NOW)).toBe(true);
    expect(isDropTooEarly({ ...base, dropAt: deadline + 120 * HOUR }, NOW)).toBe(false);
    expect(isDropTooEarly({ ...base, dropAt: null }, NOW)).toBe(false);
  });

  it('marks the times still legal on a day, and keeps a saved odd time', () => {
    const earliest = earliestDropAt(deadline, 'none', NOW); // 2 Nov, 23:59 Damascus
    expect(dropTimeOptions('2026-11-02', earliest, null).every(option => !option.enabled)).toBe(true);
    const nextDay = dropTimeOptions('2026-11-03', earliest, at('2026-11-05T16:30:00Z'));
    expect(nextDay.every(option => option.enabled)).toBe(true);
    expect(nextDay.map(option => option.minute)).toEqual([720, 900, 1080, 1170, 1200, 1260, 1320]);
    expect(nextDay.find(option => option.minute === 1200)?.at).toBe(at('2026-11-03T17:00:00Z'));
  });

  it('preselects the chosen time, else the evening default, else the first legal one', () => {
    const options = [
      { minute: 720, at: 0, enabled: false },
      { minute: 1080, at: 0, enabled: true },
      { minute: 1200, at: 0, enabled: true },
    ];
    expect(preferredDropMinute(options, 1080)).toBe(1080);
    expect(preferredDropMinute(options, 720)).toBe(1200);
    expect(preferredDropMinute(options, null)).toBe(1200);
    expect(preferredDropMinute([{ minute: 1080, at: 0, enabled: true }], null)).toBe(1080);
    expect(preferredDropMinute([{ minute: 1080, at: 0, enabled: false }], null)).toBeNull();
  });

  it('reads the derived dates only for the drop the server saved', () => {
    const dropAt = at('2026-11-12T17:00:00Z');
    const campaign = {
      dropAt,
      drop: {
        draftDueAt: dropAt - 72 * HOUR,
        publishOpensAt: dropAt - 15 * 60_000,
        minGapHours: 120,
        latestApplyDeadlineAt: dropAt - 120 * HOUR,
      },
    };
    expect(dropTimelineOf(campaign, dropAt)).toEqual({
      draftDueAt: dropAt - 72 * HOUR,
      draftLeadHours: 72,
      publishOpensAt: dropAt - 15 * 60_000,
      publishLeadMinutes: 15,
      latestApplyDeadlineAt: dropAt - 120 * HOUR,
    });
    expect(dropTimelineOf(campaign, dropAt + HOUR)).toBeNull();
    expect(dropTimelineOf({ dropAt: null, drop: null }, null)).toBeNull();
  });
});

describe('delivery window or drop', () => {
  it('keeps only one of the pair', () => {
    expect(scheduleModePatch('drop')).toEqual({ deliveryDays: null });
    expect(scheduleModePatch('delivery')).toEqual({ dropAt: null });
  });

  it('offers the usual windows plus the draft’s own', () => {
    expect(deliveryDayChoices(7)).toEqual([3, 5, 7, 10, 14, 21, 30, 60, 90]);
    expect(deliveryDayChoices(45)).toEqual([3, 5, 7, 10, 14, 21, 30, 45, 60, 90]);
  });
});
