import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TextInputInstance } from 'react-native';
import { useNavigation, usePreventRemove, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useLookupItems, type LookupItem } from '@/core/api';
import { navigate, type DealFlowStackScreenProps } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { CAMPAIGN_DRAFT_LIMITS } from '../../../constants/campaignDraft';
import { useCampaignDraft } from '../../../hooks/useCampaignDraft';
import { CAMPAIGN_ACTIVITY_TYPE } from '../../../types/campaign';
import type { CampaignActivityType, CampaignFile } from '../../../types/campaign';
import { CAMPAIGN_WIZARD_STEP } from '../../../types/campaignDraft';
import type { CampaignWizardStep } from '../../../types/campaignDraft';
import { draftEntryStep } from '../../../utils/campaignDraft';
import {
  isValidCampaignTitle,
  nextWizardStep,
  previousWizardStep,
  refusalMessage,
} from '../../../utils/campaignWizard';
import { useCampaignBrief } from './useCampaignBrief';
import { useCampaignCover } from './useCampaignCover';
import { useCampaignMoney } from './useCampaignMoney';
import { useCampaignRequirements } from './useCampaignRequirements';
import { useCampaignSchedule } from './useCampaignSchedule';
import { useCampaignSubmit, type CampaignWizardExit } from './useCampaignSubmit';

const NO_FILES: readonly CampaignFile[] = [];
/** A published campaign has nothing left to review or send. */
const LIVE_STEPS: readonly CampaignWizardStep[] = ['idea', 'requirements', 'money'];
/** Once the terms lock, the name, cover and announcement are all that change. */
const LOCKED_STEPS: readonly CampaignWizardStep[] = ['idea'];

/** Leaving the wizard: back where it was opened from, or on to a tab. */
type WizardExit = { to: 'back' } | { to: 'tab'; params: CampaignWizardExit };
const EXIT_BACK: WizardExit = { to: 'back' };

type Navigation = DealFlowStackScreenProps<'CampaignWizard'>['navigation'];
type Route = DealFlowStackScreenProps<'CampaignWizard'>['route'];

const isActivityType = (value: string): value is CampaignActivityType =>
  (CAMPAIGN_ACTIVITY_TYPE as readonly string[]).includes(value);

/** A lookup row the app can send: ids this build doesn't know are left out. */
export interface ActivityOption extends LookupItem {
  value: CampaignActivityType;
}

/**
 * The brand's campaign wizard (PC1): which step is open, the draft engine behind it, and the
 * parts of the first step (title, activity type, cover, public text). The draft saves itself; a
 * step moves on only once what is pending is saved, so «Next» never leaves edits behind. The last
 * step sends the draft for review; a campaign in review shows «in review» instead of the steps.
 * Opened with `source: 'edit'` on a published campaign it is the edit form instead: no review
 * step, one «save» that sends the changes live, and only the first step once the terms locked.
 */
export const useCampaignWizardScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<Route>();
  const live = params?.source === 'edit';
  const draft = useCampaignDraft(params?.campaignId ?? null, { live });
  const {
    values,
    edit,
    flush,
    campaign,
    campaignId,
    ready,
    refused,
    failure,
    retry,
    progress,
    reload,
    locked,
    hasChanges,
    saveLive,
  } = draft;
  const cover = useCampaignCover(campaignId, campaign?.cover ?? null);
  const requirements = useCampaignRequirements(values, edit, refused);
  const brief = useCampaignBrief(values, edit, refused, campaignId, campaign?.attachments ?? NO_FILES);

  const [step, setStep] = useState<CampaignWizardStep>('idea');
  const money = useCampaignMoney(values, edit, refused, campaignId, step);
  const schedule = useCampaignSchedule(values, edit, refused, campaign);
  const [advancing, setAdvancing] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);
  const titleRef = useRef<TextInputInstance>(null);

  // A resumed draft opens where it still needs something; a new one or a duplicate starts at the top.
  const entered = useRef(false);
  useEffect(() => {
    if (!ready || entered.current) return;
    entered.current = true;
    if (params?.source === 'resume' && campaign) setStep(draftEntryStep(campaign, 'resume'));
  }, [campaign, params?.source, ready]);

  const steps = live ? (locked ? LOCKED_STEPS : LIVE_STEPS) : CAMPAIGN_WIZARD_STEP;
  const stepIndex = Math.max(0, steps.indexOf(step));
  // The terms locked under the brand (the server said so on save): back to what still changes.
  useEffect(() => {
    if (!steps.includes(step)) setStep('idea');
  }, [step, steps]);

  const statusKey = campaign?.status.key ?? null;
  const inReview = statusKey === 'pending_review';
  const changesRequested = statusKey === 'changes_requested';

  // — Leaving ————————————————————————————————————————————————————————
  const [exit, setExit] = useState<WizardExit | null>(null);
  const [leaveSheet, setLeaveSheet] = useState(false);
  useEffect(() => {
    if (!exit) return;
    if (exit.to === 'back') navigation.goBack();
    else navigate('Main', exit.params);
  }, [exit, navigation]);
  const leaveTo = useCallback((target: CampaignWizardExit) => setExit({ to: 'tab', params: target }), []);

  // Back (hardware) walks the steps; the close button leaves for real. In review there are no steps.
  // Editing a live campaign, back asks before dropping unsaved changes instead.
  const goBack = useCallback(() => {
    const previous = previousWizardStep(step);
    if (previous) setStep(previous);
  }, [step]);
  const askLeave = useCallback(() => setLeaveSheet(true), []);
  usePreventRemove(
    exit === null && (live ? hasChanges : !inReview && step !== 'idea'),
    live ? askLeave : goBack,
  );

  const onClose = useCallback(() => {
    if (live) {
      if (hasChanges) setLeaveSheet(true);
      else setExit(EXIT_BACK);
      return;
    }
    if (campaignId === null || inReview) {
      setExit(EXIT_BACK);
      return;
    }
    flush().then(saved => {
      if (saved) {
        toastService.info(t('marketplace.campaign.wizard.closedWithDraft'));
        setExit(EXIT_BACK);
      } else {
        setLeaveSheet(true);
      }
    }, () => setLeaveSheet(true));
  }, [campaignId, flush, hasChanges, inReview, live, t]);
  const closeLeaveSheet = useCallback(() => setLeaveSheet(false), []);
  const confirmLeave = useCallback(() => {
    setLeaveSheet(false);
    setExit(EXIT_BACK);
  }, []);

  // — Steps ——————————————————————————————————————————————————————————
  const titleValid = isValidCampaignTitle(values.title);
  const focusTitle = useCallback(() => {
    setTitleTouched(true);
    titleRef.current?.focus();
  }, []);

  const uploadsBusy = cover.busy || brief.attachments.busy;
  const submission = useCampaignSubmit({
    campaignId,
    progress,
    flush,
    reload,
    uploadsBusy,
    openStep: setStep,
    leaveTo,
  });
  const { submit } = submission;

  // A live campaign's one action: every change goes out together, then back to the campaign.
  const saveChanges = useCallback(async () => {
    if (!titleValid) {
      focusTitle();
      return;
    }
    if (cover.busy) {
      toastService.info(t('marketplace.campaign.wizard.idea.cover.waiting'));
      return;
    }
    if (brief.attachments.busy) {
      toastService.info(t('marketplace.offer.brief.files.waiting'));
      return;
    }
    setAdvancing(true);
    const outcome = await saveLive();
    setAdvancing(false);
    switch (outcome) {
      case 'saved':
        toastService.success(t('marketplace.campaign.wizard.live.saved'));
        setExit(EXIT_BACK);
        return;
      case 'unchanged':
        setExit(EXIT_BACK);
        return;
      case 'locked':
        // The server's message says why (422 toast); the form now shows what is left.
        setStep('idea');
        return;
      case 'failed':
        return;
      default: {
        const _exhaustive: never = outcome;
        return _exhaustive;
      }
    }
  }, [brief.attachments.busy, cover.busy, focusTitle, saveLive, t, titleValid]);

  const goNext = useCallback(async () => {
    if (advancing) return;
    if (live) {
      await saveChanges();
      return;
    }
    if (step === 'review') {
      await submit();
      return;
    }
    if (step === 'idea' && !titleValid) {
      focusTitle();
      return;
    }
    if (cover.busy) {
      toastService.info(t('marketplace.campaign.wizard.idea.cover.waiting'));
      return;
    }
    if (brief.attachments.busy) {
      toastService.info(t('marketplace.offer.brief.files.waiting'));
      return;
    }
    setAdvancing(true);
    const saved = await flush();
    setAdvancing(false);
    const next = nextWizardStep(step);
    if (saved && next) setStep(next);
  }, [advancing, brief.attachments.busy, cover.busy, flush, focusTitle, live, saveChanges, step, submit, t, titleValid]);

  const goToStep = useCallback(
    async (target: CampaignWizardStep) => {
      if (target === step || advancing) return;
      // Nothing saves while a live campaign is edited: moving between steps is just moving.
      if (live) {
        setStep(target);
        return;
      }
      setAdvancing(true);
      const saved = await flush();
      setAdvancing(false);
      if (saved) setStep(target);
    },
    [advancing, flush, live, step],
  );

  // — The first step's parts ———————————————————————————————————————————
  const setTitle = useCallback((title: string) => edit({ title }), [edit]);
  const setTeaser = useCallback((teaser: string) => edit({ teaser }), [edit]);
  const onTitleBlur = useCallback(() => setTitleTouched(true), []);
  const chooseActivity = useCallback(
    (value: string) => {
      if (!isActivityType(value)) return;
      // Tapping the chosen type again clears it: the server accepts `null`.
      edit({ activityType: values.activityType === value ? null : value });
    },
    [edit, values.activityType],
  );

  const lookups = useLookupItems('campaign_activity_types');
  const activityOptions = useMemo<ActivityOption[]>(
    () =>
      lookups.items.flatMap(item => (isActivityType(item.value) ? [{ ...item, value: item.value }] : [])),
    [lookups.items],
  );

  // A cover needs the draft to exist, and a draft starts from its title.
  const pickCover = useCallback(async () => {
    if (campaignId === null) {
      if (!titleValid) {
        toastService.info(t('marketplace.campaign.wizard.idea.cover.needTitle'));
        focusTitle();
        return;
      }
      if (!(await flush())) return;
    }
    await cover.pick();
  }, [campaignId, cover, flush, focusTitle, t, titleValid]);

  const titleError = titleTouched && !titleValid
    ? t('marketplace.campaign.wizard.idea.titleRule', {
        min: CAMPAIGN_DRAFT_LIMITS.titleMin,
        max: CAMPAIGN_DRAFT_LIMITS.titleMax,
      })
    : refusalMessage(refused.title, ['title']);
  const activityError = refusalMessage(refused.activity_type, ['activity_type']);
  const teaserError = refusalMessage(refused.teaser, ['teaser', 'teaser.requirements']);

  return {
    ...draft,
    live,
    steps,
    step,
    stepIndex,
    isFirst: stepIndex === 0,
    advancing: advancing || submission.submitting,
    inReview,
    changesRequested,
    goNext,
    goBack,
    goToStep,
    onClose,
    leaveSheet,
    closeLeaveSheet,
    confirmLeave,
    failure,
    retry,
    titleRef,
    titleError,
    onTitleBlur,
    setTitle,
    setTeaser,
    activityOptions,
    activityLoading: lookups.isLoading,
    activityFailed: lookups.isError,
    reloadActivities: lookups.refetch,
    activityError,
    chooseActivity,
    teaserError,
    teaserMax: CAMPAIGN_DRAFT_LIMITS.teaserMax,
    titleMax: CAMPAIGN_DRAFT_LIMITS.titleMax,
    cover,
    pickCover,
    requirements,
    brief,
    money,
    schedule,
    submission,
  };
};

export type CampaignWizardModel = ReturnType<typeof useCampaignWizardScreen>;
