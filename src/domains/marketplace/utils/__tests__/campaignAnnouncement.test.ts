import { announcementLockFrom, announcementQuota, CAMPAIGN_ANNOUNCEMENT_LIMITS } from '../campaignAnnouncement';

const DAY = CAMPAIGN_ANNOUNCEMENT_LIMITS.windowMs;
const HOUR = 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 17, 12, 0, 0);
const sent = (...agesInHours: number[]) => agesInHours.map(age => ({ sentAt: NOW - age * HOUR }));

describe('announcementQuota', () => {
  it('counts only what was sent inside the last 24 hours', () => {
    const quota = announcementQuota(sent(1, 5, 30, 48), null, NOW);
    expect(quota).toEqual({ used: 2, limit: 3, unlocksAt: null });
  });

  it('is empty without history', () => {
    expect(announcementQuota([], null, NOW)).toEqual({ used: 0, limit: 3, unlocksAt: null });
  });

  it('locks at the cap until the oldest of the three turns 24 hours old', () => {
    const history = sent(2, 6, 20);
    const quota = announcementQuota(history, null, NOW);
    expect(quota.used).toBe(3);
    expect(quota.unlocksAt).toBe(NOW - 20 * HOUR + DAY);
  });

  it('frees a slot as the window rolls, not at midnight', () => {
    const history = sent(2, 6, 20);
    const later = NOW + 4 * HOUR + 1;
    expect(announcementQuota(history, null, later)).toEqual({ used: 2, limit: 3, unlocksAt: null });
  });

  it('waits for the right entry when more than the cap sits inside the window', () => {
    // Four inside the window (server clock skew): the slot frees when the second-oldest expires.
    const history = sent(1, 3, 10, 22);
    expect(announcementQuota(history, null, NOW).unlocksAt).toBe(NOW - 10 * HOUR + DAY);
  });

  it('honours the reset a 429 named even when the history shows a free slot', () => {
    const lock = NOW + 3 * HOUR;
    expect(announcementQuota(sent(1), lock, NOW)).toEqual({ used: 3, limit: 3, unlocksAt: lock });
  });

  it('takes the later of the history and the server reset', () => {
    const history = sent(2, 6, 20);
    const lock = NOW + 9 * HOUR;
    expect(announcementQuota(history, lock, NOW).unlocksAt).toBe(lock);
    expect(announcementQuota(history, NOW + HOUR, NOW).unlocksAt).toBe(NOW - 20 * HOUR + DAY);
  });

  it('ignores a server reset that has passed', () => {
    expect(announcementQuota(sent(1), NOW - 1, NOW)).toEqual({ used: 1, limit: 3, unlocksAt: null });
  });
});

describe('announcementLockFrom', () => {
  it('uses the instant the server named', () => {
    expect(announcementLockFrom({ availableAt: '2026-10-18T03:20:00+03:00', retryAfter: 60 }, NOW)).toBe(
      Date.parse('2026-10-18T03:20:00+03:00'),
    );
  });

  it('falls back to retry_after seconds from now', () => {
    expect(announcementLockFrom({ availableAt: null, retryAfter: 90 }, NOW)).toBe(NOW + 90_000);
  });

  it('is unknown when the server named nothing usable', () => {
    expect(announcementLockFrom({ availableAt: 'later', retryAfter: null }, NOW)).toBeNull();
    expect(announcementLockFrom({ availableAt: null, retryAfter: null }, NOW)).toBeNull();
  });
});
