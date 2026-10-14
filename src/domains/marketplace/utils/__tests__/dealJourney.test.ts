import { buildDealJourney, journeyProgress } from '../dealJourney';
import { guideChaptersFor } from '../dealGuide';
import { formatDuration, toDurationParts } from '../offerDuration';

describe('buildDealJourney', () => {
  it('drops shipping from a digital deal', () => {
    const keys = buildDealJourney({ hasProduct: false, current: 'sign' }).map(stage => stage.key);
    expect(keys).toEqual(['sign', 'reply', 'escrow', 'make', 'review', 'publish', 'done']);
  });

  it('keeps shipping when a product is sent', () => {
    expect(buildDealJourney({ hasProduct: true, current: 'sign' })).toHaveLength(8);
  });

  it('marks done / now / next / later around the current station', () => {
    const statuses = buildDealJourney({ hasProduct: false, current: 'reply' }).map(stage => stage.status);
    expect(statuses).toEqual(['done', 'now', 'next', 'later', 'later', 'later', 'later']);
  });

  it('moves a digital deal asked for shipping on to creation', () => {
    const now = buildDealJourney({ hasProduct: false, current: 'ship' }).find(stage => stage.status === 'now');
    expect(now?.key).toBe('make');
  });

  it('says who moves at each station', () => {
    const actors = buildDealJourney({ hasProduct: true, current: 'sign' }).map(stage => stage.actor);
    expect(actors).toEqual(['you', 'creator', 'sada', 'you', 'creator', 'you', 'creator', 'sada']);
  });

  it('fills the rail up to the current station', () => {
    expect(journeyProgress(buildDealJourney({ hasProduct: false, current: 'sign' }))).toBe(0);
    expect(journeyProgress(buildDealJourney({ hasProduct: false, current: 'done' }))).toBe(1);
    expect(journeyProgress(buildDealJourney({ hasProduct: false, current: 'escrow' }))).toBeCloseTo(2 / 6);
  });
});

describe('guideChaptersFor', () => {
  it('hides shipping in a digital deal', () => {
    const keys = guideChaptersFor({ role: 'brand', context: 'deal', hasProduct: false }).map(c => c.key);
    expect(keys).not.toContain('ship');
    expect(keys).toHaveLength(7);
  });

  it('shows shipping, tagged optional, in the general guide', () => {
    const ship = guideChaptersFor({ role: 'brand', context: 'general' }).find(c => c.key === 'ship');
    expect(ship?.optional).toBe(true);
  });

  it('shows receipt in a creator deal with a product', () => {
    const keys = guideChaptersFor({ role: 'creator', context: 'deal', hasProduct: true }).map(c => c.key);
    expect(keys).toContain('receive');
    expect(keys).toHaveLength(8);
  });
});

describe('offer durations', () => {
  it('reads up to two days in hours, longer in whole days', () => {
    expect(toDurationParts(48)).toEqual({ unit: 'hours', count: 48 });
    expect(toDurationParts(120)).toEqual({ unit: 'days', count: 5 });
    expect(toDurationParts(50)).toEqual({ unit: 'days', count: 3 });
  });

  it('formats through the plural keys', () => {
    const t = jest.fn((key: string, options: { count: number }) => `${key}:${options.count}`);
    expect(formatDuration(t as never, 24)).toBe('marketplace.offer.units.hours:24');
    expect(formatDuration(t as never, 72)).toBe('marketplace.offer.units.days:3');
  });
});
