import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { push, type DealsStackScreenProps, type PublicStackParamList } from '@/core/navigation';
import { toastService } from '@/core/toast';
import { useGetCampaignApplicantQuery } from '../../../api/brandCampaignsApi';
import { useApplicantDecision } from '../../../hooks/useApplicantDecision';
import { useApplicantSelectFlow } from '../../../hooks/useApplicantSelectFlow';
import { isPendingApplicant } from '../../../utils/applicants';

type Route = DealsStackScreenProps<'CampaignApplicant'>['route'];
type Navigation = DealsStackScreenProps<'CampaignApplicant'>['navigation'];

/**
 * One applicant (PC3.2): the card, the way into their media kit and the decisions on them.
 * Rejecting asks first and leaves the page; shortlisting stays on it; selecting opens the
 * hold-to-sign sheet (PC3.4) and its answer moves on to the result page.
 * Which buttons show comes from the card's `actions` (the server re-checks every tap).
 */
export const useBrandCampaignApplicantScreen = () => {
  const { t } = useTranslation();
  const { id, applicationId } = useRoute<Route>().params;
  const navigation = useNavigation<Navigation>();
  const query = useGetCampaignApplicantQuery({ id, applicationId });
  const applicant = query.data ?? null;
  const decision = useApplicantDecision(id, applicationId);
  const select = useApplicantSelectFlow(id);
  const [rejectVisible, setRejectVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refetch = query.refetch;
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

  const run = decision.run;
  const shortlist = useCallback(async () => {
    if (await run('shortlist')) toastService.success(t('marketplace.campaign.applicants.detail.actions.shortlisted'));
  }, [run, t]);

  const openSelect = useCallback(() => {
    if (applicant) select.open(applicant);
  }, [applicant, select]);
  const openReject = useCallback(() => setRejectVisible(true), []);
  const closeReject = useCallback(() => setRejectVisible(false), []);
  const confirmReject = useCallback(async () => {
    const done = await run('reject');
    setRejectVisible(false);
    if (done) navigation.goBack();
  }, [run, navigation]);

  const slug = applicant?.creator.slug ?? null;
  const openMediaKit = useCallback(() => {
    if (!slug) return;
    const params: PublicStackParamList['MediaKitPublic'] = { slug, source: 'app' };
    push('MediaKitPublic', params);
  }, [slug]);

  const dealId = applicant?.deal?.id ?? null;
  const openDeal = useCallback(() => {
    if (dealId) navigation.navigate('DealDetail', { id: dealId });
  }, [dealId, navigation]);

  return {
    applicant,
    isLoading: !applicant && query.isFetching,
    isError: !applicant && query.isError,
    error: query.error,
    isRefreshing,
    onRefresh,
    onRetry,
    pending: applicant ? isPendingApplicant(applicant) : false,
    canSelect: applicant?.actions.canSelect ?? false,
    canShortlist: applicant?.actions.canShortlist ?? false,
    canReject: applicant?.actions.canReject ?? false,
    isDeciding: decision.isRunning,
    shortlist,
    select: { flow: select, open: openSelect },
    reject: { visible: rejectVisible, open: openReject, close: closeReject, confirm: confirmReject },
    openMediaKit,
    openDeal,
  };
};
