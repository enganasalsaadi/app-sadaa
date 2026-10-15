import type { DealCourierChoice } from '../../constants/dealShipping';
import type { Deal, DealShipment, DealShipping, DealShippingAddress, DealStatus } from '../../types';
import {
  addressFieldMap,
  addressFormValues,
  addressPlace,
  addressText,
  courierChoiceOf,
  courierName,
  dealShippingDock,
  dealShippingView,
  safeTrackingUrl,
  shipFormValues,
  toAddressBody,
  toShipmentBody,
  toSyrianMobile,
  transitDays,
} from '../dealShipping';

// The reason icons load with the constants; their names are enough here.
jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 9, 15, 12);

const LABELS: Record<DealCourierChoice, string> = {
  alqadmous: 'القدموس',
  aramex: 'أرامكس',
  syrianPost: 'البريد السوري',
  direct: 'توصيل مباشر',
  other: 'أخرى',
};

const ADDRESS: DealShippingAddress = {
  recipientName: 'سارة',
  phone: '+963944123456',
  governorate: { id: '1', label: 'دمشق' },
  city: 'دمشق',
  area: 'المزة',
  addressLine: 'شارع الفيلات، بناء 4',
  landmark: 'قرب الجامع',
  notes: null,
  updatedAt: null,
};

const shipment = (extra: Partial<DealShipment> = {}): DealShipment => ({
  id: 's1',
  sequence: 1,
  courier: 'القدموس',
  trackingNo: 'QD-1',
  trackingUrl: null,
  shippedAt: NOW - 2 * DAY,
  receivedAt: null,
  delayedReportFrom: NOW + 5 * DAY,
  issue: null,
  ...extra,
});

const issue = (answerBy: number | null = NOW + DAY): DealShipment['issue'] => ({
  reason: { key: 'damaged', label: 'تالف' },
  note: null,
  photos: [],
  reportedAt: NOW - DAY,
  answerBy,
});

type ShippingDeal = Pick<Deal, 'status' | 'shippingMode' | 'shipping'>;

const deal = (
  status: DealStatus,
  shipping: Partial<DealShipping> = {},
  mode: 'gift' | 'none' = 'gift',
): ShippingDeal => ({
  status: { key: status, label: '' },
  shippingMode: { key: mode, label: '' },
  shipping: {
    shipBy: NOW + 3 * DAY,
    reshipsLeft: 1,
    freeCancelFrom: null,
    shipments: [],
    address: ADDRESS,
    addressEditable: true,
    ...shipping,
  },
});

describe('dealShippingView', () => {
  it('has no section without a product to ship', () => {
    expect(dealShippingView(deal('product_shipping', {}, 'none'), 'brand', NOW)).toBeNull();
    expect(dealShippingView({ ...deal('product_shipping'), shipping: null }, 'brand', NOW)).toBeNull();
  });

  it('waits for the waybill, then follows the latest shipment', () => {
    expect(dealShippingView(deal('product_shipping'), 'brand', NOW)?.phase).toBe('toShip');
    const older = shipment({ id: 's1', sequence: 1, issue: issue() });
    const latest = shipment({ id: 's2', sequence: 2 });
    const view = dealShippingView(deal('product_shipping', { shipments: [older, latest] }), 'creator', NOW);
    expect(view?.phase).toBe('inTransit');
    expect(view?.current?.id).toBe('s2');
    expect(view?.earlier.map(s => s.id)).toEqual(['s1']);
  });

  it('shows the report while the deal is on a shipping issue', () => {
    const reported = shipment({ issue: issue() });
    const view = dealShippingView(deal('shipping_issue', { shipments: [reported] }), 'brand', NOW);
    expect(view?.phase).toBe('issue');
    expect(view?.current).toBe(reported);
  });

  it('lets only the creator see their address before the money is held', () => {
    expect(dealShippingView(deal('awaiting_payment'), 'creator', NOW)?.phase).toBe('address');
    expect(dealShippingView(deal('awaiting_payment'), 'brand', NOW)).toBeNull();
    expect(dealShippingView(deal('awaiting_payment', { address: null }), 'creator', NOW)).toBeNull();
  });

  it('keeps a receipt row once the product arrived', () => {
    const received = shipment({ receivedAt: NOW - DAY });
    const view = dealShippingView(deal('in_progress', { shipments: [received] }), 'brand', NOW);
    expect(view?.phase).toBe('received');
    expect(view?.current).toBe(received);
    expect(dealShippingView(deal('in_progress'), 'brand', NOW)).toBeNull();
  });

  it('opens the free cancel for the creator from the server time only', () => {
    const open = deal('shipping_issue', { freeCancelFrom: NOW - 1, shipments: [shipment({ issue: issue() })] });
    expect(dealShippingView(open, 'creator', NOW)?.freeCancel).toBe(true);
    expect(dealShippingView(open, 'brand', NOW)?.freeCancel).toBe(false);
    const later = deal('product_shipping', { freeCancelFrom: NOW + 1 });
    expect(dealShippingView(later, 'creator', NOW)?.freeCancel).toBe(false);
  });

  it('never lets the brand edit the address', () => {
    expect(dealShippingView(deal('product_shipping'), 'brand', NOW)?.addressEditable).toBe(false);
    expect(dealShippingView(deal('product_shipping'), 'creator', NOW)?.addressEditable).toBe(true);
  });
});

describe('dealShippingDock', () => {
  const view = (d: ShippingDeal, role: 'brand' | 'creator') => dealShippingView(d, role, NOW);

  it('asks the brand to ship, then to answer a report', () => {
    expect(dealShippingDock(view(deal('product_shipping'), 'brand'), 'brand')).toBe('brandShip');
    const reported = deal('shipping_issue', { shipments: [shipment({ issue: issue() })] });
    expect(dealShippingDock(view(reported, 'brand'), 'brand')).toBe('brandAnswerIssue');
    const moving = deal('product_shipping', { shipments: [shipment()] });
    expect(dealShippingDock(view(moving, 'brand'), 'brand')).toBeNull();
  });

  it('gives the creator receipt, the free cancel or a missing address', () => {
    const moving = deal('product_shipping', { shipments: [shipment()] });
    expect(dealShippingDock(view(moving, 'creator'), 'creator')).toBe('creatorReceive');
    const missed = deal('product_shipping', { freeCancelFrom: NOW - 1 });
    expect(dealShippingDock(view(missed, 'creator'), 'creator')).toBe('creatorFreeCancel');
    const noAddress = deal('product_shipping', { address: null });
    expect(dealShippingDock(view(noAddress, 'creator'), 'creator')).toBe('creatorAddress');
    expect(dealShippingDock(view(deal('product_shipping'), 'creator'), 'creator')).toBeNull();
    expect(dealShippingDock(null, 'creator')).toBeNull();
  });
});

describe('transitDays', () => {
  it('counts the days on the way up to the report day', () => {
    const days = transitDays(shipment({ shippedAt: NOW - 2 * DAY, delayedReportFrom: NOW + 5 * DAY }), NOW);
    expect(days).toEqual({
      elapsed: 2,
      total: 7,
      reportFrom: NOW + 5 * DAY,
      reportOpen: false,
      daysToReport: 5,
    });
  });

  it('opens the delay report on its day and never counts past it', () => {
    const days = transitDays(shipment({ shippedAt: NOW - 9 * DAY, delayedReportFrom: NOW - 2 * DAY }), NOW);
    expect(days.elapsed).toBe(7);
    expect(days.reportOpen).toBe(true);
    expect(days.daysToReport).toBe(0);
  });
});

describe('safeTrackingUrl', () => {
  it('accepts any well-formed https link', () => {
    expect(safeTrackingUrl(' https://track.alqadmous.sy/QD-1 ')).toBe('https://track.alqadmous.sy/QD-1');
    expect(safeTrackingUrl('https://aramex.com:443/track?n=1#top')).toBe('https://aramex.com:443/track?n=1#top');
  });

  it('refuses everything else', () => {
    [
      null,
      '',
      'http://aramex.com',
      'javascript' + ':alert(1)',
      'https://user:pass@aramex.com',
      'https://aramex',
      'https://-bad.com',
      'https://aramex.com/a b',
      'intent://aramex.com',
    ].forEach(raw => expect(safeTrackingUrl(raw)).toBeNull());
  });
});

describe('toSyrianMobile', () => {
  it('turns typed Syrian mobiles into E.164', () => {
    expect(toSyrianMobile('0944123456')).toBe('+963944123456');
    expect(toSyrianMobile('944123456')).toBe('+963944123456');
  });

  it('refuses landlines and short numbers', () => {
    expect(toSyrianMobile('0112345678')).toBeNull();
    expect(toSyrianMobile('09441')).toBeNull();
    expect(toSyrianMobile('')).toBeNull();
  });
});

describe('address helpers', () => {
  it('fills the form from the address, else from the account', () => {
    expect(addressFormValues(ADDRESS, {})).toEqual({
      recipientName: 'سارة',
      phone: '944123456',
      governorateId: '1',
      city: 'دمشق',
      area: 'المزة',
      addressLine: 'شارع الفيلات، بناء 4',
      landmark: 'قرب الجامع',
      notes: '',
    });
    const blank = addressFormValues(null, { name: 'ليلى', phone: '+963933000111' });
    expect(blank.recipientName).toBe('ليلى');
    expect(blank.phone).toBe('933000111');
    expect(blank.city).toBe('');
  });

  it('sends trimmed fields, E.164 and nulls for empty optionals', () => {
    expect(
      toAddressBody({
        recipientName: ' سارة ',
        phone: '0944123456',
        governorateId: '1',
        city: ' دمشق',
        area: 'المزة ',
        addressLine: 'شارع 4',
        landmark: '  ',
        notes: '',
      }),
    ).toEqual({
      recipient_name: 'سارة',
      phone: '+963944123456',
      governorate_id: '1',
      city: 'دمشق',
      area: 'المزة',
      address_line: 'شارع 4',
      landmark: null,
      notes: null,
    });
  });

  it('maps server keys with and without the accept prefix', () => {
    expect(addressFieldMap().address_line).toBe('addressLine');
    expect(addressFieldMap('shipping_address.')['shipping_address.phone']).toBe('phone');
  });

  it('joins the place without repeating a city named like its governorate', () => {
    expect(addressPlace(ADDRESS)).toBe('المزة، دمشق');
    expect(addressText(ADDRESS)).toBe(
      ['سارة', '+963944123456', 'المزة، دمشق', 'شارع الفيلات، بناء 4', 'قرب الجامع'].join('\n'),
    );
  });
});

describe('waybill form', () => {
  it('lands a known courier on its chip, anything else on «other»', () => {
    expect(courierChoiceOf(' أرامكس ', LABELS)).toBe('aramex');
    expect(courierChoiceOf('شركة الفؤاد', LABELS)).toBe('other');
  });

  it('refills an edit from the shipment', () => {
    expect(shipFormValues(null, LABELS)).toEqual({ courier: null, courierName: '', trackingNo: '', trackingUrl: '' });
    expect(shipFormValues(shipment({ courier: 'شركة الفؤاد', trackingUrl: 'https://f.sy/1' }), LABELS)).toEqual({
      courier: 'other',
      courierName: 'شركة الفؤاد',
      trackingNo: 'QD-1',
      trackingUrl: 'https://f.sy/1',
    });
  });

  it('names the courier by its label or the typed name', () => {
    expect(courierName({ courier: 'direct', courierName: 'ignored' }, LABELS)).toBe('توصيل مباشر');
    expect(courierName({ courier: 'other', courierName: ' الفؤاد ' }, LABELS)).toBe('الفؤاد');
    expect(courierName({ courier: null, courierName: '' }, LABELS)).toBe('');
  });

  it('leaves a missing link out of a new shipment but clears it on an edit', () => {
    const values = { courier: 'alqadmous' as const, courierName: '', trackingNo: ' QD-9 ', trackingUrl: '' };
    expect(toShipmentBody(values, LABELS, false)).toEqual({ courier: 'القدموس', tracking_no: 'QD-9' });
    expect(toShipmentBody(values, LABELS, true)).toEqual({
      courier: 'القدموس',
      tracking_no: 'QD-9',
      tracking_url: null,
    });
    expect(toShipmentBody({ ...values, trackingUrl: 'https://q.sy/9' }, LABELS, false).tracking_url).toBe(
      'https://q.sy/9',
    );
  });
});
