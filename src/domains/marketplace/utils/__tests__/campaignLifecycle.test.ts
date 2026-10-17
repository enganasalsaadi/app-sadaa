import { mapCampaignDetail } from '../campaignMappers';
import {
  campaignMenuRows,
  deadlineInWindow,
  extendDeadlineWindow,
  freshDeadlineWindow,
  seatsAddable,
} from '../campaignLifecycle';
import { damascusDayKey } from '../campaignSchedule';
import { detailDto, label, T0 } from '../__fixtures__/campaignDto';

const DAY = 86_400_000;
const now = Date.parse(T0);
const campaign = (overrides = {}) => mapCampaignDetail(detailDto(overrides));
const actions = (overrides = {}) => campaignMenuRows(campaign(overrides), now).map(row => row.action);

describe('campaignMenuRows', () => {
  it('offers a live campaign seats, the deadline, edit, copy and one way to end it', () => {
    expect(actions({ status: label('open') })).toEqual(['addSeats', 'extendDeadline', 'edit', 'duplicate', 'close']);
    expect(actions({ status: label('suspended'), counters: { applications_open: 2, seats_occupied: 0 } })).toEqual([
      'addSeats',
      'extendDeadline',
      'edit',
      'duplicate',
      'cancel',
    ]);
  });

  it('gives a filled campaign no deadline and no ending (every seat is a running deal)', () => {
    expect(actions({ status: label('filled') })).toEqual(['addSeats', 'edit', 'duplicate']);
  });

  it('lets a draft be resumed or deleted, and a sent-back one cancelled', () => {
    expect(actions({ status: label('draft') })).toEqual(['resume', 'duplicate', 'delete']);
    expect(actions({ status: label('changes_requested') })).toEqual(['resume', 'duplicate', 'cancel']);
  });

  it('only copies a campaign in review, closed, finished or of an unknown status', () => {
    ['pending_review', 'closed', 'completed', 'cancelled', 'rejected', 'removed', 'brand_new'].forEach(key => {
      expect(actions({ status: label(key) })).toEqual(['duplicate']);
    });
  });

  it('keeps a row it cannot run, disabled', () => {
    const rows = campaignMenuRows(campaign({ status: label('open'), seats_total: 20 }), now);
    expect(rows.find(row => row.action === 'addSeats')).toEqual({ action: 'addSeats', disabled: true });
    expect(seatsAddable(campaign({ seats_total: 18 }))).toBe(2);
  });
});

describe('extendDeadlineWindow', () => {
  it('starts after the current deadline and stops at the drop gap', () => {
    const range = extendDeadlineWindow(campaign(), now);
    expect(range).toMatchObject({ minDay: '2026-10-17', maxDay: '2026-10-22' });
    // The drop's latest deadline (20:00) beats the end of that day.
    expect(range && deadlineInWindow('2026-10-22', range)).toBe(Date.parse('2026-10-22T20:00:00+03:00'));
  });

  it('skips the day of a deadline set to the end of its day', () => {
    const range = extendDeadlineWindow(campaign({ apply_deadline_at: '2026-10-20T23:59:00+03:00', drop: null }), now);
    expect(range?.minDay).toBe('2026-10-21');
  });

  it('caps at 30 days from publishing without a drop, and is null once nothing later is legal', () => {
    const range = extendDeadlineWindow(campaign({ drop: null }), now);
    expect(range?.maxDay).toBe(damascusDayKey(now + 30 * DAY - 3_600_000));
    const old = new Date(now - 40 * DAY).toISOString();
    expect(extendDeadlineWindow(campaign({ drop: null, published_at: old }), now)).toBeNull();
  });
});

describe('freshDeadlineWindow + deadlineInWindow', () => {
  it('runs from today, closes at the end of the picked day, and refuses a day already over', () => {
    const range = freshDeadlineWindow(campaign({ drop: null }), now);
    expect(range?.minDay).toBe('2026-10-17');
    expect(range && deadlineInWindow('2026-10-18', range)).toBe(Date.parse('2026-10-18T23:59:00+03:00'));
    expect(range && deadlineInWindow('2026-10-16', range)).toBeNull();
  });
});
