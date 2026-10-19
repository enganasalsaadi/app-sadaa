import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { normalizeApiError } from '@/core/api';
import { navigate } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { useDeleteCampaignMutation } from '../../../api/brandCampaignsApi';
import { useCampaignAction } from '../../../hooks/useCampaignAction';
import type { CampaignActionBody, CampaignActionPath, CampaignDetail } from '../../../types/campaign';
import { isCampaignConflictError } from '../../../utils/campaignAction';
import {
  deadlineInWindow,
  extendDeadlineWindow,
  freshDeadlineWindow,
  seatsAddable,
  campaignMenuRows,
  type CampaignIslandAction,
  type CampaignMenuAction,
} from '../../../utils/campaignLifecycle';

/** Runs `next` once the way to the next screen or sheet is clear: after the menu is gone, or at once. */
type Then = (next: () => void) => void;

type LifecycleSheet = 'menu' | 'seats' | 'deadline' | 'end' | 'delete' | 'reduce' | 'reopen' | 'extend';

/** The two ways back to «open»: a suspended campaign, or a filled one whose seat was freed. */
type ReopenPath = Extract<CampaignActionPath, 'reopen' | 'seats/reopen'>;

/** Reopening asks for a new date only when the server says the old one can't stand (§3.3, §3.4). */
const reopenNeedsDate = (campaign: CampaignDetail, path: ReopenPath): boolean =>
  path === 'reopen' ? (campaign.timers.suspension?.reopenNeedsDeadline ?? false) : (campaign.seatFreed?.deadlinePassed ?? false);

/** The seat / deadline answer refused because the campaign moved: re-read it, the user decides again. */
const STALE_CODES = new Set(['campaign_has_occupied_seats', 'campaign_no_occupied_seats']);

/**
 * The campaign's «⋯» and the sheets behind it (contract §3.3): add seats (with a new deadline once
 * the old one passed), push the deadline, edit (the wizard's live form), copy, end it (close
 * recruiting once a seat is taken, cancel while none is) and delete a draft. The island's decisions
 * (§3.4) share the sheets: reopen (a new date only when the server asks), +4 days, drop freed
 * seats. One sheet at a time: a menu row closes the menu and its sheet opens once the menu is
 * gone. Every answer is the server's campaign, which replaces the page; a conflict says why and
 * re-reads it.
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
  const [dateFor, setDateFor] = useState<'seats' | 'deadline' | 'reopen'>('deadline');
  const [reopenPath, setReopenPath] = useState<ReopenPath>('reopen');
  const afterMenu = useRef<(() => void) | null>(null);

  const rows = useMemo(() => (campaign ? campaignMenuRows(campaign, openedAt) : []), [campaign, openedAt]);
  const endAction: 'close' | 'cancel' = rows.some(entry => entry.action === 'close') ? 'close' : 'cancel';
  const maxSeats = campaign ? seatsAddable(campaign) : 0;
  const needsDeadline = campaign?.timers.deadlinePassed ?? false;
  const reopenNeedsDeadline = campaign ? reopenNeedsDate(campaign, reopenPath) : false;
  const deadlineWindow = useMemo(() => {
    if (!campaign) return null;
    if (dateFor === 'seats') return needsDeadline ? freshDeadlineWindow(campaign, openedAt) : null;
    if (dateFor === 'reopen') return reopenNeedsDeadline ? freshDeadlineWindow(campaign, openedAt) : null;
    return extendDeadlineWindow(campaign, openedAt);
  }, [campaign, dateFor, needsDeadline, openedAt, reopenNeedsDeadline]);
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

  const duplicate = useCallback(
    async (then: Then) => {
      const outcome = await action.run('duplicate');
      if (!outcome.ok) return;
      const copyId = outcome.result.campaign.id;
      then(() => navigate('CampaignWizard', { campaignId: copyId, source: 'duplicate' }));
    },
    [action],
  );

  const perform = useCallback(
    (picked: CampaignMenuAction, then: Then) => {
      switch (picked) {
        case 'resume':
          then(() => navigate('CampaignWizard', { campaignId: id, source: 'resume' }));
          return;
        case 'edit':
          then(() => navigate('CampaignWizard', { campaignId: id, source: 'edit' }));
          return;
        case 'addSeats':
          setSeats(1);
          setPickedDay(null);
          setDateFor('seats');
          then(() => setSheet('seats'));
          return;
        case 'extendDeadline':
          setPickedDay(null);
          setDateFor('deadline');
          then(() => setSheet('deadline'));
          return;
        case 'duplicate':
          duplicate(then).catch(() => undefined);
          return;
        case 'close':
        case 'cancel':
          then(() => setSheet('end'));
          return;
        case 'delete':
          then(() => setSheet('delete'));
          return;
        default: {
          const _exhaustive: never = picked;
          return _exhaustive;
        }
      }
    },
    [duplicate, id],
  );

  /** A row of the «⋯»: its sheet opens once the menu has slid away. */
  const choose = useCallback((picked: CampaignMenuAction) => perform(picked, thenFromMenu), [perform, thenFromMenu]);

  /** A quick action on the page: no menu is open, so the sheet opens at once (dates read from now). */
  const chooseQuick = useCallback(
    (picked: CampaignMenuAction) => {
      setOpenedAt(Date.now());
      perform(picked, next => next());
    },
    [perform],
  );

  /** Runs one sheet's action; `true` closes the sheet. Refused-because-stale answers close it too. */
  const runFromSheet = useCallback(
    async (path: CampaignActionPath, body: CampaignActionBody | undefined, done: string) => {
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

  /** A decision the island's buttons carry: opens its sheet, or runs straight away when nothing is left to ask. */
  const reopen = useCallback(
    async (path: ReopenPath) => {
      if (!campaign || action.isRunning) return;
      const done = t('marketplace.campaign.detail.reopen.done');
      setOpenedAt(Date.now());
      if (!reopenNeedsDate(campaign, path)) {
        await runFromSheet(path, undefined, done);
        return;
      }
      setReopenPath(path);
      setPickedDay(null);
      setDateFor('reopen');
      setSheet('reopen');
    },
    [action.isRunning, campaign, runFromSheet, t],
  );

  const confirmReopen = useCallback(async () => {
    if (action.isRunning) return false;
    if (reopenNeedsDeadline && pickedAt === null) {
      toastService.info(t('marketplace.campaign.detail.deadlineSheet.pickFirst'));
      return false;
    }
    const body: CampaignActionBody | undefined =
      reopenNeedsDeadline && pickedAt !== null ? { apply_deadline_at: new Date(pickedAt).toISOString() } : undefined;
    return runFromSheet(reopenPath, body, t('marketplace.campaign.detail.reopen.done'));
  }, [action.isRunning, pickedAt, reopenNeedsDeadline, reopenPath, runFromSheet, t]);

  const confirmReduce = useCallback(async () => {
    if (!campaign || action.isRunning) return false;
    const rest = campaign.seatsTotal - seats;
    // Dropping the last seat ends the campaign (§3.3), so the words follow what will happen.
    const done =
      rest > 0
        ? t('marketplace.campaign.detail.reduce.done', { total: rest })
        : t('marketplace.campaign.detail.end.cancelled');
    return runFromSheet('seats/reduce', { seats }, done);
  }, [action.isRunning, campaign, runFromSheet, seats, t]);

  const confirmExtend = useCallback(
    () => runFromSheet('zero-applicants/extend', undefined, t('marketplace.campaign.detail.zeroExtend.done')),
    [runFromSheet, t],
  );

  const submitReopen = useCallback(() => {
    confirmReopen().catch(() => undefined);
  }, [confirmReopen]);
  const submitReduce = useCallback(() => {
    confirmReduce().catch(() => undefined);
  }, [confirmReduce]);
  const submitExtend = useCallback(() => {
    confirmExtend().catch(() => undefined);
  }, [confirmExtend]);

  const decide = useCallback(
    (picked: CampaignIslandAction) => {
      switch (picked) {
        case 'reopen':
          reopen('reopen').catch(() => undefined);
          return;
        case 'reopenSeat':
          reopen('seats/reopen').catch(() => undefined);
          return;
        case 'reduce':
          setSeats(1);
          setSheet('reduce');
          return;
        case 'extend':
          setSheet('extend');
          return;
        case 'edit':
          navigate('CampaignWizard', { campaignId: id, source: 'edit' });
          return;
        case 'cancel':
          setOpenedAt(Date.now());
          setSheet('end');
          return;
        default: {
          const _exhaustive: never = picked;
          return _exhaustive;
        }
      }
    },
    [id, reopen],
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
    reduceVisible: sheet === 'reduce',
    reopenVisible: sheet === 'reopen',
    extendVisible: sheet === 'extend',
    openMenu,
    close,
    onMenuDismissed,
    choose,
    chooseQuick,
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
    reopenPath,
    reopenNeedsDeadline,
    decide,
    submitReopen,
    submitReduce,
    submitExtend,
  };
};

export type CampaignLifecycleModel = ReturnType<typeof useCampaignLifecycle>;
