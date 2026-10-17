import { useCallback, useMemo, useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLookupItems } from '@/core/api';
import { formatNumber } from '@/core/i18n';
import type { OpportunitiesStackScreenProps } from '@/core/navigation';
import { useGetCreatorCampaignQuery } from '../../../api/creatorCampaignsApi';
import { OPPORTUNITY_GENDER_LABEL } from '../../../constants/opportunities';
import { useCampaignBookmark } from '../../../hooks/useCampaignBookmark';
import { useClock } from '../../../hooks/useClock';
import { useRestrictions } from '../../../hooks/useRestrictions';
import type { CreatorCampaignDetail } from '../../../types/campaign';
import { applyAction, opportunityDeadline, type ApplyAction } from '../../../utils/opportunities';
import { useCampaignApply } from './useCampaignApply';

type Route = OpportunitiesStackScreenProps<'CampaignDetail'>['route'];
type Navigation = OpportunitiesStackScreenProps<'CampaignDetail'>['navigation'];

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
const MINUTE = 60_000;

/** The product's way in, in the creator's words: only campaigns that ship something say anything. */
const shippingCopy = (campaign: CreatorCampaignDetail, t: TFunction) => {
  if (campaign.shippingMode.key === 'gift') {
    return {
      title: t('marketplace.campaign.opportunity.shipping.gift.title'),
      body: t('marketplace.campaign.opportunity.shipping.gift.body'),
    };
  }
  if (campaign.shippingMode.key === 'returnable') {
    return {
      title: t('marketplace.campaign.opportunity.shipping.returnable.title'),
      body: t('marketplace.campaign.opportunity.shipping.returnable.body'),
    };
  }
  return null;
};

/**
 * The creator's campaign page (PC4.2): the teaser read afresh on every open (the server marks an
 * invitation seen by that read), the one action the dock offers (`applyAction`), the save flag, and
 * the apply sheet (PC5.1) that «قدّم» opens; a missing gender sends the creator to the profile instead.
 */
export const useCreatorCampaignDetailScreen = () => {
  const { t } = useTranslation();
  const { id } = useRoute<Route>().params;
  const navigation = useNavigation<Navigation>();
  const detail = useGetCreatorCampaignQuery(id, { refetchOnMountOrArgChange: true });
  const toggleBookmark = useCampaignBookmark();
  const now = useClock(MINUTE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { items: cityItems } = useLookupItems('governorates');
  const { items: nicheItems } = useLookupItems('niches');

  const campaign = detail.data ?? null;
  const action = useMemo<ApplyAction | null>(() => (campaign ? applyAction(campaign) : null), [campaign]);
  const deadline = campaign ? opportunityDeadline(campaign.applyDeadlineAt, now) : null;

  const chips = useMemo<string[]>(() => {
    if (!campaign) return [];
    const { genders, minFollowers, cities, niches } = campaign.requirements;
    const labelOf = (items: { value: string; label: string }[], value: string) =>
      items.find(item => item.value === value)?.label ?? value;
    return [
      // Both genders listed = nobody is left out, so it isn't a condition.
      ...(genders.length === 1 && genders[0] ? [t(OPPORTUNITY_GENDER_LABEL[genders[0]])] : []),
      ...(minFollowers
        ? [t('marketplace.campaign.wizard.review.requirements.followers', { count: formatNumber(minFollowers, COMPACT) })]
        : []),
      ...cities.map(value => labelOf(cityItems, value)),
      ...niches.map(value => labelOf(nicheItems, value)),
    ];
  }, [campaign, cityItems, nicheItems, t]);
  const shipping = useMemo(() => (campaign ? shippingCopy(campaign, t) : null), [campaign, t]);

  const refetch = detail.refetch;
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);
  const onRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const toggleSaved = useCallback(() => {
    if (campaign) toggleBookmark(campaign);
  }, [campaign, toggleBookmark]);

  const openProfile = useCallback(() => navigation.navigate('SettingsTab', { screen: 'PersonalInfoScreen' }), [navigation]);
  const openPlatforms = useCallback(() => navigation.navigate('SettingsTab', { screen: 'PlatformsScreen' }), [navigation]);
  const apply = useCampaignApply(campaign, { openProfile, openPlatforms });
  const openApply = apply.open;

  // A restriction only matters where the dock would have applied: a closed campaign stays closed.
  const gate = useRestrictions('public');
  const kind = action?.kind ?? null;
  const restriction = kind === 'apply' || kind === 'bid' ? gate.notice : null;
  const onPrimary = useCallback(() => {
    if (kind === 'gender') openProfile();
    else if (kind === 'apply' || kind === 'bid') openApply();
  }, [kind, openApply, openProfile]);

  return {
    campaign,
    action,
    deadline,
    chips,
    shipping,
    // Loading is the first read only; a refetch keeps the page on screen.
    isLoading: !campaign && detail.isFetching,
    error: detail.error,
    isRefreshing,
    onRefresh,
    onRetry,
    toggleSaved,
    onPrimary,
    restriction,
    openRestriction: gate.openNotice,
    apply,
    // Saving needs a campaign that still recruits; un-saving is always possible.
    canSave: !!campaign && (campaign.acceptingApplications || campaign.bookmarked),
  };
};
