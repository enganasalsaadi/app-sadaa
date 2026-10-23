import { useCallback, useMemo, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { formatDate, formatNumber } from '@/core/i18n';
import type { DealsStackParamList, DealsStackScreenProps } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { mimeFromName } from '@/core/download';
import { useFileViewer, type ViewerFile } from '@/shared/ui';
import { isolateText } from '@/shared/utils';
import { useGetDealDisputesQuery } from '../../../api/dealDisputeApi';
import { useGetDealQuery } from '../../../api/dealsApi';
import { useDealAction } from '../../../hooks/useDealAction';
import { useDealFileRefresh } from '../../../hooks/useDealFileRefresh';
import type { DealDisputeEntry, DealRole } from '../../../types';
import { reportDealFailure } from '../../../utils/dealAction';
import { toViewerFile, type PhotoName } from '../../../utils/dealVault';
import {
  disputePhase,
  evidenceRoom,
  evidenceTally,
  evidenceThread,
  isOwnParty,
  pickDispute,
  rulingForViewer,
  rulingLean,
  shipmentPhotoRefs,
} from '../../../utils/dealDispute';
import { safeLiveUrl } from '../../../utils/dealPublish';
import { getDealActions } from '../../../utils/dealStatus';
import { useDisputeEvidence } from './useDisputeEvidence';

const TARGET_FORMAT: Intl.DateTimeFormatOptions = { weekday: 'long', hour: 'numeric', minute: '2-digit' };

/** Which pan the ruling weighs down, from the viewer's side. */
export type DisputeLean = 'mine' | 'theirs' | 'even';

/**
 * Every file in the thread, in reading order, so one viewer pages through them all: own uploads,
 * pointed-at deal files (once, by their id) and courier photos (the vault's ids). Tile keys map to them.
 */
const viewerOf = (entries: readonly DealDisputeEntry[], photoName: PhotoName) => {
  const files: ViewerFile[] = [];
  const idOf = new Map<string, string>();
  const add = (key: string, file: ViewerFile | null) => {
    if (!file || file.url === null) return;
    idOf.set(key, file.id);
    if (!files.some(entry => entry.id === file.id)) files.push(file);
  };
  entries.forEach(entry => {
    entry.files.forEach(file => add(file.id, toViewerFile(file)));
    entry.refs.forEach((ref, index) => {
      const key = `${entry.id}:ref:${index}`;
      if (ref.type === 'file') {
        add(key, ref.file ? toViewerFile(ref.file) : null);
        return;
      }
      add(
        key,
        ref.url
          ? {
              id: `shipment:${ref.shipmentId}:${ref.index}`,
              url: ref.url,
              name: photoName(ref.index + 1),
              mime: mimeFromName(ref.url),
              kind: 'image',
              size: null,
              caption: null,
            }
          : null,
      );
    });
  });
  return { files, idOf };
};

/**
 * The dispute file (handoff M9, approved «الميزان»): both sides' evidence weighed on a pair of
 * scales over the held amount. While the window is open the viewer adds evidence (sheet) and the
 * opener may withdraw (the deal resumes where it stopped); then the team's target time; after the
 * ruling the scales tip once and the split shows where the money went. Same screen for both roles.
 */
export const useDealDisputeScreen = (role: DealRole) => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<DealsStackScreenProps<'DealDispute'>['navigation']>();
  const { params } = useRoute<RouteProp<DealsStackParamList, 'DealDispute'>>();
  const { id } = params;
  const ref = useMemo(() => ({ role, id }), [id, role]);

  const detail = useGetDealQuery(ref);
  const disputes = useGetDealDisputesQuery(ref, { refetchOnMountOrArgChange: true });
  const deal = detail.data?.deal ?? null;
  const dispute = useMemo(
    () => pickDispute(disputes.data ?? [], deal?.dispute?.id ?? null),
    [deal?.dispute?.id, disputes.data],
  );
  const phase = dispute ? disputePhase(dispute) : null;
  const thread = useMemo(() => (dispute ? evidenceThread(dispute) : []), [dispute]);
  const tally = useMemo(() => evidenceTally(dispute?.entries ?? [], role), [dispute?.entries, role]);
  const room = useMemo(() => evidenceRoom(tally.mine), [tally.mine]);
  const photos = useMemo(() => shipmentPhotoRefs(deal?.shipping?.shipments ?? []), [deal?.shipping?.shipments]);
  const evidence = useDisputeEvidence(ref, room, photos);

  const actions = useMemo(() => (deal ? getDealActions(deal, role) : []), [deal, role]);
  const canAdd = actions.includes('addEvidence') && room.entries > 0;
  const canWithdraw = dispute?.status.key === 'open' && isOwnParty(dispute.openedBy, role);
  const mineOpened = dispute ? isOwnParty(dispute.openedBy, role) : false;

  // Isolated: a Latin name opening an Arabic sentence would flip the whole line.
  const other = isolateText((role === 'brand' ? deal?.creator.name : deal?.brand.name) ?? '');

  // — The scales ——————————————————————————————————————————————————————
  const ruling = dispute?.ruling ?? null;
  const lean: DisputeLean | null = useMemo(() => {
    if (!ruling) return null;
    const side = rulingLean(ruling);
    if (side === 'even') return 'even';
    return (side === 'brand') === (role === 'brand') ? 'mine' : 'theirs';
  }, [role, ruling]);
  const scales = useMemo(() => {
    if (!deal || !dispute) return null;
    const evidenceCount = (count: number) =>
      t('marketplace.deals.dispute.file.pieces', { count, value: formatNumber(count) });
    return {
      badge:
        phase === 'ruled'
          ? ruling
            ? t('marketplace.deals.dispute.file.badgeRuled', { outcome: ruling.outcome.label })
            : dispute.status.label
          : phase === 'withdrawn'
            ? t('marketplace.deals.dispute.file.badgeWithdrawn')
            : t('marketplace.deals.dispute.file.badgeOpen'),
      live: phase === 'evidence' || phase === 'review',
      amount: ruling ? rulingForViewer(ruling, role) : deal.total,
      amountLabel: ruling
        ? t(role === 'brand' ? 'marketplace.deals.dispute.file.brandShare' : 'marketplace.deals.dispute.file.creatorShare')
        : t('marketplace.deals.dispute.file.held'),
      mine: { name: t('marketplace.deals.dispute.file.you'), caption: evidenceCount(tally.mine.entries) },
      theirs: { name: other, caption: evidenceCount(tally.theirs.entries) },
    };
  }, [deal, dispute, other, phase, role, ruling, t, tally.mine.entries, tally.theirs.entries]);

  const target = dispute?.adminTargetAt ? formatDate(dispute.adminTargetAt, TARGET_FORMAT, i18n.language) : null;

  // — Thread media and links ———————————————————————————————————————————
  const media = useMemo(
    () => viewerOf(thread, n => t('marketplace.vault.photoName', { n })),
    [t, thread],
  );
  const viewer = useFileViewer(media.files);
  const refreshUrl = useDealFileRefresh(role, id);
  const openViewer = viewer.open;
  const openMedia = useCallback(
    (key: string) => {
      const fileId = media.idOf.get(key);
      if (fileId) openViewer(fileId);
    },
    [media.idOf, openViewer],
  );

  const onLink = useCallback(
    async (link: string) => {
      // Rule 07: only an allow-listed platform host leaves the app; any other link is copied.
      const allowed = safeLiveUrl(link);
      if (allowed) {
        try {
          await Linking.openURL(allowed);
          return;
        } catch {
          // Fall through to copying.
        }
      }
      Clipboard.setString(link);
      toastService.info(t('marketplace.deals.dispute.file.linkCopied'));
    },
    [t],
  );

  // — Withdraw ——————————————————————————————————————————————————————
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const leaving = useRef(false);
  const action = useDealAction(ref);
  const run = action.run;
  const askWithdraw = useCallback(() => setWithdrawVisible(true), []);
  const closeWithdraw = useCallback(() => setWithdrawVisible(false), []);
  const confirmWithdraw = useCallback(async () => {
    const outcome = await run('dispute/withdraw');
    if (outcome.ok) {
      toastService.success(t('marketplace.deals.dispute.withdraw.toast'));
      leaving.current = true;
      setWithdrawVisible(false);
      return;
    }
    // A conflict already toasted and refetched.
    if (outcome.conflict) {
      setWithdrawVisible(false);
      return;
    }
    reportDealFailure(outcome.error);
  }, [run, t]);
  /** Back to the deal, which runs again, once the sheet is gone. */
  const onWithdrawDismissed = useCallback(() => {
    if (!leaving.current) return;
    leaving.current = false;
    navigation.goBack();
  }, [navigation]);

  // — Chrome ————————————————————————————————————————————————————————
  const openContract = useCallback(() => navigation.navigate('DealContract', { id }), [id, navigation]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refetchDeal = detail.refetch;
  const refetchDisputes = disputes.refetch;
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchDeal(), refetchDisputes()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchDeal, refetchDisputes]);
  const onRetry = useCallback(() => {
    refetchDeal();
    refetchDisputes();
  }, [refetchDeal, refetchDisputes]);

  return {
    role,
    deal,
    dispute,
    phase,
    scales,
    lean,
    target,
    thread,
    mineOpened,
    other,
    canAdd,
    evidenceFull: actions.includes('addEvidence') && room.entries === 0,
    canWithdraw,
    disputesLeft: deal?.disputeWindow.disputesLeft ?? 0,
    evidence,
    viewer: viewer.props,
    refreshUrl,
    openMedia,
    onLink,
    withdrawVisible,
    askWithdraw,
    closeWithdraw,
    confirmWithdraw,
    onWithdrawDismissed,
    withdrawing: action.isRunning,
    openContract,
    isRefreshing,
    onRefresh,
    onRetry,
    isLoading: (!deal && detail.isFetching) || (!disputes.data && disputes.isFetching),
    error: (!deal && detail.isError ? detail.error : null) ?? (!disputes.data && disputes.isError ? disputes.error : null),
  };
};
