import type { CatalogService, RateCardCatalog } from '@/core/api';
import {
  buildRateServiceGroups,
  findCatalogService,
  isRushAllowed,
  toPackageKey,
  toPackageValue,
} from '../rateCatalog';

const service = (key: CatalogService['key'], packageValues: (string | number)[] = []): CatalogService => ({
  key,
  label: key,
  package: packageValues.length
    ? {
        key: 'pkg',
        label: 'Package',
        type: 'options',
        options: packageValues.map(value => ({ value, label: String(value) })),
        default: packageValues[0] ?? 1,
        visible: true,
      }
    : null,
  criteria: {
    delivery_days: { label: 'Delivery', min: 1, max: 14, default: 5 },
    revisions: { label: 'Revisions', options: [{ value: 1, label: '1' }], default: 1 },
    retention: null,
  },
  attributes: [],
  addons: [],
});

const catalog: RateCardCatalog = {
  catalog_version: '1',
  price_bounds: { min_usd: 5, max_usd: 50000 },
  platforms: [
    { key: 'instagram', label: 'Instagram', services: [service('reel', [15, 60]), service('story')] },
    { key: 'tiktok', label: 'TikTok', services: [service('video')] },
    { key: 'telegram', label: 'Telegram', services: [] },
  ],
  platform_agnostic_services: [service('on_site_visit', ['2', '4'])],
  addons: [],
  contract_terms: { version: 'v1', items: [] },
};

describe('buildRateServiceGroups', () => {
  it('keeps the linked order, skips unpriced platforms, ends with the in-person group', () => {
    const groups = buildRateServiceGroups(catalog, ['tiktok', 'youtube', 'instagram', 'telegram', 'tiktok']);
    expect(groups.map(group => group.platform)).toEqual(['tiktok', 'instagram', null]);
    expect(groups[0]?.label).toBe('TikTok');
    expect(groups[2]?.label).toBeNull();
  });

  it('still offers in-person services with no platform linked', () => {
    expect(buildRateServiceGroups(catalog, []).map(group => group.platform)).toEqual([null]);
  });
});

describe('findCatalogService', () => {
  it('looks in the platform, or the platform-free list for null', () => {
    expect(findCatalogService(catalog, 'instagram', 'story')?.key).toBe('story');
    expect(findCatalogService(catalog, null, 'on_site_visit')?.key).toBe('on_site_visit');
    expect(findCatalogService(catalog, 'tiktok', 'story')).toBeNull();
    expect(findCatalogService(catalog, 'snapchat', 'story')).toBeNull();
  });
});

describe('package keys', () => {
  const reel = findCatalogService(catalog, 'instagram', 'reel');
  const visit = findCatalogService(catalog, null, 'on_site_visit');

  it('round-trips the catalog value type', () => {
    expect(toPackageKey(60)).toBe('60');
    expect(toPackageKey(null)).toBeNull();
    expect(reel && toPackageValue(reel, '60')).toBe(60);
    expect(visit && toPackageValue(visit, '4')).toBe('4');
    expect(reel && toPackageValue(reel, '99')).toBeNull();
  });
});

describe('isRushAllowed', () => {
  it('needs 2+ days for 24h and 3+ days for 48h', () => {
    expect(isRushAllowed(24, 1)).toBe(false);
    expect(isRushAllowed(24, 2)).toBe(true);
    expect(isRushAllowed(48, 2)).toBe(false);
    expect(isRushAllowed(48, 3)).toBe(true);
  });
});
