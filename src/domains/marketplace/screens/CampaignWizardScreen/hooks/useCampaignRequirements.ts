import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetRateCardCatalogQuery, useLookupItems } from '@/core/api';
import { toastService } from '@/core/toast';
import {
  CAMPAIGN_DELIVERABLE_LIMITS,
  CAMPAIGN_FOLLOWER_PRESETS,
  CAMPAIGN_TARGETING_LIMITS,
} from '../../../constants/campaignRequirements';
import { CAMPAIGN_SCHEDULE } from '../../../constants/campaignMoney';
import type { DealShippingMode } from '../../../types/deal';
import type { CampaignDraftValues } from '../../../types/campaignDraft';
import {
  addDeliverable,
  canAddDeliverable,
  catalogChoices,
  deliverableKey,
  deliverableUnits,
  hasDeliverable,
  maxDeliverableCount,
  removeDeliverable,
  setDeliverableCount,
  setDeliverableRevisions,
  setDeliverableAddons,
} from '../../../utils/campaignDeliverables';
import { pickGenders, toggleFollowerFloor } from '../../../utils/campaignTargeting';
import type { CampaignDraftSyncState } from '../../../utils/campaignDraftSync';
import { refusalMessage } from '../../../utils/campaignWizard';

/**
 * Step 2, «the requirements»: what each creator delivers (catalog lines, no prices) and who may
 * apply. Gender, the follower floor and the platforms are gates; cities and niches only rank.
 */
export const useCampaignRequirements = (
  values: CampaignDraftValues,
  edit: (patch: Partial<CampaignDraftValues>) => void,
  refused: CampaignDraftSyncState['refused'],
) => {
  const { t } = useTranslation();
  const catalogQuery = useGetRateCardCatalogQuery();
  const governorates = useLookupItems('governorates');
  const niches = useLookupItems('niches');
  const [sheetOpen, setSheetOpen] = useState(false);

  const { deliverables } = values;
  const choices = useMemo(() => catalogChoices(catalogQuery.data), [catalogQuery.data]);
  const units = deliverableUnits(deliverables);

  const openSheet = useCallback(() => setSheetOpen(true), []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const toastFull = useCallback(
    () => toastService.info(t('marketplace.campaign.wizard.requirements.deliverables.full', { max: CAMPAIGN_DELIVERABLE_LIMITS.units })),
    [t],
  );

  /** In the catalog sheet: a service is added, or taken off when it is already a line. */
  const toggleService = useCallback(
    (platform: string, service: string) => {
      if (hasDeliverable(deliverables, platform, service)) {
        edit({ deliverables: removeDeliverable(deliverables, deliverableKey({ platform, service })) });
        return;
      }
      if (!canAddDeliverable(deliverables)) {
        toastFull();
        return;
      }
      edit({ deliverables: addDeliverable(deliverables, platform, service) });
    },
    [deliverables, edit, toastFull],
  );
  const removeLine = useCallback(
    (key: string) => edit({ deliverables: removeDeliverable(deliverables, key) }),
    [deliverables, edit],
  );
  const setCount = useCallback(
    (key: string, count: number) => edit({ deliverables: setDeliverableCount(deliverables, key, count) }),
    [deliverables, edit],
  );
  const setRevisions = useCallback(
    (key: string, revisions: number) => edit({ deliverables: setDeliverableRevisions(deliverables, key, revisions) }),
    [deliverables, edit],
  );
  const setAddons = useCallback(
    (key: string, addons: string[]) => edit({ deliverables: setDeliverableAddons(deliverables, key, addons) }),
    [deliverables, edit],
  );
  const maxCount = useCallback(
    (key: string) => {
      const line = deliverables.find(entry => deliverableKey(entry) === key);
      return line ? maxDeliverableCount(deliverables, line) : CAMPAIGN_DELIVERABLE_LIMITS.countMin;
    },
    [deliverables],
  );

  const setGenders = useCallback((genders: string[]) => edit({ genders: pickGenders(genders) }), [edit]);
  const chooseFollowerFloor = useCallback(
    (floor: string) => edit({ minFollowers: toggleFollowerFloor(values.minFollowers, Number(floor)) }),
    [edit, values.minFollowers],
  );
  const chooseShipping = useCallback((shippingMode: DealShippingMode) => edit({ shippingMode }), [edit]);
  const setCities = useCallback((cities: string[]) => edit({ cities }), [edit]);
  const setNiches = useCallback((picked: string[]) => edit({ niches: picked }), [edit]);

  return {
    // deliverables
    choices,
    catalogLoading: catalogQuery.isLoading,
    catalogFailed: catalogQuery.isError && choices.length === 0,
    reloadCatalog: catalogQuery.refetch,
    units,
    unitsMax: CAMPAIGN_DELIVERABLE_LIMITS.units,
    countMin: CAMPAIGN_DELIVERABLE_LIMITS.countMin,
    revisionsMax: CAMPAIGN_DELIVERABLE_LIMITS.revisionsMax,
    sheetOpen,
    openSheet,
    closeSheet,
    toggleService,
    removeLine,
    setCount,
    setRevisions,
    setAddons,
    maxCount,
    deliverablesError: refusalMessage(refused.deliverables, ['deliverables']),
    // targeting
    followerPresets: CAMPAIGN_FOLLOWER_PRESETS,
    nicheMax: CAMPAIGN_TARGETING_LIMITS.niches,
    setGenders,
    chooseFollowerFloor,
    setCities,
    setNiches,
    governorates: governorates.items,
    governoratesLoading: governorates.isLoading,
    niches: niches.items,
    nichesLoading: niches.isLoading,
    targetingError: refusalMessage(refused.targeting, ['targeting', 'targeting.niches', 'targeting.min_followers']),
    // shipping
    shippingMode: values.shippingMode,
    chooseShipping,
    gapDigitalDays: CAMPAIGN_SCHEDULE.dropGapDigitalHours / 24,
    gapShippedDays: CAMPAIGN_SCHEDULE.dropGapShippedHours / 24,
    shippingError: refusalMessage(refused.shipping_mode, ['shipping_mode']),
  };
};

export type CampaignRequirementsModel = ReturnType<typeof useCampaignRequirements>;
