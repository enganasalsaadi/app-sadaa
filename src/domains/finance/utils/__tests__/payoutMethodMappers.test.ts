import type { PayoutMethod, PayoutMethodDto } from '../../types';
import {
  mapPayoutMethod,
  mapPayoutMethods,
  nextPrimaryAfterDelete,
  removePayoutMethod,
} from '../payoutMethodMappers';

const dto = (overrides: Partial<PayoutMethodDto> = {}): PayoutMethodDto => ({
  id: 'pm-1',
  channel: 'haram',
  channel_label: 'حوالات الهرم',
  label: 'Home',
  is_default: false,
  details: { holder_name: ' Anas ', phone: '+963944123456', governorate: 'damascus', city: '' },
  currencies: ['USD', 'SYP'],
  ...overrides,
});

const method = (id: string, isDefault = false): PayoutMethod => ({
  id,
  channel: 'syriatel_cash',
  channel_label: null,
  label: null,
  is_default: isDefault,
  details: { holder_name: 'A', phone: '+963944123456' },
  currencies: ['SYP'],
});

describe('mapPayoutMethod', () => {
  it('keeps only set details, trims text and drops unknown currencies', () => {
    expect(mapPayoutMethod(dto({ currencies: ['USD', 'EUR'] }))).toEqual({
      id: 'pm-1',
      channel: 'haram',
      channel_label: 'حوالات الهرم',
      label: 'Home',
      is_default: false,
      details: { holder_name: 'Anas', phone: '+963944123456', governorate: 'damascus' },
      currencies: ['USD'],
    });
  });

  it('maps Sham Cash and treats a missing flag as not primary', () => {
    const mapped = mapPayoutMethod(
      dto({
        channel: 'sham_cash',
        is_default: null,
        label: '  ',
        details: { holder_name: 'Anas', phone: '+963944123456', account_code: ' Sc-0042 ' },
      }),
    );
    expect(mapped?.channel).toBe('sham_cash');
    expect(mapped?.details).toEqual({ holder_name: 'Anas', phone: '+963944123456', account_code: 'Sc-0042' });
    expect(mapped?.is_default).toBe(false);
    expect(mapped?.label).toBeNull();
  });

  it('skips a channel this build does not know', () => {
    expect(mapPayoutMethod(dto({ channel: 'paypal' }))).toBeNull();
  });
});

describe('mapPayoutMethods', () => {
  it('pins the primary first and keeps the rest in server order', () => {
    const list = mapPayoutMethods([dto({ id: 'a' }), dto({ id: 'b', is_default: true }), dto({ id: 'c' })]);
    expect(list.map(item => item.id)).toEqual(['b', 'a', 'c']);
  });

  it('reads a null body as no methods', () => {
    expect(mapPayoutMethods(null)).toEqual([]);
  });
});

describe('removePayoutMethod', () => {
  it('drops the method and flags the server primary first', () => {
    const next = removePayoutMethod([method('a', true), method('b'), method('c')], 'a', 'c');
    expect(next.map(item => [item.id, item.is_default])).toEqual([
      ['c', true],
      ['b', false],
    ]);
  });

  it('leaves no primary when the last method goes', () => {
    expect(removePayoutMethod([method('a', true)], 'a', null)).toEqual([]);
  });
});

describe('nextPrimaryAfterDelete', () => {
  const list = [method('a', true), method('b'), method('c')];

  it('names the newest remaining method when the primary goes', () => {
    expect(nextPrimaryAfterDelete(list, 'a')?.id).toBe('b');
  });

  it('is null for a non-primary method or the last one', () => {
    expect(nextPrimaryAfterDelete(list, 'b')).toBeNull();
    expect(nextPrimaryAfterDelete([method('a', true)], 'a')).toBeNull();
  });
});
