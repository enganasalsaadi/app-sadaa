import { fileKindOf } from '@/core/download';
import type { ViewerFile } from '@/shared/ui';
import type { CampaignDetail, CampaignFile } from '../types/campaign';
import type {
  Deal,
  DealFile,
  DealRole,
  DealShipmentPhoto,
  DealVaultFile,
  DealVaultFileSource,
} from '../types/deal';

/** The vault's sections, in screen order. A deal fills the first ones, a campaign `cover` + `brief`. */
export const VAULT_SECTION = [
  'brief',
  'cover',
  'drafts',
  'proofs',
  'dispute',
  'shipping',
  'retention',
  'returns',
] as const;
export type VaultSectionKey = (typeof VAULT_SECTION)[number];

/** What a group's heading says; the screen words it (rounds, publications, shipments…). */
export type VaultGroupLabel =
  | { type: 'none' }
  | { type: 'round'; item: string; round: number }
  | { type: 'publication'; item: string }
  | { type: 'shipment'; sequence: number }
  | { type: 'retention'; item: string };

export interface VaultGroup {
  id: string;
  label: VaultGroupLabel;
  files: ViewerFile[];
}

export interface VaultSection {
  key: VaultSectionKey;
  groups: VaultGroup[];
}

export interface FileVault {
  sections: VaultSection[];
  /** Creator before funding: the brief exists but stays closed. */
  briefLocked: boolean;
}

/**
 * Everything a deal's vault reads: the file list (brief, rounds, proofs, evidence) and the deal for
 * the rest (item titles, the creator's brief lock, courier photos, retention screenshots).
 */
export interface DealVaultSource {
  deal: Deal;
  files: readonly DealVaultFile[];
}

/** The parts of a deal the vault reads. */
export type VaultDeal = Pick<Deal, 'items' | 'briefHidden' | 'shipping' | 'retentionCases' | 'returnShipment'>;

/** Names a photo that came without one (courier-issue photos): «صورة ٢». */
export type PhotoName = (position: number) => string;

/** A deal file as the viewer shows it; `null` = still processing, left out until ready. */
export const toViewerFile = (file: DealFile | CampaignFile): ViewerFile | null => {
  if (file.status === 'pending') return null;
  return {
    id: file.id,
    url: file.status === 'purged' ? null : file.url,
    name: file.name,
    mime: file.mime,
    kind: fileKindOf(file.mime, file.kind),
    size: file.size,
    caption: null,
  };
};

export const toViewerFiles = (files: readonly (DealFile | CampaignFile)[]): ViewerFile[] =>
  files.flatMap(file => toViewerFile(file) ?? []);

/** Photos without an id (courier issues): keyed by where they belong, so a save survives a refetch. */
export const photoViewerFiles = (
  photos: readonly DealShipmentPhoto[],
  key: string,
  photoName: PhotoName,
): ViewerFile[] =>
  photos.map((photo, index) => ({
    id: `${key}:${index}`,
    url: photo.url,
    name: photoName(index + 1),
    mime: photo.mime,
    kind: fileKindOf(photo.mime),
    size: photo.size,
    caption: null,
  }));

const group = (id: string, label: VaultGroupLabel, files: ViewerFile[]): VaultGroup[] =>
  files.length > 0 ? [{ id, label, files }] : [];

const section = (key: VaultSectionKey, groups: VaultGroup[]): VaultSection[] =>
  groups.length > 0 ? [{ key, groups }] : [];

interface FileRun {
  key: string;
  head: DealVaultFile;
  files: DealVaultFile[];
}

/** Neighbouring files that share a key (the list is sorted by it), in list order. */
const runsOf = (files: readonly DealVaultFile[], keyOf: (file: DealVaultFile) => string): FileRun[] =>
  files.reduce<FileRun[]>((runs, file) => {
    const key = keyOf(file);
    const last = runs[runs.length - 1];
    if (last?.key === key) last.files.push(file);
    else runs.push({ key, head: file, files: [file] });
    return runs;
  }, []);

/** Every file a deal carries, grouped the way the vault shows it. */
export const buildDealVault = (
  { deal, files }: { deal: VaultDeal; files: readonly DealVaultFile[] },
  role: DealRole,
  photoName: PhotoName,
): FileVault => {
  const titleOf = (itemId: string | null) => deal.items.find(item => item.id === itemId)?.title ?? '';
  const itemOrder = (itemId: string | null) => deal.items.findIndex(item => item.id === itemId);
  // Courier photos stay on the deal read: their ids are the ones the deal page refreshes by.
  const from = (source: DealVaultFileSource) => files.filter(file => file.source === source);

  // Per item in deal order, newest round first; the sort is stable, so a round keeps the list's order.
  const rounds = runsOf(
    from('draft_round').sort(
      (a, b) => itemOrder(a.itemId) - itemOrder(b.itemId) || (b.round ?? 0) - (a.round ?? 0),
    ),
    file => `${file.itemId ?? ''}:${file.round ?? 0}`,
  ).flatMap(run =>
    group(
      `draft:${run.key}`,
      { type: 'round', item: titleOf(run.head.itemId), round: run.head.round ?? 0 },
      toViewerFiles(run.files),
    ),
  );

  const proofs = runsOf(
    from('publication').sort((a, b) => itemOrder(a.itemId) - itemOrder(b.itemId)),
    file => file.itemId ?? '',
  ).flatMap(run =>
    group(`publication:${run.key}`, { type: 'publication', item: titleOf(run.head.itemId) }, toViewerFiles(run.files)),
  );

  const evidence = group('dispute', { type: 'none' }, toViewerFiles(from('dispute')));

  const shipments = deal.shipping?.shipments ?? [];
  const shipping = shipments.flatMap(shipment =>
    group(
      `shipment:${shipment.id}`,
      shipments.length > 1 ? { type: 'shipment', sequence: shipment.sequence } : { type: 'none' },
      photoViewerFiles(shipment.issue?.photos ?? [], `shipment:${shipment.id}`, photoName),
    ),
  );

  const retention = deal.retentionCases.flatMap(entry =>
    group(`retention:${entry.id}`, { type: 'retention', item: titleOf(entry.itemId) }, [
      ...toViewerFiles(entry.reportFiles),
      ...toViewerFiles(entry.restoreFiles),
    ]),
  );

  const back = deal.returnShipment;
  const returns = back
    ? group(`return:${back.id}`, { type: 'none' }, photoViewerFiles(back.issue?.photos ?? [], `return:${back.id}`, photoName))
    : [];

  return {
    sections: [
      ...section('brief', group('brief', { type: 'none' }, toViewerFiles(from('brief')))),
      ...section('drafts', rounds),
      ...section('proofs', proofs),
      ...section('dispute', evidence),
      ...section('shipping', shipping),
      ...section('retention', retention),
      ...section('returns', returns),
    ],
    briefLocked: role === 'creator' && deal.briefHidden,
  };
};

/** A campaign's attachments: the cover, then the brief files. Brand only. */
export const buildCampaignVault = (campaign: Pick<CampaignDetail, 'attachments'>): FileVault => {
  const of = (purpose: CampaignFile['purpose']) =>
    toViewerFiles(campaign.attachments.filter(file => file.purpose === purpose));
  // A file without a known purpose still belongs to the brief.
  const brief = toViewerFiles(campaign.attachments.filter(file => file.purpose !== 'cover'));
  return {
    sections: [
      ...section('cover', group('cover', { type: 'none' }, of('cover'))),
      ...section('brief', group('brief', { type: 'none' }, brief)),
    ],
    briefLocked: false,
  };
};

/** Every file of a vault in screen order (the viewer pages through this). */
export const vaultFiles = (vault: FileVault): ViewerFile[] =>
  vault.sections.flatMap(entry => entry.groups.flatMap(item => item.files));

/** A fresh link for one file after a refetch; `null` = it's gone (purged or removed). */
export const vaultUrlOf = (vault: FileVault, id: string): string | null =>
  vaultFiles(vault).find(file => file.id === id)?.url ?? null;

/** The chips: every file, or one section. */
export type VaultFilter = 'all' | VaultSectionKey;

/** One cell of the vault grid: a section header and a group heading span the row, a tile one column. */
export type VaultRow =
  | { type: 'section'; key: VaultSectionKey; count: number; bytes: number; ids: readonly string[] }
  | { type: 'group'; id: string; label: VaultGroupLabel }
  | { type: 'tile'; file: ViewerFile; section: VaultSectionKey };

/** A file can be saved while its link lives (purged files stay visible, never selectable). */
export const isSaveable = (file: ViewerFile): boolean => file.url !== null;

const bytesOf = (files: readonly ViewerFile[]) =>
  files.reduce((sum, file) => sum + (isSaveable(file) ? (file.size ?? 0) : 0), 0);

/** Sections the filter shows. */
export const vaultSectionsFor = (vault: FileVault, filter: VaultFilter): VaultSection[] =>
  filter === 'all' ? vault.sections : vault.sections.filter(entry => entry.key === filter);

/** The grid rows for a filter, and which rows pin (the section headers). */
export const vaultRows = (vault: FileVault, filter: VaultFilter): { rows: VaultRow[]; sticky: number[] } => {
  const rows: VaultRow[] = [];
  const sticky: number[] = [];
  for (const entry of vaultSectionsFor(vault, filter)) {
    const files = entry.groups.flatMap(item => item.files);
    sticky.push(rows.length);
    rows.push({
      type: 'section',
      key: entry.key,
      count: files.length,
      bytes: bytesOf(files),
      ids: files.filter(isSaveable).map(file => file.id),
    });
    for (const item of entry.groups) {
      if (item.label.type !== 'none') rows.push({ type: 'group', id: item.id, label: item.label });
      for (const file of item.files) rows.push({ type: 'tile', file, section: entry.key });
    }
  }
  return { rows, sticky };
};

/** Files, bytes and each section's share for the deck (only files that can still be saved weigh). */
export const vaultTotals = (vault: FileVault) => {
  const sections = vault.sections.map(entry => {
    const files = entry.groups.flatMap(item => item.files);
    return { key: entry.key, count: files.length, bytes: bytesOf(files) };
  });
  return {
    count: sections.reduce((sum, entry) => sum + entry.count, 0),
    bytes: sections.reduce((sum, entry) => sum + entry.bytes, 0),
    sections,
  };
};
