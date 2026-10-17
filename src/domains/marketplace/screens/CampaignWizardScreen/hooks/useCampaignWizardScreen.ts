import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TextInputInstance } from 'react-native';
import { useNavigation, usePreventRemove, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useLookupItems, type LookupItem } from '@/core/api';
import type { DealFlowStackScreenProps } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { CAMPAIGN_DRAFT_LIMITS } from '../../../constants/campaignDraft';
import { useCampaignDraft } from '../../../hooks/useCampaignDraft';
import { CAMPAIGN_ACTIVITY_TYPE } from '../../../types/campaign';
import type { CampaignActivityType } from '../../../types/campaign';
import { CAMPAIGN_WIZARD_STEP } from '../../../types/campaignDraft';
import type { CampaignWizardStep } from '../../../types/campaignDraft';
import { draftEntryStep } from '../../../utils/campaignDraft';
import {
  isValidCampaignTitle,
  nextWizardStep,
  previousWizardStep,
  refusalMessage,
} from '../../../utils/campaignWizard';
import { useCampaignCover } from './useCampaignCover';
import { useCampaignMoney } from './useCampaignMoney';
import { useCampaignRequirements } from './useCampaignRequirements';
import { useCampaignSchedule } from './useCampaignSchedule';

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
 * step moves on only once what is pending is saved, so «Next» never leaves edits behind.
 */
export const useCampaignWizardScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<Route>();
  const draft = useCampaignDraft(params?.campaignId ?? null);
  const { values, edit, flush, campaign, campaignId, ready, refused, failure, retry } = draft;
  const cover = useCampaignCover(campaignId, campaign?.cover ?? null);
  const requirements = useCampaignRequirements(values, edit, refused);

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

  const stepIndex = CAMPAIGN_WIZARD_STEP.indexOf(step);

  // — Leaving ————————————————————————————————————————————————————————
  const [leaving, setLeaving] = useState(false);
  const [leaveSheet, setLeaveSheet] = useState(false);
  useEffect(() => {
    if (leaving) navigation.goBack();
  }, [leaving, navigation]);

  // Back (hardware) walks the steps; the close button leaves for real.
  const goBack = useCallback(() => {
    const previous = previousWizardStep(step);
    if (previous) setStep(previous);
  }, [step]);
  usePreventRemove(!leaving && step !== 'idea', goBack);

  const onClose = useCallback(() => {
    if (campaignId === null) {
      setLeaving(true);
      return;
    }
    flush().then(saved => {
      if (saved) {
        toastService.info(t('marketplace.campaign.wizard.closedWithDraft'));
        setLeaving(true);
      } else {
        setLeaveSheet(true);
      }
    }, () => setLeaveSheet(true));
  }, [campaignId, flush, t]);
  const closeLeaveSheet = useCallback(() => setLeaveSheet(false), []);
  const confirmLeave = useCallback(() => {
    setLeaveSheet(false);
    setLeaving(true);
  }, []);

  // — Steps ——————————————————————————————————————————————————————————
  const titleValid = isValidCampaignTitle(values.title);
  const focusTitle = useCallback(() => {
    setTitleTouched(true);
    titleRef.current?.focus();
  }, []);

  const goNext = useCallback(async () => {
    if (advancing) return;
    if (step === 'idea' && !titleValid) {
      focusTitle();
      return;
    }
    if (cover.busy) {
      toastService.info(t('marketplace.campaign.wizard.idea.cover.waiting'));
      return;
    }
    setAdvancing(true);
    const saved = await flush();
    setAdvancing(false);
    const next = nextWizardStep(step);
    if (saved && next) setStep(next);
  }, [advancing, cover.busy, flush, focusTitle, step, t, titleValid]);

  const goToStep = useCallback(
    async (target: CampaignWizardStep) => {
      if (target === step || advancing) return;
      setAdvancing(true);
      const saved = await flush();
      setAdvancing(false);
      if (saved) setStep(target);
    },
    [advancing, flush, step],
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
    step,
    stepIndex,
    isFirst: stepIndex === 0,
    advancing,
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
    money,
    schedule,
  };
};

export type CampaignWizardModel = ReturnType<typeof useCampaignWizardScreen>;
