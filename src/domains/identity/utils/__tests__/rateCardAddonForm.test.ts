import type { CatalogService, RateCardCatalog } from '@/core/api';
import type { RateCard } from '@/domains/auth';
import type { RateCardAddonFormValue } from '../../schemas/rateCardSchema';
import {
  addonDefinitions,
  addonServerFields,
  addonsChanged,
  allowedValues,
  pickAddonOptions,
  toAddonForms,
  toAddonInputs,
  unmanagedAddons,
} from '../rateCardAddonForm';

// The barrel pulls navigators and UI; only the pure helpers are needed here.
jest.mock('@/domains/auth', () => ({
  ...jest.requireActual<object>('@/domains/auth/schemas/influencerRatesSchema'),
  ...jest.requireActual<object>('@/domains/auth/utils/rateCatalog'),
}));

const fixed = [{ key: 'fixed', label: 'Fixed', min: 1, max: 50000 }];

const catalog = {
  addons: [
    {
      type: 'rush_delivery',
      label: 'Rush delivery',
      pricing_modes: fixed,
      options: [
        { key: 'delivery_hours', label: 'Delivered within', options: [{ value: 24 }, { value: 48 }], default: 48, visible: true },
      ],
    },
    { type: 'extra_revision', label: 'Extra revision', pricing_modes: fixed, options: [] },
    {
      type: 'exclusivity',
      label: 'Exclusivity',
      pricing_modes: fixed,
      options: [{ key: 'duration_days', options: [{ value: 14, label: '14 days' }], default: 14, visible: true }],
    },
    {
      type: 'whitelisting',
      label: 'Paid ads',
      pricing_modes: fixed,
      options: [
        { key: 'duration_days', options: [{ value: 30 }, { value: 60 }], default: 30, visible: true },
        { key: 'internal', options: [{ value: 'x' }], default: 'x', visible: false },
      ],
    },
    { type: 'pin', label: 'Pin', pricing_modes: [], options: [] },
  ],
} as unknown as RateCardCatalog;

const service = {
  addons: ['whitelisting', 'rush_delivery', 'extra_revision', 'exclusivity', 'pin', 'link_in_bio'],
} as unknown as CatalogService;

const defs = addonDefinitions(catalog, service);
const [whitelisting, rush] = defs;

const saved = (type: string, amount: number, options: RateCard['addons'][number]['options'] = {}) => ({
  type,
  label: type,
  pricing_mode: 'fixed' as const,
  amount,
  computed_price_usd: amount,
  options,
});

describe('addonDefinitions', () => {
  it("follows the service's order, skipping types without a definition or a fixed price", () => {
    expect(defs.map(def => def.type)).toEqual(['whitelisting', 'rush_delivery', 'extra_revision', 'exclusivity']);
  });

  it('keeps visible options only, values string-keyed, and the fee range in minor units', () => {
    expect(whitelisting).toEqual({
      type: 'whitelisting',
      label: 'Paid ads',
      bounds: { min: 100, max: 5_000_000 },
      options: [
        {
          key: 'duration_days',
          label: null,
          values: [
            { value: 30, key: '30', label: null },
            { value: 60, key: '60', label: null },
          ],
          default: '30',
        },
      ],
    });
    expect(defs[2]?.options).toEqual([]);
  });
});

describe('options', () => {
  const hours = rush?.options[0];

  it('only allows a rush window faster than the delivery days', () => {
    if (!hours) throw new Error('fixture');
    expect(allowedValues(hours, 5).map(entry => entry.key)).toEqual(['24', '48']);
    expect(allowedValues(hours, 2).map(entry => entry.key)).toEqual(['24']);
    expect(allowedValues(hours, 1)).toEqual([]);
  });

  it('keeps the current pick, else the default, else the slowest allowed value', () => {
    if (!rush || !whitelisting) throw new Error('fixture');
    expect(pickAddonOptions(rush, 5, { delivery_hours: '24' })).toEqual({ delivery_hours: '24' });
    expect(pickAddonOptions(rush, 5)).toEqual({ delivery_hours: '48' });
    expect(pickAddonOptions(rush, 2, { delivery_hours: '48' })).toEqual({ delivery_hours: '24' });
    expect(pickAddonOptions(rush, 1)).toBeNull();
    expect(pickAddonOptions(whitelisting, 1)).toEqual({ duration_days: '30' });
  });
});

describe('form ↔ API', () => {
  const card = [saved('rush_delivery', 30, { delivery_hours: 24 }), saved('exclusivity', 50), saved('hologram', 9)];
  const forms = toAddonForms(defs, card);

  it('prefills saved add-ons enabled; a missing option falls back to the default', () => {
    expect(forms).toEqual([
      { type: 'whitelisting', enabled: false, options: {}, price: null },
      { type: 'rush_delivery', enabled: true, options: { delivery_hours: '24' }, price: { amount: 3000, currency: 'USD' } },
      { type: 'extra_revision', enabled: false, options: {}, price: null },
      { type: 'exclusivity', enabled: true, options: { duration_days: '14' }, price: { amount: 5000, currency: 'USD' } },
    ]);
  });

  it('sends enabled add-ons with the catalog value type; no options key when there are none', () => {
    const next: RateCardAddonFormValue[] = [
      ...forms.slice(0, 2),
      { type: 'extra_revision', enabled: true, options: {}, price: { amount: 1250, currency: 'USD' } },
      { type: 'exclusivity', enabled: true, options: { duration_days: '14' }, price: null },
    ];
    expect(toAddonInputs(defs, next)).toEqual([
      { row: 1, input: { type: 'rush_delivery', pricing_mode: 'fixed', amount: 30, options: { delivery_hours: 24 } } },
      { row: 2, input: { type: 'extra_revision', pricing_mode: 'fixed', amount: 12.5 } },
    ]);
  });

  it('detects changes in fee or option, ignoring row order and add-ons it does not show', () => {
    expect(addonsChanged(defs, [...forms].reverse(), card)).toBe(false);
    const cheaper = forms.map(form =>
      form.type === 'exclusivity' ? { ...form, price: { amount: 4000, currency: 'USD' as const } } : form,
    );
    expect(addonsChanged(defs, cheaper, card)).toBe(true);
    const slower = forms.map(form =>
      form.type === 'rush_delivery' ? { ...form, options: { delivery_hours: '48' } } : form,
    );
    expect(addonsChanged(defs, slower, card)).toBe(true);
  });

  it('sends back saved add-ons the editor does not show, unchanged', () => {
    expect(unmanagedAddons(defs, card)).toEqual([
      { type: 'hologram', pricing_mode: 'fixed', amount: 9, options: {} },
    ]);
  });
});

describe('addonServerFields', () => {
  it('maps 422 keys of the sent list back to the form rows', () => {
    const fields = addonServerFields(defs, [
      { row: 1, input: { type: 'rush_delivery', pricing_mode: 'fixed', amount: 30 } },
      { row: 0, input: { type: 'whitelisting', pricing_mode: 'fixed', amount: 60 } },
    ]);
    expect(fields['addons.0.amount']).toBe('addons.1.price');
    expect(fields['addons.0.options.delivery_hours']).toBe('addons.1.options');
    expect(fields['addons.1.type']).toBe('addons.0.price');
    expect(fields['addons.1.options.duration_days']).toBe('addons.0.options');
    expect(fields['addons.2.amount']).toBeUndefined();
  });
});
