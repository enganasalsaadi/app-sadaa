import type { TFunction } from 'i18next';
import type { MobileRule } from '@/core/market';
import {
  createDealAddressSchema,
  createDealIssueSchema,
  createDealShipSchema,
  issueNeedsPhotos,
  type DealAddressFormValues,
  type DealShipFormValues,
} from '../dealShippingSchema';

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

describe('createDealShipSchema', () => {
  const schema = createDealShipSchema(t);
  const valid: DealShipFormValues = { courier: 'aramex', courierName: '', trackingNo: 'AX-1', trackingUrl: '' };

  it('accepts a preset courier with a number', () => {
    expect(messageOf(() => schema.validateSync(valid))).toBeNull();
  });

  it('needs a courier, and its name for «other»', () => {
    expect(messageOf(() => schema.validateSync({ ...valid, courier: null }))).toBe('validation.selectOne');
    expect(messageOf(() => schema.validateSync({ ...valid, courier: 'other', courierName: ' ' }))).toBe(
      'validation.required',
    );
    expect(messageOf(() => schema.validateSync({ ...valid, courier: 'other', courierName: 'الفؤاد' }))).toBeNull();
  });

  it('needs the tracking number', () => {
    expect(messageOf(() => schema.validateSync({ ...valid, trackingNo: '  ' }))).toBe('validation.required');
  });

  it('takes only https tracking links', () => {
    expect(messageOf(() => schema.validateSync({ ...valid, trackingUrl: 'http://aramex.com' }))).toBe(
      'marketplace.deals.shipping.ship.urlError',
    );
    expect(messageOf(() => schema.validateSync({ ...valid, trackingUrl: 'https://aramex.com/t/1' }))).toBeNull();
  });
});

describe('createDealIssueSchema', () => {
  const schema = createDealIssueSchema(t);

  it('needs a reason', () => {
    expect(messageOf(() => schema.validateSync({ reason: null, note: '' }))).toBe(
      'marketplace.deals.shipping.issue.pickError',
    );
  });

  it('needs a note only for «other»', () => {
    expect(messageOf(() => schema.validateSync({ reason: 'damaged', note: '' }))).toBeNull();
    expect(messageOf(() => schema.validateSync({ reason: 'other', note: ' ' }))).toBe(
      'marketplace.deals.shipping.issue.noteError',
    );
  });

  it('caps the note at 500 characters', () => {
    expect(messageOf(() => schema.validateSync({ reason: 'delayed', note: 'x'.repeat(501) }))).toBe(
      'validation.maxLength',
    );
  });

  it('asks photos for damaged, incomplete and wrong item only', () => {
    expect(issueNeedsPhotos('damaged')).toBe(true);
    expect(issueNeedsPhotos('incomplete')).toBe(true);
    expect(issueNeedsPhotos('wrong_item')).toBe(true);
    expect(issueNeedsPhotos('delayed')).toBe(false);
    expect(issueNeedsPhotos('other')).toBe(false);
    expect(issueNeedsPhotos(null)).toBe(false);
  });
});

const SY_MOBILE: MobileRule = { countryCode: 'SY', mobilePattern: '^\\+9639\\d{8}$', mobileExample: '+963944123456' };

describe('createDealAddressSchema', () => {
  const schema = createDealAddressSchema(t, SY_MOBILE);
  const valid: DealAddressFormValues = {
    recipientName: 'سارة',
    phone: '0944123456',
    governorateId: '1',
    city: 'دمشق',
    area: 'المزة',
    addressLine: 'شارع الفيلات',
    landmark: '',
    notes: '',
  };

  it('accepts a full address with empty optionals', () => {
    expect(messageOf(() => schema.validateSync(valid))).toBeNull();
  });

  it('needs a mobile of the market', () => {
    expect(messageOf(() => schema.validateSync({ ...valid, phone: '0112345678' }))).toBe(
      'marketplace.deals.shipping.address.phoneError',
    );
  });

  it('follows another market\'s rule', () => {
    const ae = createDealAddressSchema(t, { countryCode: 'AE', mobilePattern: '^\\+9715\\d{8}$', mobileExample: '+971501234567' });
    expect(messageOf(() => ae.validateSync({ ...valid, phone: '0501234567' }))).toBeNull();
    expect(messageOf(() => ae.validateSync({ ...valid, phone: '0944123456' }))).toBe(
      'marketplace.deals.shipping.address.phoneError',
    );
  });

  it('needs a governorate and mirrors the server lengths', () => {
    expect(messageOf(() => schema.validateSync({ ...valid, governorateId: '' }))).toBe('validation.selectOne');
    expect(messageOf(() => schema.validateSync({ ...valid, addressLine: 'abcd' }))).toBe('validation.minLength');
    expect(messageOf(() => schema.validateSync({ ...valid, landmark: 'x'.repeat(151) }))).toBe(
      'validation.maxLength',
    );
  });
});
