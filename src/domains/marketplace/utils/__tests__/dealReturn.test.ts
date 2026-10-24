import type { MarketCourier } from '@/core/market';
import type { DealReturnShipment } from '../../types';
import { dealReturnAnswers, dealReturnView, handedDaysAgo, returnFormValues, toReturnBody } from '../dealReturn';

// The reason icons load with the constants; their names are enough here.
jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

const NOW = Date.parse('2026-10-20T10:00:00Z');
const DAY = 86_400_000;

const COURIERS: MarketCourier[] = [
  { code: 'alqadmous', name: 'القدموس' },
  { code: 'aramex', name: 'أرامكس' },
];

const ship = (over: Partial<DealReturnShipment> = {}): DealReturnShipment => ({
  id: 'rs1',
  status: { key: 'awaiting_waybill', label: 'Awaiting waybill' },
  waybillDueAt: NOW + 3 * DAY,
  overdue: false,
  courier: null,
  trackingNo: null,
  trackingUrl: null,
  handedAt: null,
  shippedAt: null,
  confirmBy: null,
  receivedAt: null,
  autoReceived: false,
  issue: null,
  waivedAt: null,
  waiveNote: null,
  onHold: false,
  ...over,
});

const view = (over?: Partial<DealReturnShipment>, now = NOW) => dealReturnView({ returnShipment: ship(over) }, now);

describe('dealReturnView', () => {
  it('is null for a deal with no return', () => {
    expect(dealReturnView({ returnShipment: null }, NOW)).toBeNull();
  });

  it('awaiting: amber, parcel still, lock stays, waybill editable, share of the 5 days gone', () => {
    const v = view({ waybillDueAt: NOW + 2 * DAY });
    expect(v).toMatchObject({
      tone: 'warning',
      progress: 0,
      moving: false,
      late: false,
      creatorCanEdit: true,
      brandCanAnswer: true,
      locksCreator: true,
      dueAt: NOW + 2 * DAY,
    });
    expect(v?.dueShare).toBeCloseTo(0.6, 5);
  });

  it('awaiting and late: red, from the server flag or from the clock', () => {
    expect(view({ overdue: true })?.late).toBe(true);
    const byClock = view({ waybillDueAt: NOW - 1 });
    expect(byClock).toMatchObject({ late: true, tone: 'danger', locksCreator: true });
    expect(byClock?.dueShare).toBe(1);
  });

  it('shipped: teal, moving, the lock is gone, editable until the brand answers, with the silence clock', () => {
    expect(view({ status: { key: 'shipped', label: 'Shipped' }, confirmBy: NOW + 11 * DAY })).toMatchObject({
      tone: 'interactive',
      progress: 0.5,
      moving: true,
      creatorCanEdit: true,
      brandCanAnswer: true,
      locksCreator: false,
      dueAt: null,
      confirmBy: NOW + 11 * DAY,
    });
  });

  it.each([
    ['received', 'success', 1, false, false],
    ['issue_reported', 'warning', 1, false, false],
    ['waived', 'neutral', 0, false, true],
  ] as const)('%s is closed for the creator and the brand', (key, tone, progress, canEdit, kept) => {
    expect(view({ status: { key, label: key }, confirmBy: NOW + DAY })).toMatchObject({
      tone,
      progress,
      creatorCanEdit: canEdit,
      brandCanAnswer: false,
      locksCreator: false,
      confirmBy: null,
      kept,
    });
  });

  it('an unknown status is grey with nothing to do', () => {
    expect(view({ status: { key: null, label: 'New thing' } })).toMatchObject({
      tone: 'neutral',
      creatorCanEdit: false,
      brandCanAnswer: false,
      locksCreator: false,
    });
  });
});

describe('returnFormValues', () => {
  it('starts empty and «today» for a fresh waybill', () => {
    expect(returnFormValues(ship(), COURIERS, NOW)).toEqual({
      courier: null,
      courierName: '',
      trackingNo: '',
      trackingUrl: '',
      handed: 'today',
      handedDays: 2,
    });
  });

  it('opens the waybill on file: a preset by its label, a typed courier under «other»', () => {
    const base = ship({ courier: 'أرامكس', trackingNo: 'SY-1', trackingUrl: 'https://a.example/t', handedAt: NOW - DAY });
    expect(returnFormValues(base, COURIERS, NOW)).toMatchObject({
      courier: 'aramex',
      courierName: '',
      trackingNo: 'SY-1',
      trackingUrl: 'https://a.example/t',
      handed: 'yesterday',
    });
    const typed = ship({ courier: 'الفؤاد', trackingNo: 'F-9', handedAt: NOW - 4 * DAY });
    expect(returnFormValues(typed, COURIERS, NOW)).toMatchObject({
      courier: 'other',
      courierName: 'الفؤاد',
      handed: 'earlier',
      handedDays: 4,
    });
  });
});

describe('toReturnBody', () => {
  const values = {
    courier: 'aramex' as const,
    courierName: '',
    trackingNo: ' SY-883 ',
    trackingUrl: '',
    handed: 'today' as const,
    handedDays: 2,
  };

  it('leaves the link and the date out when they are not given', () => {
    expect(toReturnBody(values, NOW)).toEqual({ courier: 'aramex', tracking_no: 'SY-883' });
  });

  it('sends a well-formed https link and a past handover date, never a future one', () => {
    expect(
      toReturnBody({ ...values, trackingUrl: 'https://aramex.example/t/1', handed: 'yesterday' }, NOW),
    ).toEqual({
      courier: 'aramex',
      tracking_no: 'SY-883',
      tracking_url: 'https://aramex.example/t/1',
      handed_at: new Date(NOW - DAY).toISOString(),
    });
    expect(toReturnBody({ ...values, handed: 'earlier', handedDays: 3 }, NOW).handed_at).toBe(
      new Date(NOW - 3 * DAY).toISOString(),
    );
    expect(toReturnBody({ ...values, trackingUrl: 'http://insecure.example' }, NOW)).not.toHaveProperty(
      'tracking_url',
    );
  });

  it('sends «other» with the typed name', () => {
    expect(toReturnBody({ ...values, courier: 'other', courierName: ' الفؤاد ' }, NOW)).toEqual({
      courier: 'other',
      courier_name: 'الفؤاد',
      tracking_no: 'SY-883',
    });
  });

  it('counts the days back from the choice', () => {
    expect(handedDaysAgo({ handed: 'today', handedDays: 5 })).toBe(0);
    expect(handedDaysAgo({ handed: 'yesterday', handedDays: 5 })).toBe(1);
    expect(handedDaysAgo({ handed: 'earlier', handedDays: 5 })).toBe(5);
  });
});

describe('dealReturnAnswers', () => {
  it('lets the brand receive or report only once the waybill is in, and waive until receipt', () => {
    expect(dealReturnAnswers('awaiting_waybill')).toEqual({ receive: false, issue: false, waive: true });
    expect(dealReturnAnswers('shipped')).toEqual({ receive: true, issue: true, waive: true });
  });

  it('closes every answer once the return is done, reported, waived or unknown', () => {
    const closed = { receive: false, issue: false, waive: false };
    expect(dealReturnAnswers('received')).toEqual(closed);
    expect(dealReturnAnswers('issue_reported')).toEqual(closed);
    expect(dealReturnAnswers('waived')).toEqual(closed);
    expect(dealReturnAnswers(null)).toEqual(closed);
  });
});
