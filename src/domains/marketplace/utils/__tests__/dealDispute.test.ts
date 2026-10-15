import type { DealDisputeDetail, DealDisputeEntry, DealDisputeRuling, DealShipment } from '../../types/deal';
import {
  disputePhase,
  evidenceRoom,
  evidenceTally,
  evidenceThread,
  evidenceWindowShare,
  isEvidenceLink,
  isOwnParty,
  pickDispute,
  rulingForViewer,
  rulingLean,
  rulingShares,
  shipmentPhotoRefs,
  toDisputeOpenBody,
  toEvidenceBody,
} from '../dealDispute';

jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: (_target, name) => (name === '__esModule' ? undefined : name) }),
);

const HOUR = 3_600_000;
const usd = (amount: number) => ({ amount, currency: 'USD' as const });

const entry = (overrides: Partial<DealDisputeEntry> = {}): DealDisputeEntry => ({
  id: 'e1',
  party: 'brand',
  note: 'note',
  links: [],
  files: [],
  refs: [],
  createdAt: 1,
  ...overrides,
});

const file = (id: string) => ({
  id,
  kind: 'image' as const,
  name: `${id}.jpg`,
  mime: 'image/jpeg',
  size: 10,
  status: null,
  url: `https://cdn.example/${id}.jpg`,
});

const dispute = (overrides: Partial<DealDisputeDetail> = {}): DealDisputeDetail => ({
  id: 'd1',
  status: { key: 'open', label: 'Open' },
  openedBy: 'brand',
  reason: { key: 'poor_quality', label: 'Poor quality' },
  statement: 'The video ignores the brief entirely.',
  priorStatus: 'in_progress',
  evidenceOpen: true,
  evidenceDueAt: 10 * HOUR,
  evidenceClosedAt: null,
  adminTargetAt: null,
  withdrawnAt: null,
  ruling: null,
  openedAt: 0,
  closedAt: null,
  entries: [],
  ...overrides,
});

const ruling = (overrides: Partial<DealDisputeRuling> = {}): DealDisputeRuling => ({
  outcome: { key: 'split', label: 'Split' },
  reason: null,
  brandAmount: usd(4000),
  creatorAmount: usd(6000),
  commission: usd(600),
  creatorNet: usd(5400),
  resolvedAt: null,
  ...overrides,
});

describe('isOwnParty', () => {
  it('maps the creator role to the server `influencer`', () => {
    expect(isOwnParty('influencer', 'creator')).toBe(true);
    expect(isOwnParty('brand', 'brand')).toBe(true);
    expect(isOwnParty('brand', 'creator')).toBe(false);
    expect(isOwnParty(null, 'brand')).toBe(false);
  });
});

describe('pickDispute', () => {
  const list = [dispute({ id: 'a' }), dispute({ id: 'b' })];
  it('finds the deal’s dispute, else the latest', () => {
    expect(pickDispute(list, 'a')?.id).toBe('a');
    expect(pickDispute(list, 'zzz')?.id).toBe('b');
    expect(pickDispute(list, null)?.id).toBe('b');
    expect(pickDispute([], 'a')).toBeNull();
  });
});

describe('disputePhase', () => {
  it('walks evidence → review → ruled, and withdrawn wins', () => {
    expect(disputePhase(dispute())).toBe('evidence');
    expect(disputePhase(dispute({ evidenceOpen: false }))).toBe('review');
    expect(disputePhase(dispute({ status: { key: 'resolved', label: 'Resolved' }, evidenceOpen: false }))).toBe('ruled');
    expect(disputePhase(dispute({ ruling: ruling() }))).toBe('ruled');
    expect(disputePhase(dispute({ status: { key: 'withdrawn', label: 'Withdrawn' } }))).toBe('withdrawn');
  });

  it('treats an unknown status by its fields', () => {
    expect(disputePhase(dispute({ status: { key: null, label: '?' }, evidenceOpen: false }))).toBe('review');
  });
});

describe('evidenceThread', () => {
  it('drops the opener’s statement-only first entry', () => {
    const d = dispute({
      entries: [entry({ id: 's', note: 'The video ignores the brief entirely.' }), entry({ id: 'x' })],
    });
    expect(evidenceThread(d).map(e => e.id)).toEqual(['x']);
  });

  it('keeps the first entry when it carries more than the statement', () => {
    const d = dispute({
      entries: [entry({ id: 's', note: 'The video ignores the brief entirely.', links: ['https://a.co'] })],
    });
    expect(evidenceThread(d).map(e => e.id)).toEqual(['s']);
  });

  it('keeps it when the other side wrote it', () => {
    const d = dispute({ entries: [entry({ id: 's', party: 'influencer', note: 'The video ignores the brief entirely.' })] });
    expect(evidenceThread(d)).toHaveLength(1);
  });
});

describe('evidenceTally / evidenceRoom', () => {
  const entries = [
    entry({ party: 'brand', files: [file('a'), file('b')], links: ['https://x.co'] }),
    entry({ party: 'influencer', files: [file('c')] }),
    entry({ party: 'admin' }),
  ];

  it('counts each side; admin entries count for neither', () => {
    expect(evidenceTally(entries, 'brand')).toEqual({
      mine: { entries: 1, files: 2, links: 1 },
      theirs: { entries: 1, files: 1, links: 0 },
    });
    expect(evidenceTally(entries, 'creator').mine).toEqual({ entries: 1, files: 1, links: 0 });
  });

  it('leaves the room under the per-side caps, never below zero', () => {
    expect(evidenceRoom({ entries: 1, files: 2, links: 1 })).toEqual({ entries: 19, files: 8, links: 9 });
    expect(evidenceRoom({ entries: 25, files: 12, links: 10 })).toEqual({ entries: 0, files: 0, links: 0 });
  });
});

describe('evidenceWindowShare', () => {
  it('runs from 1 to 0 over 24 hours and clamps', () => {
    expect(evidenceWindowShare(24 * HOUR, 0)).toBe(1);
    expect(evidenceWindowShare(12 * HOUR, 0)).toBe(0.5);
    expect(evidenceWindowShare(0, HOUR)).toBe(0);
    expect(evidenceWindowShare(48 * HOUR, 0)).toBe(1);
    expect(evidenceWindowShare(null, 0)).toBe(0);
  });
});

describe('isEvidenceLink', () => {
  it('takes well-formed https only, within the cap', () => {
    expect(isEvidenceLink('https://drive.google.com/file/d/1')).toBe(true);
    expect(isEvidenceLink('  https://example.com/a  ')).toBe(true);
    expect(isEvidenceLink('http://example.com')).toBe(false);
    expect(isEvidenceLink('example.com')).toBe(false);
    expect(isEvidenceLink('')).toBe(false);
    expect(isEvidenceLink(`https://example.com/${'a'.repeat(2048)}`)).toBe(false);
  });
});

describe('request bodies', () => {
  it('trims the statement', () => {
    expect(toDisputeOpenBody({ reason: 'other', statement: '  it broke  ' })).toEqual({
      reason: 'other',
      statement: 'it broke',
    });
  });

  it('leaves empty lists out of the evidence body and maps refs to snake_case', () => {
    expect(toEvidenceBody({ note: ' see ', links: [], fileIds: [], refs: [] })).toEqual({ note: 'see' });
    expect(
      toEvidenceBody({
        note: 'n',
        links: ['https://a.co'],
        fileIds: ['f1'],
        refs: [
          { type: 'file', id: 'f9' },
          { type: 'shipment_photo', shipmentId: 's1', index: 2 },
        ],
      }),
    ).toEqual({
      note: 'n',
      links: ['https://a.co'],
      file_ids: ['f1'],
      refs: [
        { type: 'file', id: 'f9' },
        { type: 'shipment_photo', shipment_id: 's1', index: 2 },
      ],
    });
  });
});

describe('shipmentPhotoRefs', () => {
  const shipment = (id: string, urls: Array<string | null> | null): DealShipment => ({
    id,
    sequence: 1,
    courier: 'c',
    trackingNo: 't',
    trackingUrl: null,
    shippedAt: 0,
    receivedAt: null,
    delayedReportFrom: 0,
    issue:
      urls === null
        ? null
        : {
            reason: { key: null, label: 'x' },
            note: null,
            photos: urls.map(url => ({ url, mime: 'image/jpeg', size: 1 })),
            reportedAt: null,
            answerBy: null,
          },
  });

  it('keeps each photo’s place in its report and skips purged ones', () => {
    expect(shipmentPhotoRefs([shipment('a', ['u0', null, 'u2']), shipment('b', null)])).toEqual([
      { key: 'a:0', shipmentId: 'a', index: 0, url: 'u0' },
      { key: 'a:2', shipmentId: 'a', index: 2, url: 'u2' },
    ]);
  });
});

describe('ruling', () => {
  it('splits by the server figures and drops empty shares', () => {
    expect(rulingShares(ruling()).map(share => share.key)).toEqual(['refund', 'creator', 'commission']);
    expect(rulingShares(ruling({ brandAmount: usd(0) })).map(share => share.key)).toEqual(['creator', 'commission']);
  });

  it('leans toward the side with the larger gross amount', () => {
    expect(rulingLean(ruling())).toBe('creator');
    expect(rulingLean(ruling({ brandAmount: usd(9000), creatorAmount: usd(1000) }))).toBe('brand');
    expect(rulingLean(ruling({ brandAmount: usd(5000), creatorAmount: usd(5000) }))).toBe('even');
  });

  it('shows the brand its refund and the creator the net', () => {
    expect(rulingForViewer(ruling(), 'brand')).toEqual(usd(4000));
    expect(rulingForViewer(ruling(), 'creator')).toEqual(usd(5400));
  });
});
