import type { WalletTransaction } from '../../types';
import { lineKind } from '../walletLineLook';

jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

const line = (overrides: Partial<WalletTransaction>): WalletTransaction => ({
  reference: 'TX-1',
  type: 'top_up',
  type_label: 'Top up',
  direction: 'credit',
  amount: { amount: 5000, currency: 'USD' },
  balance_after: { amount: 5000, currency: 'USD' },
  original: null,
  exchange_rate: null,
  source: null,
  details: {},
  created_at: '2026-10-15T09:00:00Z',
  description: null,
  counterparty: null,
  status: null,
  status_label: null,
  affects_balance: true,
  commission: null,
  ...overrides,
});

describe('lineKind', () => {
  it('reads the kind from the type', () => {
    expect(lineKind(line({ type: 'escrow_hold', direction: 'debit' }))).toBe('hold');
    expect(lineKind(line({ type: 'provider_fee', direction: 'debit' }))).toBe('fee');
  });

  it('reads a clawback by its side: out for the creator, in for the brand', () => {
    expect(lineKind(line({ type: 'clawback', direction: 'debit' }))).toBe('out');
    expect(lineKind(line({ type: 'clawback', direction: 'credit' }))).toBe('in');
  });

  it('falls back to the direction for an unknown type', () => {
    expect(lineKind(line({ type: null, direction: 'credit' }))).toBe('in');
    expect(lineKind(line({ type: null, direction: 'debit' }))).toBe('out');
  });
});
