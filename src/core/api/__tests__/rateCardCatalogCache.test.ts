import {
  parseCatalogCache,
  readCatalogCache,
  writeCatalogCache,
} from '../rateCardCatalogCache';
import type { RateCardCatalog } from '../rateCardCatalogTypes';

const catalog = (version: string): RateCardCatalog => ({
  catalog_version: version,
  price_bounds: { min_usd: 5, max_usd: 50000 },
  platforms: [],
  platform_agnostic_services: [],
  addons: [],
  contract_terms: { version: 'v1', items: [] },
});

describe('parseCatalogCache', () => {
  it('reads nothing from empty or broken JSON', () => {
    expect(parseCatalogCache(undefined)).toEqual({});
    expect(parseCatalogCache('{not json')).toEqual({});
    expect(parseCatalogCache('[]')).toEqual({});
  });

  it('drops entries that are not a catalog', () => {
    const raw = JSON.stringify({
      ar: { etag: '"a"', catalog: catalog('1') },
      en: { etag: 3, catalog: catalog('1') },
      fr: { etag: null, catalog: { platforms: 'x' } },
    });
    expect(Object.keys(parseCatalogCache(raw))).toEqual(['ar']);
  });
});

describe('catalog cache per language', () => {
  it('keeps each language apart', () => {
    writeCatalogCache('ar', { etag: '"ar-1"', catalog: catalog('1') });
    writeCatalogCache('en', { etag: null, catalog: catalog('2') });

    expect(readCatalogCache('ar')?.etag).toBe('"ar-1"');
    expect(readCatalogCache('en')?.catalog.catalog_version).toBe('2');
    expect(readCatalogCache('de')).toBeNull();
  });
});
