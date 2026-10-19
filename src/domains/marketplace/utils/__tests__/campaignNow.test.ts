import { mapCampaignDetail } from '../campaignMappers';
import { campaignNow } from '../campaignNow';
import { detailDto, label, T0 } from '../__fixtures__/campaignDto';

const now = Date.parse(T0);
const DAY = 86_400_000;
const NO_TIMERS = {
  accepting_applications: true,
  deadline_passed: false,
  ghost: null,
  suspension: null,
  zero_applicants: null,
};
const calm = (overrides = {}) =>
  mapCampaignDetail(
    detailDto({
      seat_freed: null,
      timers: NO_TIMERS,
      drop_at: null,
      drop: null,
      delivery_days: 7,
      apply_deadline_at: new Date(now + 3 * DAY).toISOString(),
      counters: { applications_open: 3, seats_occupied: 0 },
      ...overrides,
    }),
  );
const kinds = (overrides = {}) => campaignNow(calm(overrides), now).todos.map(todo => todo.kind);

describe('campaignNow', () => {
  it('counts an open campaign down to its deadline and puts the waiting applications first', () => {
    const result = campaignNow(calm(), now);
    expect(result.tone).toBe('interactive');
    expect(result.ring).toMatchObject({ kind: 'countdown', unit: 'days', value: 3 });
    expect(result.body).toMatchObject({ key: 'marketplace.campaign.detail.now.open.bodyWaiting' });
    expect(result.todos).toEqual([
      { kind: 'applicants', hot: true, count: 3, urgency: null },
      { kind: 'extend', hot: false },
    ]);
  });

  it('has nothing to review when nobody applied, and says it is waiting', () => {
    const result = campaignNow(calm({ counters: { applications_open: 0, seats_occupied: 0 } }), now);
    expect(result.todos.map(todo => todo.kind)).toEqual(['extend']);
    expect(result.body).toMatchObject({ key: 'marketplace.campaign.detail.now.open.bodyQuiet' });
  });

  it('shows the time left to an applicant before the campaign suspends itself', () => {
    const result = campaignNow(
      calm({
        timers: {
          ...NO_TIMERS,
          ghost: { warns_at: new Date(now - DAY).toISOString(), suspends_at: new Date(now + 4 * 3_600_000).toISOString() },
        },
      }),
      now,
    );
    expect(result.head).toMatchObject({ key: 'marketplace.campaign.detail.island.ghost.title' });
    expect(result.ring).toMatchObject({ kind: 'countdown', unit: 'hours', value: 4 });
    expect(result.todos).toEqual([
      { kind: 'applicants', hot: true, count: 3, urgency: { kind: 'stop', value: 4, unit: 'hours' } },
    ]);
  });

  it('leads a suspended campaign with its reopen, timed to the automatic cancellation', () => {
    const result = campaignNow(
      calm({
        status: label('suspended'),
        timers: { ...NO_TIMERS, suspension: { ends_at: new Date(now + 5 * DAY).toISOString(), reopen_needs_deadline: false } },
      }),
      now,
    );
    expect(result.tone).toBe('warning');
    expect(result.todos[0]).toEqual({
      kind: 'decision',
      action: 'reopen',
      hot: true,
      urgency: { kind: 'cancel', value: 5, unit: 'days' },
    });
    expect(result.todos[1]).toMatchObject({ kind: 'applicants' });
  });

  it('turns a freed seat into the brand\'s decisions, never "hot" for cancelling', () => {
    const result = campaignNow(
      calm({
        status: label('filled'),
        counters: { applications_open: 0, seats_occupied: 2 },
        seat_freed: { free_seats: 1, reducible: 1, options: ['replace', 'reduce', 'reopen'], deadline_passed: false },
      }),
      now,
    );
    expect(result.tone).toBe('interactive');
    expect(result.todos.map(todo => todo.kind === 'decision' && todo.action)).toEqual(['reduce', 'reopenSeat']);
  });

  it('counts a draft by what is ready and lists each known missing piece', () => {
    const result = campaignNow(calm({ status: label('draft'), missing: ['title', 'pricing', 'from_the_future'] }), now);
    // A reason this build doesn't know still blocks sending, so it counts against «ready» though it has no row.
    expect(result.ring).toEqual({ kind: 'ratio', done: 4, total: 7 });
    expect(result.todos).toEqual([
      { kind: 'missing', hot: true, missing: 'title' },
      { kind: 'missing', hot: true, missing: 'pricing' },
    ]);
  });

  it('asks a sent-back campaign with nothing listed to be edited, and warns', () => {
    const result = campaignNow(calm({ status: label('changes_requested'), missing: [] }), now);
    expect(result.tone).toBe('warning');
    expect(result.todos).toEqual([{ kind: 'edit', hot: true }]);
    expect(kinds({ status: label('draft'), missing: [] })).toEqual([]);
  });

  it('asks nothing of the brand while the team reviews, or once creators are working', () => {
    const review = campaignNow(calm({ status: label('pending_review') }), now);
    expect(review.ring).toEqual({ kind: 'glyph', glyph: 'review' });
    expect(review.todos).toEqual([]);
    expect(review.calm).toBe(true);
    const filled = campaignNow(
      calm({ status: label('filled'), counters: { applications_open: 0, seats_occupied: 5 } }),
      now,
    );
    expect(filled.ring).toEqual({ kind: 'count', value: 5 });
    expect(filled.tone).toBe('success');
    expect(filled.todos).toEqual([]);
    expect(filled.calm).toBe(true);
    expect(campaignNow(calm({ status: label('draft'), missing: [] }), now).calm).toBe(false);
  });

  it('reports a finished campaign by how it ended, and an unknown status in the server\'s words', () => {
    expect(campaignNow(calm({ status: label('completed') }), now)).toMatchObject({ tone: 'success', next: null });
    expect(campaignNow(calm({ status: label('rejected') }), now).tone).toBe('danger');
    expect(campaignNow(calm({ status: label('cancelled') }), now).tone).toBe('neutral');
    expect(campaignNow(calm({ status: label('brand_new') }), now).head).toEqual({ text: 'L:brand_new' });
  });
});
