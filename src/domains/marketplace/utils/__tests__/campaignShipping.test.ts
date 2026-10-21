import type { CampaignShipmentInput, CampaignShippingRow } from '../../types/campaignShipping';
import {
  buildShipmentInputs,
  campaignParcels,
  campaignShippingTotals,
  chunkShipments,
  EMPTY_SHIPPING_DRAFT,
  mergeShipmentReports,
  nextParcelOpening,
  parcelCanShip,
  shipmentChunkSignature,
  type CampaignShippingDraft,
} from '../campaignShipping';

// The reason icons load with the courier constants; their names are enough here.
jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

const NOW = Date.parse('2026-11-01T09:00:00Z');
const HOUR = 3_600_000;

const row = (dealId: string, overrides: Partial<CampaignShippingRow> = {}): CampaignShippingRow => ({
  dealId,
  kind: 'first',
  dealStatus: { key: 'product_shipping', label: 'x' },
  slug: dealId,
  name: dealId,
  avatarUrl: null,
  ready: true,
  blockers: [],
  shipFrom: null,
  shipBy: null,
  reshipmentsLeft: 2,
  lastShipment: null,
  address: null,
  ...overrides,
});

describe('campaignParcels', () => {
  it('locks a first shipment inside the creator brief window and opens it by the clock', () => {
    const rows = [row('d1', { ready: false, blockers: ['brief_window'], shipFrom: NOW + 5 * HOUR })];
    const locked = campaignParcels(rows, {}, {}, NOW)[0];
    expect(locked).toMatchObject({ state: 'locked', opensAt: NOW + 5 * HOUR, addressMissing: false });
    // The manifest is stale: the window closed an hour ago.
    expect(campaignParcels(rows, {}, {}, NOW + 6 * HOUR)[0]?.state).toBe('ready');
  });

  it('locks a first shipment without the creator address', () => {
    const [parcel] = campaignParcels([row('d1', { ready: false, blockers: ['address_missing'] })], {}, {}, NOW);
    expect(parcel).toMatchObject({ state: 'locked', addressMissing: true, opensAt: null });
  });

  it('honours a server «not ready» for a reason it does not know', () => {
    expect(campaignParcels([row('d1', { ready: false })], {}, {}, NOW)[0]?.state).toBe('locked');
  });

  it('never locks a re-ship', () => {
    const [parcel] = campaignParcels(
      [row('d1', { kind: 'reship', ready: false, blockers: ['brief_window', 'address_missing'], shipFrom: NOW + HOUR })],
      {},
      {},
      NOW,
    );
    expect(parcel).toMatchObject({ state: 'ready', reship: true, opensAt: null, addressMissing: false });
  });

  it('orders failed first, then ready, locked and sent, keeping the server order inside a state', () => {
    const rows = [
      row('locked', { ready: false, blockers: ['address_missing'] }),
      row('ready1'),
      row('failed'),
      row('ready2'),
      row('done'),
    ];
    const parcels = campaignParcels(
      rows,
      { failed: { code: 'deal_address_missing', message: 'عنوان ناقص', shipFrom: null } },
      { done: { row: row('done'), courier: 'أرامكس', trackingNo: 'A1', sentAt: NOW } },
      NOW,
    );
    expect(parcels.map(parcel => [parcel.row.dealId, parcel.state])).toEqual([
      ['failed', 'failed'],
      ['ready1', 'ready'],
      ['ready2', 'ready'],
      ['locked', 'locked'],
      ['done', 'sent'],
    ]);
    expect(parcels[0]?.failure?.message).toBe('عنوان ناقص');
  });

  it('locks a failed row that says the brief window is still open, with the server ship_from', () => {
    const [parcel] = campaignParcels(
      [row('d1')],
      { d1: { code: 'campaign_brief_window_open', message: 'm', shipFrom: NOW + 2 * HOUR } },
      {},
      NOW,
    );
    expect(parcel).toMatchObject({ state: 'locked', opensAt: NOW + 2 * HOUR, failure: null });
  });

  it('keeps a parcel sent in this visit after a refreshed manifest no longer lists it', () => {
    const sent = { row: row('gone'), courier: 'القدموس', trackingNo: 'Q1', sentAt: NOW };
    const parcels = campaignParcels([row('d1')], {}, { gone: sent }, NOW);
    expect(parcels.map(parcel => parcel.row.dealId)).toEqual(['d1', 'gone']);
    expect(parcels[1]).toMatchObject({ state: 'sent', sent });
  });
});

describe('campaignShippingTotals', () => {
  it('counts what is still on screen and adds the shipped to the server count', () => {
    const parcels = campaignParcels(
      [row('a'), row('b'), row('c', { ready: false, blockers: ['address_missing'] }), row('d')],
      {},
      { d: { row: row('d'), courier: 'x', trackingNo: 'y', sentAt: NOW } },
      NOW,
    );
    expect(campaignShippingTotals(parcels, 5)).toEqual({ awaiting: 3, ready: 2, blocked: 1, shipped: 5 });
  });
});

describe('parcelCanShip', () => {
  it('lets ready and failed parcels ship, not locked or sent ones', () => {
    expect(parcelCanShip({ state: 'ready' })).toBe(true);
    expect(parcelCanShip({ state: 'failed' })).toBe(true);
    expect(parcelCanShip({ state: 'locked' })).toBe(false);
    expect(parcelCanShip({ state: 'sent' })).toBe(false);
  });
});

describe('buildShipmentInputs', () => {
  const draft = (overrides: Partial<CampaignShippingDraft>): CampaignShippingDraft => ({
    ...EMPTY_SHIPPING_DRAFT,
    selected: true,
    courier: 'aramex',
    trackingNo: ' AR-1 ',
    ...overrides,
  });

  it('builds the body rows of the ticked, shippable parcels only', () => {
    const parcels = campaignParcels(
      [row('a'), row('b'), row('c', { ready: false, blockers: ['address_missing'] }), row('d')],
      {},
      {},
      NOW,
    );
    const inputs = buildShipmentInputs(
      parcels,
      {
        a: draft({ trackingUrl: 'https://track.example.com/AR-1' }),
        b: draft({ selected: false }),
        c: draft({}),
        d: draft({ courier: 'other', courierName: ' توصيلنا ', trackingNo: 'T9', trackingUrl: 'http://bad' }),
      },
    );
    expect(inputs).toEqual<CampaignShipmentInput[]>([
      { dealId: 'a', courier: 'aramex', courierName: null, trackingNo: 'AR-1', trackingUrl: 'https://track.example.com/AR-1' },
      { dealId: 'd', courier: 'other', courierName: 'توصيلنا', trackingNo: 'T9', trackingUrl: null },
    ]);
  });
});

describe('chunking', () => {
  it('splits 45 parcels into 20, 20 and 5, and leaves a small batch whole', () => {
    const items = Array.from({ length: 45 }, (_, index) => index);
    expect(chunkShipments(items).map(chunk => chunk.length)).toEqual([20, 20, 5]);
    expect(chunkShipments([1, 2]).map(chunk => chunk.length)).toEqual([2]);
    expect(chunkShipments([])).toEqual([]);
  });

  it('signs the same chunk the same way and a changed waybill differently', () => {
    const base: CampaignShipmentInput = { dealId: 'a', courier: 'x', courierName: null, trackingNo: '1', trackingUrl: null };
    expect(shipmentChunkSignature([base])).toBe(shipmentChunkSignature([{ ...base }]));
    expect(shipmentChunkSignature([base])).not.toBe(shipmentChunkSignature([{ ...base, trackingNo: '2' }]));
  });
});

describe('mergeShipmentReports', () => {
  it('adds the counts and keeps every row result in order', () => {
    const merged = mergeShipmentReports([
      { total: 2, shipped: 1, failed: 1, results: [{ dealId: 'a', ok: true }, { dealId: 'b', ok: false, code: null, message: '', shipFrom: null }] },
      { total: 1, shipped: 1, failed: 0, results: [{ dealId: 'c', ok: true }] },
    ]);
    expect(merged).toMatchObject({ total: 3, shipped: 2, failed: 1 });
    expect(merged.results.map(result => result.dealId)).toEqual(['a', 'b', 'c']);
  });
});

describe('nextParcelOpening', () => {
  it('finds the earliest future opening among locked parcels', () => {
    const parcels = campaignParcels(
      [
        row('a', { ready: false, blockers: ['brief_window'], shipFrom: NOW + 3 * HOUR }),
        row('b', { ready: false, blockers: ['brief_window'], shipFrom: NOW + HOUR }),
        row('c'),
      ],
      {},
      {},
      NOW,
    );
    expect(nextParcelOpening(parcels, NOW)).toBe(NOW + HOUR);
    expect(nextParcelOpening([], NOW)).toBeNull();
  });
});
