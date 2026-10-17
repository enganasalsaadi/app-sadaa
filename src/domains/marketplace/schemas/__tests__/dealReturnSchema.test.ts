import type { TFunction } from 'i18next';
import { createDealReturnSchema, type DealReturnFormValues } from '../dealReturnSchema';

// The reason icons load with the constants; their names are enough here.
jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

const t = ((key: string) => key) as unknown as TFunction;

const messageOf = (fn: () => unknown): string | null => {
  try {
    fn();
    return null;
  } catch (err) {
    return (err as { message: string }).message;
  }
};

describe('createDealReturnSchema', () => {
  const schema = createDealReturnSchema(t);
  const valid: DealReturnFormValues = {
    courier: 'aramex',
    courierName: '',
    trackingNo: 'SY-1',
    trackingUrl: '',
    handed: 'today',
    handedDays: 2,
  };

  it('takes the brand waybill rules: a courier, a number, an https link', () => {
    expect(messageOf(() => schema.validateSync(valid))).toBeNull();
    expect(messageOf(() => schema.validateSync({ ...valid, courier: null }))).toBe('validation.selectOne');
    expect(messageOf(() => schema.validateSync({ ...valid, trackingNo: ' ' }))).toBe('validation.required');
    expect(messageOf(() => schema.validateSync({ ...valid, trackingUrl: 'http://x.example' }))).toBe(
      'marketplace.deals.shipping.ship.urlError',
    );
    expect(messageOf(() => schema.validateSync({ ...valid, courier: 'other', courierName: ' ' }))).toBe(
      'validation.required',
    );
  });

  it('keeps «days ago» within its steps', () => {
    expect(messageOf(() => schema.validateSync({ ...valid, handed: 'earlier', handedDays: 5 }))).toBeNull();
    expect(messageOf(() => schema.validateSync({ ...valid, handed: 'earlier', handedDays: 1 }))).not.toBeNull();
    expect(messageOf(() => schema.validateSync({ ...valid, handed: 'earlier', handedDays: 40 }))).not.toBeNull();
  });
});
