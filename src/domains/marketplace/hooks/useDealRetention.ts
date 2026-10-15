import { useCallback, useMemo, useRef, useState } from 'react';
import { Linking } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTranslation } from 'react-i18next';
import { normalizeApiError } from '@/core/api';
import { toastService } from '@/core/toast';
import { isolateText } from '@/shared/utils';
import { useConfirmDealRetentionMutation } from '../api/dealRetentionApi';
import type { Deal, DealRetentionCase, DealRole } from '../types';
import { reportDealFailure, toastDealConflict } from '../utils/dealAction';
import { safeLiveUrl } from '../utils/dealPublish';
import {
  retentionCaseActions,
  retentionPhase,
  retentionShots,
  sortRetentionCases,
  type DealRetentionCaseAction,
  type DealRetentionPhase,
} from '../utils/dealRetention';
import { useRetentionNote } from './useRetentionNote';
import { useRetentionReport } from './useRetentionReport';
import { useRetentionRestore } from './useRetentionRestore';

/** One report as its card draws it. */
export interface DealRetentionCaseView {
  retentionCase: DealRetentionCase;
  phase: DealRetentionPhase;
  actions: DealRetentionCaseAction[];
  /** The reported post's deliverable. */
  title: string;
  platform: string | null;
  reportShots: string[];
  restoreShots: string[];
}

/**
 * Post retention (P9.2, handoff M9) from the deal page, after `completed`. Every verified post's
 * time online («عمر المنشور») with the brand's report link while the window is open; every report
 * as a case card, the side it waits on acting there: the creator restores (screenshots + optional
 * new link) or contests, the brand confirms the restore or rejects it; contest and reject send it
 * to the team, whose note and any clawback show when it closes. All plain buttons: nothing here
 * is a signature, and money only moves by an admin's decision.
 */
export const useDealRetention = (
  role: DealRole,
  id: string,
  deal: Deal | null,
) => {
  const { t } = useTranslation();
  const brand = role === 'brand';
  // Isolated: a Latin name opening an Arabic sentence would flip the whole line.
  const other = isolateText(
    (brand ? deal?.creator.name : deal?.brand.name) ?? '',
  );

  const items = deal?.items;
  const retentionCases = deal?.retentionCases;
  const cases = useMemo<DealRetentionCaseView[]>(
    () =>
      sortRetentionCases(retentionCases ?? []).map(retentionCase => {
        const item = items?.find(entry => entry.id === retentionCase.itemId);
        const phase = retentionPhase(retentionCase);
        return {
          retentionCase,
          phase,
          actions: retentionCaseActions(phase, role),
          title: item?.title ?? '',
          platform: item?.platform ?? null,
          reportShots: retentionShots(retentionCase.reportFiles),
          restoreShots: retentionShots(retentionCase.restoreFiles),
        };
      }),
    [items, retentionCases, role],
  );
  const hasLives =
    deal?.status.key === 'completed' &&
    deal.retention.some(window => window.endsAt !== null);

  const report = useRetentionReport(id, other);
  const restore = useRetentionRestore(id, other);
  const note = useRetentionNote(role, id);

  // — Brand confirms the restore ————————————————————————————————————————
  const [confirm, confirmState] = useConfirmDealRetentionMutation();
  const confirmBusy = confirmState.isLoading;
  const confirmingId = confirmBusy
    ? confirmState.originalArgs?.caseId ?? null
    : null;
  const onConfirm = useCallback(
    async (caseId: string) => {
      if (confirmBusy) return;
      try {
        await confirm({ dealId: id, caseId }).unwrap();
        toastService.success(t('marketplace.deals.retention.confirm.toast'));
      } catch (err) {
        const error = normalizeApiError(err);
        if (!toastDealConflict(error)) reportDealFailure(error);
      }
    },
    [confirm, confirmBusy, id, t],
  );

  const openRestore = restore.open;
  const openNote = note.open;
  const onAction = useCallback(
    (caseId: string, action: DealRetentionCaseAction) => {
      switch (action) {
        case 'restore': {
          const view = cases.find(entry => entry.retentionCase.id === caseId);
          openRestore({ caseId, platform: view?.platform ?? null });
          return;
        }
        case 'contest':
        case 'reject':
          openNote(caseId);
          return;
        case 'confirm':
          onConfirm(caseId);
          return;
        default: {
          const _exhaustive: never = action;
          return _exhaustive;
        }
      }
    },
    [cases, onConfirm, openNote, openRestore],
  );

  // — The restore sheet hands over to contest once it is gone (iOS can't stack modals) ————
  const afterClose = useRef<(() => void) | null>(null);
  const onDismissed = useCallback(() => {
    const next = afterClose.current;
    afterClose.current = null;
    next?.();
  }, []);
  const restoreCaseId = restore.caseId;
  const closeRestore = restore.close;
  const restoreToContest = useCallback(() => {
    if (!restoreCaseId) return;
    afterClose.current = () => openNote(restoreCaseId);
    closeRestore();
  }, [closeRestore, openNote, restoreCaseId]);

  // — Screenshots and the restored link ————————————————————————————————
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const openShot = useCallback(
    (caseId: string, url: string) => {
      const view = cases.find(entry => entry.retentionCase.id === caseId);
      if (!view) return;
      const images = [...view.reportShots, ...view.restoreShots];
      const at = images.indexOf(url);
      if (at < 0) return;
      setGalleryImages(images);
      setGalleryIndex(at);
    },
    [cases],
  );
  const closeGallery = useCallback(() => setGalleryIndex(null), []);

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
      toastService.info(t('marketplace.deals.retention.case.linkCopied'));
    },
    [t],
  );

  return {
    role,
    other,
    cases,
    hasLives,
    report,
    restore,
    note,
    onAction,
    confirmingId,
    restoreToContest,
    onDismissed,
    galleryImages,
    galleryIndex,
    openShot,
    closeGallery,
    onLink,
  };
};

export type DealRetentionModel = ReturnType<typeof useDealRetention>;
