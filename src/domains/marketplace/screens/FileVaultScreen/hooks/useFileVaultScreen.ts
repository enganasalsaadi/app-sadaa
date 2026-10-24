import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Platform, Vibration } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useRoute, type RouteProp } from '@react-navigation/native';
import { HAPTIC_SUCCESS_MS, HAPTIC_TAP_MS } from '@/core/config';
import {
  canBatchSave,
  downloads,
  useDownloadBatch,
  useDownloadEntries,
  type RefreshUrl,
} from '@/core/download';
import type { DealsStackParamList } from '@/core/navigation';
import { useToast } from '@/core/toast';
import { useFileViewer, type ViewerFile } from '@/shared/ui';
import { useGetCampaignQuery } from '../../../api/brandCampaignsApi';
import { DEAL_FILES_FRESH_SECONDS, useGetDealFilesQuery } from '../../../api/dealFilesApi';
import { useDealFileRefresh } from '../../../hooks/useDealFileRefresh';
import type { DealRole } from '../../../types';
import {
  buildCampaignVault,
  buildDealVault,
  isSaveable,
  vaultRows,
  vaultSectionsFor,
  vaultTotals,
  vaultUrlOf,
  type FileVault,
  type VaultFilter,
  type VaultGroupLabel,
  type VaultSectionKey,
} from '../../../utils/dealVault';

export type VaultSource = 'deal' | 'campaign';

const SECTION_KEY = {
  brief: 'marketplace.vault.sections.brief',
  cover: 'marketplace.vault.sections.cover',
  drafts: 'marketplace.vault.sections.drafts',
  proofs: 'marketplace.vault.sections.proofs',
  dispute: 'marketplace.vault.sections.dispute',
  shipping: 'marketplace.vault.sections.shipping',
  retention: 'marketplace.vault.sections.retention',
  returns: 'marketplace.vault.sections.returns',
} as const satisfies Record<VaultSectionKey, string>;

/** The most previews the deck fans out. */
const DECK_PREVIEWS = 3;

export interface VaultDeckPreview {
  id: string;
  uri: string | null;
  kind: ViewerFile['kind'];
}

/** The run the dock shows: in flight, or finished and waiting to be dismissed. */
export interface VaultBatchView {
  finished: boolean;
  settled: number;
  total: number;
  doneBytes: number;
  totalBytes: number;
  saved: number;
  failed: number;
  /** iOS documents on the device, waiting for the Files sheet. */
  ready: readonly string[];
}

/**
 * The files vault (deal: both roles · campaign: brand): every file grouped by where it belongs,
 * filters, the viewer, single saves from a tile's corner, «download all» / select mode through the
 * shared download queue, and the run's progress in the dock. Expired links refresh once, quietly.
 */
export const useFileVaultScreen = (source: VaultSource, role: DealRole) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { params } = useRoute<RouteProp<DealsStackParamList, 'DealFiles' | 'CampaignFiles'>>();
  const { id } = params;

  // The deal page keeps an older read alive underneath; its signed links may have run out.
  const dealQuery = useGetDealFilesQuery(
    { role, id },
    { skip: source !== 'deal', refetchOnMountOrArgChange: DEAL_FILES_FRESH_SECONDS },
  );
  // Same for the campaign page underneath: its covers and brief files carry signed links too.
  const campaignQuery = useGetCampaignQuery(id, {
    skip: source !== 'campaign',
    refetchOnMountOrArgChange: DEAL_FILES_FRESH_SECONDS,
  });
  const query = source === 'deal' ? dealQuery : campaignQuery;
  const refreshDealUrl = useDealFileRefresh(role, id);
  const refetchCampaign = campaignQuery.refetch;

  const refreshUrl = useCallback<RefreshUrl>(
    async fileId => {
      if (source === 'deal') return refreshDealUrl(fileId);
      const campaign = await refetchCampaign().unwrap();
      return vaultUrlOf(buildCampaignVault(campaign), fileId);
    },
    [refetchCampaign, refreshDealUrl, source],
  );

  const sectionName = useCallback((key: VaultSectionKey) => t(SECTION_KEY[key]), [t]);
  const groupName = useCallback(
    (label: VaultGroupLabel): string | null => {
      switch (label.type) {
        case 'none':
          return null;
        case 'round':
          return t('marketplace.vault.group.round', label);
        case 'shipment':
          return t('marketplace.vault.group.shipment', label);
        case 'publication':
        case 'retention':
          return t('marketplace.vault.group.item', label);
        default: {
          const _exhaustive: never = label;
          return _exhaustive;
        }
      }
    },
    [t],
  );

  // Each file carries where it belongs, for the viewer's top bar.
  const vault = useMemo<FileVault | null>(() => {
    const photoName = (n: number) => t('marketplace.vault.photoName', { n });
    const raw =
      source === 'deal'
        ? dealQuery.data
          ? buildDealVault(dealQuery.data, role, photoName)
          : null
        : campaignQuery.data
          ? buildCampaignVault(campaignQuery.data)
          : null;
    if (!raw) return null;
    return {
      ...raw,
      sections: raw.sections.map(entry => ({
        ...entry,
        groups: entry.groups.map(item => {
          const section = sectionName(entry.key);
          const heading = groupName(item.label);
          const caption = heading ? t('marketplace.vault.caption', { section, group: heading }) : section;
          return { ...item, files: item.files.map(file => ({ ...file, caption })) };
        }),
      })),
    };
  }, [campaignQuery.data, dealQuery.data, groupName, role, sectionName, source, t]);

  const [filter, setFilter] = useState<VaultFilter>('all');
  const shownFilter: VaultFilter =
    filter !== 'all' && vault && !vault.sections.some(entry => entry.key === filter) ? 'all' : filter;

  const { rows, sticky } = useMemo(
    () => (vault ? vaultRows(vault, shownFilter) : { rows: [], sticky: [] }),
    [shownFilter, vault],
  );
  const totals = useMemo(() => (vault ? vaultTotals(vault) : null), [vault]);

  const shownFiles = useMemo(
    () => (vault ? vaultSectionsFor(vault, shownFilter).flatMap(entry => entry.groups.flatMap(item => item.files)) : []),
    [shownFilter, vault],
  );
  const viewerFiles = useMemo(() => shownFiles.filter(isSaveable), [shownFiles]);
  const viewer = useFileViewer(viewerFiles);

  // Every openable file whatever the filter: a selection made under one chip survives the next.
  const saveableFiles = useMemo(
    () => (vault ? vault.sections.flatMap(entry => entry.groups.flatMap(item => item.files)) : []).filter(isSaveable),
    [vault],
  );

  const previews = useMemo<VaultDeckPreview[]>(
    () =>
      saveableFiles
        .slice(-DECK_PREVIEWS)
        .map(file => ({ id: file.id, uri: file.kind === 'image' ? file.url : null, kind: file.kind })),
    [saveableFiles],
  );

  const chips = useMemo(
    () =>
      totals
        ? [
            { value: 'all' as VaultFilter, label: t('marketplace.vault.all'), count: totals.count },
            ...totals.sections.map(entry => ({
              value: entry.key as VaultFilter,
              label: sectionName(entry.key),
              count: entry.count,
            })),
          ]
        : [],
    [sectionName, t, totals],
  );

  // ─── Selection ──────────────────────────────────────────────────────────────
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  const saveableIds = useMemo(() => viewerFiles.map(file => file.id), [viewerFiles]);

  const enterSelect = useCallback((fileId?: string) => {
    Vibration.vibrate(HAPTIC_TAP_MS);
    setSelecting(true);
    setSelected(fileId ? new Set([fileId]) : new Set());
  }, []);
  const exitSelect = useCallback(() => {
    setSelecting(false);
    setSelected(new Set());
  }, []);
  const toggle = useCallback((fileId: string) => {
    setSelected(current => {
      const next = new Set(current);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  }, []);
  const toggleMany = useCallback((ids: readonly string[]) => {
    setSelected(current => {
      const next = new Set(current);
      const all = ids.every(fileId => next.has(fileId));
      for (const fileId of ids) {
        if (all) next.delete(fileId);
        else next.add(fileId);
      }
      return next;
    });
  }, []);
  // Android back leaves select mode before the screen.
  useFocusEffect(
    useCallback(() => {
      if (!selecting) return undefined;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        exitSelect();
        return true;
      });
      return () => sub.remove();
    }, [exitSelect, selecting]),
  );

  const toggleAll = useCallback(() => toggleMany(saveableIds), [saveableIds, toggleMany]);
  const allSelected = saveableIds.length > 0 && saveableIds.every(fileId => selected.has(fileId));

  // ─── Saving ─────────────────────────────────────────────────────────────────
  const entries = useDownloadEntries();
  const batch = useDownloadBatch();
  const canBatch = canBatchSave();

  // A run this screen watched finished: the user saw it, nothing to report after leaving.
  useEffect(() => () => downloads.queue.clearBatch(), []);

  const denied = useCallback(() => toast.error(t('marketplace.vault.permission')), [t, toast]);

  // Read at tap time, so the callback (and every tile holding it) stays put while a run ticks.
  const saveOne = useCallback(
    (file: ViewerFile) => {
      const entry = downloads.queue.getEntries()[file.id];
      if (entry?.status === 'saved') {
        const opening =
          entry.target === 'shared' ? downloads.share({ file, refreshUrl }) : downloads.openSaved(file);
        opening.catch(() => undefined);
        return;
      }
      if (entry?.status === 'ready') {
        downloads.queue.presentReady([file.id]).catch(() => undefined);
        return;
      }
      if (entry && entry.status !== 'failed') return;
      downloads
        .save({ file, refreshUrl })
        .then(allowed => {
          if (!allowed) denied();
        })
        .catch(() => undefined);
    },
    [denied, refreshUrl],
  );

  const runBatch = useCallback(
    (files: readonly ViewerFile[]) => {
      if (files.length === 0) return;
      downloads
        .saveAll(files.map(file => ({ file, refreshUrl })))
        .then(allowed => {
          if (!allowed) denied();
        })
        .catch(() => undefined);
    },
    [denied, refreshUrl],
  );

  const downloadAll = useCallback(() => runBatch(viewerFiles), [runBatch, viewerFiles]);
  const selectedFiles = useMemo(() => saveableFiles.filter(file => selected.has(file.id)), [saveableFiles, selected]);
  const downloadSelected = useCallback(() => {
    runBatch(selectedFiles);
    exitSelect();
  }, [exitSelect, runBatch, selectedFiles]);

  const batchView = useMemo<VaultBatchView | null>(
    () =>
      batch
        ? {
            finished: batch.finished,
            settled: batch.settled,
            total: batch.ids.length,
            doneBytes: batch.doneBytes,
            totalBytes: batch.totalBytes,
            saved: batch.saved,
            failed: batch.failed,
            ready: batch.ids.filter(fileId => entries[fileId]?.status === 'ready'),
          }
        : null,
    [batch, entries],
  );

  const finished = batch?.finished ?? false;
  const wasFinished = useRef(finished);
  useEffect(() => {
    if (finished && !wasFinished.current) Vibration.vibrate(HAPTIC_SUCCESS_MS);
    wasFinished.current = finished;
  }, [finished]);

  // The newest file the run saved flies into the dock ring.
  const [flyer, setFlyer] = useState<VaultDeckPreview | null>(null);
  const savedBefore = useRef<ReadonlySet<string>>(new Set());
  useEffect(() => {
    if (!batch) {
      savedBefore.current = new Set();
      return;
    }
    const saved = batch.ids.filter(fileId => entries[fileId]?.status === 'saved');
    const fresh = saved.find(fileId => !savedBefore.current.has(fileId));
    savedBefore.current = new Set(saved);
    const file = fresh ? saveableFiles.find(entry => entry.id === fresh) : undefined;
    if (file) setFlyer({ id: file.id, uri: file.kind === 'image' ? file.url : null, kind: file.kind });
  }, [batch, entries, saveableFiles]);

  const cancelBatch = useCallback(() => downloads.queue.cancelBatch(), []);
  const dismissBatch = useCallback(() => downloads.queue.clearBatch(), []);
  const retryBatch = useCallback(() => {
    downloads.queue.retryFailed();
  }, []);
  const saveReady = useCallback(() => {
    if (batchView) downloads.queue.presentReady(batchView.ready).catch(() => undefined);
  }, [batchView]);

  // ─── Refresh ────────────────────────────────────────────────────────────────
  const [refreshing, setRefreshing] = useState(false);
  const refetch = query.refetch;
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch()
      .catch(() => undefined)
      .finally(() => setRefreshing(false));
  }, [refetch]);

  const counterpart =
    source === 'deal' && dealQuery.data
      ? role === 'brand'
        ? dealQuery.data.deal.creator.name
        : dealQuery.data.deal.brand.name
      : null;
  const title = source === 'deal' ? t('marketplace.vault.dealTitle') : t('marketplace.vault.campaignTitle');
  const subtitle =
    source === 'deal'
      ? counterpart
        ? t('marketplace.vault.dealSubtitle', { name: counterpart })
        : undefined
      : campaignQuery.data?.title;

  return {
    source,
    title,
    subtitle,
    kicker: source === 'deal' ? t('marketplace.vault.dealKicker') : t('marketplace.vault.campaignKicker'),
    hint: Platform.OS === 'ios' ? t('marketplace.vault.dock.hintIos') : t('marketplace.vault.dock.hintAndroid'),
    isLoading: query.isLoading,
    isError: !vault && query.isError,
    refreshing,
    onRefresh,
    onRetry: onRefresh,
    vault,
    totals,
    previews,
    chips,
    filter: shownFilter,
    setFilter,
    rows,
    sticky,
    sectionName,
    groupName,
    viewer,
    refreshUrl,
    selecting,
    selected,
    allSelected,
    enterSelect,
    exitSelect,
    toggle,
    toggleMany,
    toggleAll,
    selectedCount: selectedFiles.length,
    selectedBytes: selectedFiles.reduce((sum, file) => sum + (file.size ?? 0), 0),
    canBatch: canBatch && viewerFiles.length > 0,
    viewerBytes: viewerFiles.reduce((sum, file) => sum + (file.size ?? 0), 0),
    saveOne,
    downloadAll,
    downloadSelected,
    batch: batchView,
    flyer,
    cancelBatch,
    dismissBatch,
    retryBatch,
    saveReady,
  };
};
