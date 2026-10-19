import { mapCampaignDetail } from '../campaignMappers';
import { campaignJourney } from '../campaignJourney';
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
const campaign = (overrides = {}) =>
  mapCampaignDetail(
    detailDto({
      seat_freed: null,
      timers: NO_TIMERS,
      apply_deadline_at: new Date(now + 3 * DAY).toISOString(),
      counters: { applications_open: 4, seats_occupied: 3 },
      seats_total: 10,
      ...overrides,
    }),
  );
const states = (overrides = {}) => campaignJourney(campaign(overrides), now)?.map(entry => entry.state);

describe('campaignJourney', () => {
  it('stands an open campaign on its application station', () => {
    expect(states()).toEqual(['done', 'current', 'next', 'next', 'next']);
  });

  it('stands the other statuses on the station the list card uses', () => {
    expect(states({ status: label('pending_review') })).toEqual(['current', 'next', 'next', 'next', 'next']);
    expect(states({ status: label('draft') })).toEqual(['current', 'next', 'next', 'next', 'next']);
    expect(states({ status: label('closed') })).toEqual(['done', 'done', 'current', 'next', 'next']);
    expect(states({ status: label('filled') })).toEqual(['done', 'done', 'done', 'current', 'next']);
  });

  it('puts every station behind a finished campaign and shows no journey for one that never finished', () => {
    expect(states({ status: label('completed') })).toEqual(['done', 'done', 'done', 'done', 'done']);
    ['cancelled', 'rejected', 'removed', 'brand_new'].forEach(key => {
      expect(campaignJourney(campaign({ status: label(key) }), now)).toBeNull();
    });
  });

  it('gives the open station the deadline window and the waiting applications', () => {
    const apply = campaignJourney(campaign(), now)?.[1];
    expect(apply?.panel).toEqual({
      kind: 'window',
      window: { label: 'deadline', remaining: expect.any(Number), timeLeft: { value: 3, unit: 'days' } },
      applicants: 4,
    });
    expect(apply?.summary.key).toBe('marketplace.campaign.detail.journey.sum.applyUntil');
  });

  it('times a suspended campaign to its automatic cancellation instead', () => {
    const apply = campaignJourney(
      campaign({
        status: label('suspended'),
        timers: { ...NO_TIMERS, suspension: { ends_at: new Date(now + 5 * DAY).toISOString(), reopen_needs_deadline: false } },
      }),
      now,
    )?.[1];
    expect(apply?.panel).toMatchObject({ kind: 'window', window: { label: 'cancelAt', timeLeft: { value: 5, unit: 'days' } } });
    expect(apply?.summary.key).toBe('marketplace.campaign.detail.journey.sum.suspended');
  });

  it('reads the picked seats from the counters, and waits for the first pick otherwise', () => {
    expect(campaignJourney(campaign(), now)?.[2]?.summary).toEqual({
      key: 'marketplace.campaign.detail.journey.sum.seatsPicked',
      params: { occupied: 3, total: 10 },
    });
    expect(
      campaignJourney(campaign({ counters: { applications_open: 0, seats_occupied: 0 } }), now)?.[2]?.summary.key,
    ).toBe('marketplace.campaign.detail.journey.sum.afterPicking');
  });

  it('tells a sent-back campaign it waits on the brand', () => {
    expect(campaignJourney(campaign({ status: label('changes_requested') }), now)?.[0]?.summary.key).toBe(
      'marketplace.campaign.detail.journey.sum.awaitingEdits',
    );
  });
});
