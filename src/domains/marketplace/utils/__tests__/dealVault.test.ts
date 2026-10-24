import type { CampaignFile, Deal, DealFile, DealItemStatus } from '../../types';
import type { DealVaultFile } from '../../types/deal';
import {
  buildCampaignVault,
  buildDealVault,
  toViewerFile,
  vaultFiles,
  vaultRows,
  vaultTotals,
  vaultUrlOf,
  type VaultDeal,
} from '../dealVault';

const file = (id: string, overrides: Partial<DealFile> = {}): DealFile => ({
  id,
  kind: 'image',
  name: `${id}.jpg`,
  mime: 'image/jpeg',
  size: 1000,
  status: 'ready',
  url: `https://files.test/${id}`,
  ...overrides,
});

const item = (id: string, key: DealItemStatus) =>
  ({ id, title: `T:${id}`, status: { key, label: key } }) as unknown as Deal['items'][number];

const deal = (overrides: Partial<VaultDeal> = {}): VaultDeal => ({
  items: [item('a', 'verified'), item('b', 'draft_submitted')],
  briefHidden: false,
  shipping: null,
  retentionCases: [],
  returnShipment: null,
  ...overrides,
});

const listed = (
  id: string,
  source: DealVaultFile['source'],
  overrides: Partial<DealVaultFile> = {},
): DealVaultFile => ({ ...file(id), source, itemId: null, round: null, ...overrides });

const round = (id: string, itemId: string, n: number, overrides: Partial<DealVaultFile> = {}) =>
  listed(id, 'draft_round', { itemId, round: n, ...overrides });

const brief = [
  listed('brief-1', 'brief'),
  listed('brief-2', 'brief', { kind: 'document', mime: 'application/pdf', name: 'b.pdf' }),
];

const photoName = (n: number) => `photo ${n}`;

describe('toViewerFile', () => {
  it('leaves out files still processing and drops the link of purged ones', () => {
    expect(toViewerFile(file('p', { status: 'pending' }))).toBeNull();
    expect(toViewerFile(file('x', { status: 'purged' }))).toMatchObject({ id: 'x', url: null });
    expect(toViewerFile(file('v', { kind: null, mime: 'video/mp4' }))?.kind).toBe('video');
  });
});

describe('buildDealVault', () => {
  it('groups brief, rounds by item (newest first), proofs, evidence and courier photos in screen order', () => {
    const vault = buildDealVault(
      {
        deal: deal({
          shipping: {
            shipFrom: null,
            shipBy: null,
            reshipsLeft: 0,
            freeCancelFrom: null,
            address: null,
            addressEditable: false,
            shipments: [
              {
                id: 's1',
                sequence: 1,
                courier: 'c',
                trackingNo: '1',
                trackingUrl: null,
                shippedAt: 0,
                receivedAt: null,
                delayedReportFrom: 0,
                issue: {
                  reason: { key: null, label: 'x' },
                  note: null,
                  photos: [{ url: 'https://files.test/ph', mime: 'image/jpeg', size: 5 }],
                  reportedAt: null,
                  answerBy: null,
                },
              },
            ],
          },
        }),
        files: [
          listed('ev', 'dispute'),
          round('b1f', 'b', 1),
          round('a2f', 'a', 2),
          listed('proof', 'publication', { itemId: 'a' }),
          round('a2g', 'a', 2),
          round('a1f', 'a', 1),
          round('a2p', 'a', 2, { status: 'pending' }),
          listed('ship-0', 'shipment', { kind: null }),
          listed('odd', null),
          ...brief,
        ],
      },
      'brand',
      photoName,
    );

    expect(vault.sections.map(entry => entry.key)).toEqual(['brief', 'drafts', 'proofs', 'dispute', 'shipping']);
    const rounds = vault.sections[1]?.groups ?? [];
    expect(rounds.map(entry => entry.id)).toEqual(['draft:a:2', 'draft:a:1', 'draft:b:1']);
    expect(rounds[0]?.label).toEqual({ type: 'round', item: 'T:a', round: 2 });
    expect(rounds[0]?.files.map(entry => entry.id)).toEqual(['a2f', 'a2g']);
    expect(vault.sections[2]?.groups[0]?.label).toEqual({ type: 'publication', item: 'T:a' });
    expect(vault.sections[4]?.groups[0]?.files[0]).toMatchObject({ id: 'shipment:s1:0', name: 'photo 1' });
    expect(vaultFiles(vault)).toHaveLength(9);
    expect(vault.briefLocked).toBe(false);
  });

  it('locks the brief for a creator before funding, and drops empty sections', () => {
    const vault = buildDealVault(
      { deal: deal({ briefHidden: true }), files: [] },
      'creator',
      photoName,
    );
    expect(vault).toEqual({ sections: [], briefLocked: true });
    expect(
      buildDealVault({ deal: deal({ briefHidden: true }), files: brief }, 'brand', photoName)
        .briefLocked,
    ).toBe(false);
  });

  it('finds a fresh link by id, null once gone', () => {
    const vault = buildDealVault({ deal: deal(), files: brief }, 'brand', photoName);
    expect(vaultUrlOf(vault, 'brief-1')).toBe('https://files.test/brief-1');
    expect(vaultUrlOf(vault, 'missing')).toBeNull();
  });
});

describe('buildCampaignVault', () => {
  const attachment = (id: string, purpose: CampaignFile['purpose']): CampaignFile => ({
    id,
    purpose,
    kind: 'image',
    name: `${id}.jpg`,
    mime: 'image/jpeg',
    size: 10,
    status: 'ready',
    url: `https://files.test/${id}`,
  });

  it('puts the cover first and every other attachment in the brief', () => {
    const vault = buildCampaignVault({
      attachments: [attachment('b', 'brief'), attachment('c', 'cover'), attachment('u', null)],
    });
    expect(vault.sections.map(entry => [entry.key, entry.groups[0]?.files.map(f => f.id)])).toEqual([
      ['cover', ['c']],
      ['brief', ['b', 'u']],
    ]);
  });
});

describe('vaultRows', () => {
  const vault = buildDealVault(
    {
      deal: deal(),
      files: [
        listed('b1', 'brief'),
        listed('gone', 'brief', { status: 'purged', size: 99 }),
        round('f1', 'a', 1, { size: 4000 }),
      ],
    },
    'brand',
    photoName,
  );

  it('pins section headers, heads labelled groups and keeps purged files out of the save list', () => {
    const { rows, sticky } = vaultRows(vault, 'all');
    expect(rows.map(row => row.type)).toEqual(['section', 'tile', 'tile', 'section', 'group', 'tile']);
    expect(sticky).toEqual([0, 3]);
    expect(rows[0]).toMatchObject({ key: 'brief', count: 2, bytes: 1000, ids: ['b1'] });
  });

  it('shows one section under its chip, and totals only what can be saved', () => {
    expect(vaultRows(vault, 'drafts').rows.map(row => row.type)).toEqual(['section', 'group', 'tile']);
    expect(vaultRows(vault, 'proofs').rows).toEqual([]);
    expect(vaultTotals(vault)).toMatchObject({ count: 3, bytes: 5000 });
  });
});
