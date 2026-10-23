import type { CampaignFile, Deal, DealDraft, DealFile, DealItemStatus, DealPublication } from '../../types';
import {
  buildCampaignVault,
  buildDealVault,
  toViewerFile,
  vaultDraftItems,
  vaultFiles,
  vaultPublishItems,
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
  briefAttachments: [file('brief-1'), file('brief-2', { kind: 'document', mime: 'application/pdf', name: 'b.pdf' })],
  briefHidden: false,
  shipping: null,
  retentionCases: [],
  returnShipment: null,
  ...overrides,
});

const draft = (id: string, itemId: string, round: number, files: DealFile[]): DealDraft => ({
  id,
  itemId,
  round,
  caption: null,
  submittedAt: 0,
  files,
  review: null,
});

const publication = (id: string, itemId: string, sequence: number, proofs: DealFile[]): DealPublication => ({
  id,
  itemId,
  sequence,
  url: null,
  platform: null,
  handle: null,
  handleChecked: true,
  submittedAt: 0,
  proofs,
  review: null,
});

const photoName = (n: number) => `photo ${n}`;

describe('toViewerFile', () => {
  it('leaves out files still processing and drops the link of purged ones', () => {
    expect(toViewerFile(file('p', { status: 'pending' }))).toBeNull();
    expect(toViewerFile(file('x', { status: 'purged' }))).toMatchObject({ id: 'x', url: null });
    expect(toViewerFile(file('v', { kind: null, mime: 'video/mp4' }))?.kind).toBe('video');
  });
});

describe('vault items', () => {
  it('asks rounds of items past pending and publications of items that reached publishing', () => {
    const shape = { items: [item('p', 'pending'), item('d', 'revision_requested'), item('v', 'verifying_live')] };
    expect(vaultDraftItems(shape).map(entry => entry.id)).toEqual(['d', 'v']);
    expect(vaultPublishItems(shape).map(entry => entry.id)).toEqual(['v']);
  });
});

describe('buildDealVault', () => {
  it('groups brief, rounds by item (newest first), proofs and courier photos in screen order', () => {
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
        drafts: [
          draft('b1', 'b', 1, [file('b1f')]),
          draft('a1', 'a', 1, [file('a1f')]),
          draft('a2', 'a', 2, [file('a2f'), file('a2p', { status: 'pending' })]),
          draft('empty', 'a', 3, []),
        ],
        publications: [publication('p1', 'a', 1, [file('proof')])],
        disputes: [],
      },
      'brand',
      photoName,
    );

    expect(vault.sections.map(entry => entry.key)).toEqual(['brief', 'drafts', 'proofs', 'shipping']);
    const rounds = vault.sections[1]?.groups ?? [];
    expect(rounds.map(entry => entry.id)).toEqual(['draft:a2', 'draft:a1', 'draft:b1']);
    expect(rounds[0]?.label).toEqual({ type: 'round', item: 'T:a', round: 2, review: null });
    expect(rounds[0]?.files.map(entry => entry.id)).toEqual(['a2f']);
    expect(vault.sections[3]?.groups[0]?.files[0]).toMatchObject({ id: 'shipment:s1:0', name: 'photo 1' });
    expect(vaultFiles(vault)).toHaveLength(7);
    expect(vault.briefLocked).toBe(false);
  });

  it('locks the brief for a creator before funding, and drops empty sections', () => {
    const vault = buildDealVault(
      { deal: deal({ briefHidden: true, briefAttachments: [] }), drafts: [], publications: [], disputes: [] },
      'creator',
      photoName,
    );
    expect(vault).toEqual({ sections: [], briefLocked: true });
    expect(
      buildDealVault({ deal: deal({ briefHidden: true }), drafts: [], publications: [], disputes: [] }, 'brand', photoName)
        .briefLocked,
    ).toBe(false);
  });

  it('finds a fresh link by id, null once gone', () => {
    const vault = buildDealVault({ deal: deal(), drafts: [], publications: [], disputes: [] }, 'brand', photoName);
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
      deal: deal({ briefAttachments: [file('b1'), file('gone', { status: 'purged', size: 99 })] }),
      drafts: [draft('d1', 'a', 1, [file('f1', { size: 4000 })])],
      publications: [],
      disputes: [],
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
