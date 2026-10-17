import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeApiError } from '@/core/api';
import { navigate } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { useDeleteCampaignMutation } from '../../../api/brandCampaignsApi';
import { useCampaignAction } from '../../../hooks/useCampaignAction';
import type { CampaignActionBody, CampaignDetail } from '../../../types/campaign';
import { isCampaignConflictError } from '../../../utils/campaignAction';
import {
  deadlineInWindow,
  extendDeadlineWindow,
  freshDeadlineWindow,
  seatsAddable,
  campaignMenuRows,
  type CampaignMenuAction,
} from '../../../utils/campaignLifecycle';

type LifecycleSheet = 'menu' | 'seats' | 'deadline' | 'end' | 'delete';

/** The seat / deadline answer refused because the campaign moved: re-read it, the user decides again. */
const STALE_CODES = new Set(['campaign_has_occupied_seats', 'campaign_no_occupied_seats']);

/**
 * The campaign's «⋯» and the sheets behind it (contract §3.3): add seats (with a new deadline once
 * the old one passed), push the deadline, edit (the wizard's live form), copy, end it (close
 * recruiting once a seat is taken, cancel while none is) and delete a draft. One sheet at a time:
 * a row closes the menu and its sheet opens once the menu is gone. Every answer is the server's
 * campaign, which replaces the page; a conflict says why and re-reads it.
 */
export const useCampaignLifecycle = (campaign: CampaignDetail | null, leave: () => void) => {
  const { t } = useTranslation();
  const id = campaign?.id ?? '';
  const action = useCampaignAction(id);
  const [deleteCampaign, { isLoading: isDeleting }] = useDeleteCampaignMutation();
  const [sheet, setSheet] = useState<LifecycleSheet | null>(null);
  // Read when the menu opens, so the rows and date windows don't move while it is up.
  const [openedAt, setOpenedAt] = useState(() => Date.now());
  const [seats, setSeats] = useState(1);
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  // Which sheet the calendar belongs to; kept while that sheet slides away, so its dates don't switch.
  const [dateFor, setDateFor] = useState<'seats' | 'deadline'>('deadline');
  const afterMenu = useRef<(() => void) | null>(null);

  const rows = useMemo(() => (campaign ? campaignMenuRows(campaign, openedAt) : []), [campaign, openedAt]);
  const endAction: 'close' | 'cancel' = rows.some(entry => entry.action === 'close') ? 'close' : 'cancel';
  const maxSeats = campaign ? seatsAddable(campaign) : 0;
  const needsDeadline = campaign?.timers.deadlinePassed ?? false;
  const deadlineWindow = useMemo(() => {
    if (!campaign) return null;
    if (dateFor === 'seats') return needsDeadline ? freshDeadlineWindow(campaign, openedAt) : null;
    return extendDeadlineWindow(campaign, openedAt);
  }, [campaign, dateFor, needsDeadline, openedAt]);
  const pickedAt = pickedDay !== null && deadlineWindow ? deadlineInWindow(pickedDay, deadlineWindow) : null;

  const openMenu = useCallback(() => {
    setOpenedAt(Date.now());
    setSheet('menu');
  }, []);
  const close = useCallback(() => setSheet(null), []);
  const onMenuDismissed = useCallback(() => {
    const next = afterMenu.current;
    afterMenu.current = null;
    next?.();
  }, []);
  /** Close the menu, then do `next` once it is gone (a second sheet, or another screen). */
  const thenFromMenu = useCallback((next: () => void) => {
    afterMenu.current = next;
    setSheet(null);
  }, []);

  const duplicate = useCallback(async () => {
    const outcome = await action.run('duplicate');
    if (!outcome.ok) return;
    const copyId = outcome.result.campaign.id;
    thenFromMenu(() => navigate('CampaignWizard', { campaignId: copyId, source: 'duplicate' }));
  }, [action, thenFromMenu]);

  const choose = useCallback(
    (picked: CampaignMenuAction) => {
      switch (picked) {
        case 'resume':
          thenFromMenu(() => navigate('CampaignWizard', { campaignId: id, source: 'resume' }));
          return;
        case 'edit':
          thenFromMenu(() => navigate('CampaignWizard', { campaignId: id, source: 'edit' }));
          return;
        case 'addSeats':
          setSeats(1);
          setPickedDay(null);
          setDateFor('seats');
          thenFromMenu(() => setSheet('seats'));
          return;
        case 'extendDeadline':
          setPickedDay(null);
          setDateFor('deadline');
          thenFromMenu(() => setSheet('deadline'));
          return;
        case 'duplicate':
          duplicate().catch(() => undefined);
          return;
        case 'close':
        case 'cancel':
          thenFromMenu(() => setSheet('end'));
          return;
        case 'delete':
          thenFromMenu(() => setSheet('delete'));
          return;
        default: {
          const _exhaustive: never = picked;
          return _exhaustive;
        }
      }
    },
    [duplicate, id, thenFromMenu],
  );

  /** Runs one sheet's action; `true` closes the sheet. Refused-because-stale answers close it too. */
  const runFromSheet = useCallback(
    async (path: 'seats' | 'deadline' | 'close' | 'cancel', body: CampaignActionBody | undefined, done: string) => {
      const outcome = await action.run(path, body ? { body } : {});
      if (outcome.ok) {
        setSheet(null);
        toastService.success(done);
        return true;
      }
      if (outcome.conflict || (outcome.error.code !== null && STALE_CODES.has(outcome.error.code))) {
        setSheet(null);
      }
      return false;
    },
    [action],
  );

  const confirmSeats = useCallback(async () => {
    if (action.isRunning) return false;
    if (needsDeadline && pickedAt === null) {
      toastService.info(t('marketplace.campaign.detail.deadlineSheet.pickFirst'));
      return false;
    }
    const body: CampaignActionBody = { seats };
    if (needsDeadline && pickedAt !== null) body.apply_deadline_at = new Date(pickedAt).toISOString();
    return runFromSheet('seats', body, t('marketplace.campaign.detail.addSeats.done', { count: seats }));
  }, [action.isRunning, needsDeadline, pickedAt, runFromSheet, seats, t]);

  const confirmDeadline = useCallback(async () => {
    if (action.isRunning) return false;
    if (pickedAt === null) {
      toastService.info(t('marketplace.campaign.detail.deadlineSheet.pickFirst'));
      return false;
    }
    return runFromSheet(
      'deadline',
      { apply_deadline_at: new Date(pickedAt).toISOString() },
      t('marketplace.campaign.detail.deadlineSheet.done'),
    );
  }, [action.isRunning, pickedAt, runFromSheet, t]);

  const submitSeats = useCallback(() => {
    confirmSeats().catch(() => undefined);
  }, [confirmSeats]);
  const submitDeadline = useCallback(() => {
    confirmDeadline().catch(() => undefined);
  }, [confirmDeadline]);

  const confirmEnd = useCallback(
    () =>
      runFromSheet(
        endAction,
        undefined,
        t(endAction === 'close' ? 'marketplace.campaign.detail.end.closed' : 'marketplace.campaign.detail.end.cancelled'),
      ),
    [endAction, runFromSheet, t],
  );

  const confirmDelete = useCallback(async () => {
    if (!campaign || isDeleting) return;
    try {
      await deleteCampaign(campaign.id).unwrap();
      setSheet(null);
      toastService.success(t('marketplace.campaign.list.draftSheet.deleted'));
      leave();
    } catch (err) {
      const error = normalizeApiError(err);
      if (isCampaignConflictError(error)) {
        setSheet(null);
        toastService.error(error.message);
      }
    }
  }, [campaign, deleteCampaign, isDeleting, leave, t]);

  return {
    rows,
    menuVisible: sheet === 'menu',
    seatsVisible: sheet === 'seats',
    deadlineVisible: sheet === 'deadline',
    endVisible: sheet === 'end',
    deleteVisible: sheet === 'delete',
    openMenu,
    close,
    onMenuDismissed,
    choose,
    isRunning: action.isRunning,
    isDuplicating: action.isRunning && sheet === 'menu',
    isDeleting,
    endAction,
    seats,
    setSeats,
    maxSeats,
    needsDeadline,
    deadlineWindow,
    pickedDay,
    pickDay: setPickedDay,
    pickedAt,
    submitSeats,
    submitDeadline,
    confirmEnd,
    confirmDelete,
  };
};

export type CampaignLifecycleModel = ReturnType<typeof useCampaignLifecycle>;
