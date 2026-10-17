import type { TFunction } from 'i18next';
import { createCampaignShippingResolver } from '../campaignShippingSchema';
import { EMPTY_SHIPPING_DRAFT, type CampaignShippingFormValues } from '../../utils/campaignShipping';

// The reason icons load with the courier constants; their names are enough here.
jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

const t = ((key: string) => key) as unknown as TFunction;
const options = { criteriaMode: 'all', fields: {}, shouldUseNativeValidation: false } as const;

const run = (rows: CampaignShippingFormValues['rows']) =>
  createCampaignShippingResolver(t)({ rows }, undefined, options);

describe('createCampaignShippingResolver', () => {
  it('ignores parcels that are not ticked, even when empty', async () => {
    const result = await run({ a: EMPTY_SHIPPING_DRAFT });
    expect(result.errors).toEqual({});
  });

  it('accepts a ticked parcel with a courier and a number', async () => {
    const result = await run({ a: { ...EMPTY_SHIPPING_DRAFT, selected: true, courier: 'aramex', trackingNo: 'AR-1' } });
    expect(result.errors).toEqual({});
  });

  it('flags the missing courier and number of a ticked parcel, per parcel and field', async () => {
    const result = await run({
      a: { ...EMPTY_SHIPPING_DRAFT, selected: true },
      b: { ...EMPTY_SHIPPING_DRAFT, selected: true, courier: 'aramex', trackingNo: 'AR-2' },
    });
    const rows = result.errors.rows as Record<string, Record<string, { message?: string }>> | undefined;
    expect(Object.keys(rows ?? {})).toEqual(['a']);
    expect(rows?.a?.courier?.message).toBe('validation.selectOne');
    expect(rows?.a?.trackingNo?.message).toBe('validation.required');
  });

  it('asks for the name of an «other» courier and rejects a link that is not https', async () => {
    const result = await run({
      a: { ...EMPTY_SHIPPING_DRAFT, selected: true, courier: 'other', trackingNo: '1', trackingUrl: 'http://x.com' },
    });
    const rows = result.errors.rows as Record<string, Record<string, { message?: string }>> | undefined;
    expect(Object.keys(rows?.a ?? {}).sort()).toEqual(['courierName', 'trackingUrl']);
  });
});
