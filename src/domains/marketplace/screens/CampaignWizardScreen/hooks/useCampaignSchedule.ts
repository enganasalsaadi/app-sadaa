import { useCallback, useMemo, useState } from 'react';
import { CAMPAIGN_SCHEDULE } from '../../../constants/campaignMoney';
import type { CampaignDetail } from '../../../types/campaign';
import type { CampaignDraftValues } from '../../../types/campaignDraft';
import type { CampaignDraftSyncState } from '../../../utils/campaignDraftSync';
import {
  damascusDayKey,
  damascusDaysUntil,
  damascusMinuteOfDay,
  damascusMoment,
  deadlineDayRange,
  deadlineFromDay,
  deliveryDayChoices,
  dropGapHours,
  dropTimelineOf,
  dropTimeOptions,
  earliestDropAt,
  isDropTooEarly,
  preferredDropMinute,
  scheduleModePatch,
  type CampaignScheduleMode,
} from '../../../utils/campaignSchedule';
import { refusalFieldMessage, refusalLeftover } from '../../../utils/campaignWizard';

const SCHEDULE_FIELDS = ['apply_deadline_at', 'drop_at', 'delivery_days'] as const;

type DateSheet = 'deadline' | 'drop';

/**
 * Step 3's dates: the application deadline (≤ 30 days), then either a delivery window or one drop
 * moment for everyone (the drop sits at least 5 days after the deadline, 10 with a product). The
 * dates that follow from a drop come from the server once it is saved. The date sheet's picks stay
 * here until confirmed, so closing it changes nothing.
 */
export const useCampaignSchedule = (
  values: CampaignDraftValues,
  edit: (patch: Partial<CampaignDraftValues>) => void,
  refused: CampaignDraftSyncState['refused'],
  campaign: CampaignDetail | undefined,
) => {
  // The brand's pick wins; until then a saved drop says which way the draft goes.
  const [chosenMode, setChosenMode] = useState<CampaignScheduleMode | null>(null);
  const mode: CampaignScheduleMode = chosenMode ?? (values.dropAt !== null ? 'drop' : 'delivery');

  // The kind outlives the open flag, so the sheet keeps its content while it slides away.
  const [sheet, setSheet] = useState<DateSheet>('deadline');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pickedDay, setPickedDay] = useState<string | null>(null);
  const [pickedMinute, setPickedMinute] = useState<number | null>(null);
  // The clock is read when the step renders; a stale «now» only loosens a hint the server re-checks.
  const [now, setNow] = useState(Date.now);

  const chooseMode = useCallback(
    (next: CampaignScheduleMode) => {
      setChosenMode(next);
      if (next !== mode) edit(scheduleModePatch(next));
    },
    [edit, mode],
  );
  const chooseDeliveryDays = useCallback((days: string) => edit({ deliveryDays: Number(days) }), [edit]);

  const earliestDrop = earliestDropAt(values.applyDeadlineAt, values.shippingMode, now);
  const deadlineRange = useMemo(() => deadlineDayRange(now), [now]);

  const openDeadline = useCallback(() => {
    const opened = Date.now();
    setNow(opened);
    setPickedDay(values.applyDeadlineAt === null ? null : damascusDayKey(values.applyDeadlineAt));
    setSheet('deadline');
    setSheetOpen(true);
  }, [values.applyDeadlineAt]);

  const openDrop = useCallback(() => {
    const opened = Date.now();
    setNow(opened);
    const earliest = earliestDropAt(values.applyDeadlineAt, values.shippingMode, opened);
    const current = values.dropAt !== null && values.dropAt >= earliest ? values.dropAt : null;
    setPickedDay(damascusDayKey(current ?? earliest));
    setPickedMinute(current === null ? null : damascusMinuteOfDay(current));
    setSheet('drop');
    setSheetOpen(true);
  }, [values.applyDeadlineAt, values.dropAt, values.shippingMode]);

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  // Only usable times are offered: on the earliest day the early hours drop out.
  const dropTimes = useMemo(
    () =>
      pickedDay === null
        ? []
        : dropTimeOptions(pickedDay, earliestDrop, values.dropAt).filter(option => option.enabled),
    [earliestDrop, pickedDay, values.dropAt],
  );
  const dropMinute = preferredDropMinute(dropTimes, pickedMinute);

  const confirmSheet = useCallback(() => {
    if (pickedDay === null) return;
    if (sheet === 'deadline') {
      const deadline = deadlineFromDay(pickedDay, Date.now());
      if (deadline !== null) edit({ applyDeadlineAt: deadline });
    } else if (dropMinute !== null) {
      const dropAt = damascusMoment(pickedDay, dropMinute);
      if (dropAt !== null) edit({ dropAt, deliveryDays: null });
    }
    setSheetOpen(false);
  }, [dropMinute, edit, pickedDay, sheet]);

  const deliveryChoices = useMemo(() => deliveryDayChoices(values.deliveryDays), [values.deliveryDays]);
  const timeline = useMemo(() => dropTimelineOf(campaign, values.dropAt), [campaign, values.dropAt]);
  const schedule = refused.schedule;

  return {
    mode,
    chooseMode,
    deadline: values.applyDeadlineAt,
    /** Damascus days until applications close (0 = today); `null` with no deadline. */
    deadlineDaysLeft: values.applyDeadlineAt === null ? null : damascusDaysUntil(values.applyDeadlineAt, now),
    deliveryDays: values.deliveryDays,
    deliveryChoices,
    chooseDeliveryDays,
    dropAt: values.dropAt,
    /** Days between the deadline and the drop, for the hint (5, or 10 with a product). */
    dropGapDays: dropGapHours(values.shippingMode) / 24,
    earliestDrop,
    dropTooEarly: isDropTooEarly(values, now),
    timeline,
    // The date sheet
    sheet,
    sheetOpen,
    openDeadline,
    openDrop,
    closeSheet,
    confirmSheet,
    pickedDay,
    pickDay: setPickedDay,
    deadlineRange,
    dropMinDay: damascusDayKey(earliestDrop),
    dropTimes,
    dropMinute,
    pickMinute: setPickedMinute,
    deadlineMaxDays: CAMPAIGN_SCHEDULE.deadlineMaxDays,
    // Server refusals
    deadlineError: refusalFieldMessage(schedule, ['apply_deadline_at']),
    whenError:
      refusalFieldMessage(schedule, ['drop_at', 'delivery_days']) ?? refusalLeftover(schedule, SCHEDULE_FIELDS),
  };
};

export type CampaignScheduleModel = ReturnType<typeof useCampaignSchedule>;
