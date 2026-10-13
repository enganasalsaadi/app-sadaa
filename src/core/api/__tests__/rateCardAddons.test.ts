import { isAddonType, orderAddons, withKnownAddons } from '../rateCardAddons';
import type { CatalogService, RateCardCatalog } from '../rateCardCatalogTypes';

const addon = (type: string) => ({ type, label: type });

const service = (addons: string[]): CatalogService => ({
  key: 'reel',
  label: 'Reel',
  package: null,
  criteria: {
    delivery_days: { label: 'Delivery', min: 1, max: 30, default: 5 },
    revisions: { label: 'Revisions', options: [], default: 1 },
    retention: null,
  },
  attributes: [],
  // Trust boundary: a newer server may send types this build doesn't know.
  addons: addons as CatalogService['addons'],
});

describe('isAddonType', () => {
  it('knows the six catalog v2 add-ons only', () => {
    ['rush_delivery', 'extra_revision', 'exclusivity', 'whitelisting', 'link_in_bio', 'pin'].forEach(type =>
      expect(isAddonType(type)).toBe(true),
    );
    expect(isAddonType('on_site')).toBe(false);
    expect(isAddonType('percent_of_base')).toBe(false);
  });
});

describe('orderAddons', () => {
  it('skips unknown types and sorts by catalog order', () => {
    const saved = [addon('pin'), addon('hologram'), addon('rush_delivery'), addon('whitelisting')];
    expect(orderAddons(saved).map(a => a.type)).toEqual(['rush_delivery', 'whitelisting', 'pin']);
  });

  it("follows a service's own order, unlisted known types last", () => {
    const saved = [addon('rush_delivery'), addon('pin'), addon('extra_revision')];
    expect(orderAddons(saved, ['pin', 'rush_delivery']).map(a => a.type)).toEqual([
      'pin',
      'rush_delivery',
      'extra_revision',
    ]);
  });

  it('keeps every other field and leaves the input untouched', () => {
    const saved = [{ ...addon('pin'), amount: 5 }, addon('rush_delivery')];
    const [first] = orderAddons(saved);
    expect(first).toEqual(addon('rush_delivery'));
    expect(saved[0]).toEqual({ ...addon('pin'), amount: 5 });
  });
});

describe('withKnownAddons', () => {
  it('drops unknown add-on types from services and definitions', () => {
    const catalog: RateCardCatalog = {
      catalog_version: '3',
      price_bounds: { min_usd: 5, max_usd: 50000 },
      platforms: [{ key: 'instagram', label: 'Instagram', services: [service(['rush_delivery', 'hologram', 'pin'])] }],
      platform_agnostic_services: [service(['hologram'])],
      addons: [
        { type: 'pin', label: 'Pin', pricing_modes: [], options: [] },
        { type: 'hologram' as 'pin', label: 'Hologram', pricing_modes: [], options: [] },
      ],
      contract_terms: { version: 'v1', items: [] },
    };
    const known = withKnownAddons(catalog);
    expect(known.platforms[0]?.services[0]?.addons).toEqual(['rush_delivery', 'pin']);
    expect(known.platform_agnostic_services[0]?.addons).toEqual([]);
    expect(known.addons.map(a => a.type)).toEqual(['pin']);
    expect(catalog.platforms[0]?.services[0]?.addons).toHaveLength(3);
  });
});
