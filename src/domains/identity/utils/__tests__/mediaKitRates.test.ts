import type { ServiceGroup, ShowcaseService } from '../mediaKitShowcase';
import { buildRatesView, MAX_SERVICES_PER_PLATFORM, uniqueFastestDays } from '../mediaKitRates';

const service = (key: string, deliveryDays: number): ShowcaseService => ({
  key,
  platform: 'instagram',
  platformLabel: 'Instagram',
  serviceLabel: key,
  packageLabel: null,
  price: { amount: 10000, currency: 'USD' },
  includes: [],
  addons: [],
  deliveryDays,
  revisions: 1,
  retentionLabel: null,
});

const group = (key: string, services: ShowcaseService[]): ServiceGroup => ({ key, label: key, services });

describe('buildRatesView', () => {
  it('shows the active platform and offers every price when other platforms exist', () => {
    const groups = [group('instagram', [service('a', 3)]), group('facebook', [service('b', 4)])];
    const view = buildRatesView(groups, 'facebook', false);
    expect(view.services.map(item => item.key)).toEqual(['b']);
    expect(view.more).toBe('all');
    expect(view.totalCount).toBe(2);
  });

  it('falls back to the first platform for an unknown or unset key', () => {
    const groups = [group('instagram', [service('a', 3)]), group('facebook', [service('b', 4)])];
    expect(buildRatesView(groups, null, false).services.map(item => item.key)).toEqual(['a']);
    expect(buildRatesView(groups, 'youtube', false).services.map(item => item.key)).toEqual(['a']);
  });

  it(`caps one platform at ${MAX_SERVICES_PER_PLATFORM} tickets`, () => {
    const many = Array.from({ length: MAX_SERVICES_PER_PLATFORM + 2 }, (_, i) => service(`s${i}`, 3 + i));
    const view = buildRatesView([group('instagram', many)], 'instagram', false);
    expect(view.services).toHaveLength(MAX_SERVICES_PER_PLATFORM);
    expect(view.more).toBe('all');
  });

  it('needs no button for one short platform', () => {
    const view = buildRatesView([group('instagram', [service('a', 3), service('b', 2)])], null, false);
    expect(view.more).toBeNull();
  });

  it('lists every service in the "all" view, with a way back only when there is a filter', () => {
    const groups = [group('instagram', [service('a', 3)]), group('facebook', [service('b', 4)])];
    const all = buildRatesView(groups, 'instagram', true);
    expect(all.services.map(item => item.key)).toEqual(['a', 'b']);
    expect(all.more).toBe('byPlatform');

    const many = Array.from({ length: MAX_SERVICES_PER_PLATFORM + 1 }, (_, i) => service(`s${i}`, 3));
    const single = buildRatesView([group('instagram', many)], null, true);
    expect(single.services).toHaveLength(MAX_SERVICES_PER_PLATFORM + 1);
    expect(single.more).toBeNull();
  });

  it('is empty without services', () => {
    expect(buildRatesView([], null, false)).toEqual({ services: [], more: null, totalCount: 0 });
  });
});

describe('uniqueFastestDays', () => {
  it('returns the delivery days only when one service is strictly the quickest', () => {
    const groups = [group('instagram', [service('a', 6)]), group('facebook', [service('b', 4)])];
    expect(uniqueFastestDays(groups)).toBe(4);
  });

  it('gives no badge on a tie or a lone service', () => {
    expect(uniqueFastestDays([group('instagram', [service('a', 3), service('b', 3)])])).toBeNull();
    expect(uniqueFastestDays([group('instagram', [service('a', 3)])])).toBeNull();
    expect(uniqueFastestDays([])).toBeNull();
  });
});
