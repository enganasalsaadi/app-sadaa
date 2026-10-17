import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatNumber } from '@/core/i18n';
import type { Money } from '@/core/money';
import type { DealsStackScreenProps } from '@/core/navigation';
import { useGetCampaignApplicantsCompareQuery } from '../../../api/brandCampaignsApi';
import { APPLICANT_COMPARE_MIN } from '../../../constants/applicants';
import type { ApplicantCard } from '../../../types/campaign';
import { compareLeaders, orderByIds, totalFollowers, type CompareMetric } from '../../../utils/applicants';

type Route = DealsStackScreenProps<'CampaignCompare'>['route'];
type Navigation = DealsStackScreenProps<'CampaignCompare'>['navigation'];

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
const MAX_NICHES = 2;

/** One column's cell in a row: the figure (text or money), what qualifies it, and whether it leads. */
export interface CompareCell {
  key: string;
  text: string | null;
  money: Money | null;
  caption: string | null;
  leader: 'lowest' | 'highest' | null;
}

export interface CompareRow {
  key: 'price' | 'followers' | 'rating' | 'deals' | 'accounts' | 'location';
  label: string;
  cells: CompareCell[];
}

/**
 * The comparison (PC3.3): the picked cards from one call, kept in the order picked, laid out as a
 * row per figure. The lead in a row is marked with a word as well as a tint, and only where the
 * columns differ; nothing is scored or ranked beyond what the server sent.
 */
export const useBrandCampaignCompareScreen = () => {
  const { t } = useTranslation();
  const { id, ids } = useRoute<Route>().params;
  const navigation = useNavigation<Navigation>();
  const query = useGetCampaignApplicantsCompareQuery({ id, ids }, { refetchOnMountOrArgChange: 30 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cards = useMemo(() => orderByIds(query.data ?? [], ids), [query.data, ids]);

  const rows = useMemo<CompareRow[]>(() => {
    const leaders = (metric: CompareMetric, mark: 'lowest' | 'highest') => {
      const winners = compareLeaders(cards, metric);
      return (index: number) => (winners.includes(index) ? mark : null);
    };
    const priceLead = leaders('price', 'lowest');
    const followersLead = leaders('followers', 'highest');
    const ratingLead = leaders('rating', 'highest');
    const dealsLead = leaders('deals', 'highest');
    const cell = (card: ApplicantCard, partial: Partial<CompareCell>): CompareCell => ({
      key: card.id,
      text: null,
      money: null,
      caption: null,
      leader: null,
      ...partial,
    });

    return [
      {
        key: 'price',
        label: t('marketplace.campaign.applicants.compare.result.rows.price'),
        cells: cards.map((card, index) =>
          cell(card, {
            money: card.price.gross,
            caption: t(card.price.isBid ? 'marketplace.campaign.applicants.card.bid' : 'marketplace.campaign.applicants.card.fixed'),
            leader: priceLead(index),
          }),
        ),
      },
      {
        key: 'followers',
        label: t('marketplace.campaign.applicants.compare.result.rows.followers'),
        cells: cards.map((card, index) => {
          const total = totalFollowers(card.accounts);
          return cell(card, { text: total !== null ? formatNumber(total, COMPACT) : '—', leader: followersLead(index) });
        }),
      },
      {
        key: 'rating',
        label: t('marketplace.campaign.applicants.compare.result.rows.rating'),
        cells: cards.map((card, index) => {
          const { average, count } = card.trackRecord.rating;
          return average !== null
            ? cell(card, {
                text: formatNumber(average, { maximumFractionDigits: 1 }),
                caption: t('marketplace.campaign.applicants.detail.stats.reviews', { count }),
                leader: ratingLead(index),
              })
            : cell(card, { text: '—', caption: t('marketplace.campaign.applicants.detail.stats.noRating') });
        }),
      },
      {
        key: 'deals',
        label: t('marketplace.campaign.applicants.compare.result.rows.deals'),
        cells: cards.map((card, index) =>
          cell(card, { text: formatNumber(card.trackRecord.completedDeals), leader: dealsLead(index) }),
        ),
      },
      {
        key: 'accounts',
        label: t('marketplace.campaign.applicants.compare.result.rows.accounts'),
        cells: cards.map(card =>
          cell(card, {
            text: card.accounts.map(account => account.platform.label).join(' · ') || t('marketplace.campaign.applicants.compare.result.noValue'),
          }),
        ),
      },
      {
        key: 'location',
        label: t('marketplace.campaign.applicants.compare.result.rows.location'),
        cells: cards.map(card =>
          cell(card, {
            text:
              [card.creator.governorate?.label, ...card.creator.niches.slice(0, MAX_NICHES).map(niche => niche.label)]
                .filter(Boolean)
                .join('\n') || '—',
          }),
        ),
      },
    ];
  }, [cards, t]);

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

  const openApplicant = useCallback(
    (applicationId: string) => navigation.navigate('CampaignApplicant', { id, applicationId }),
    [navigation, id],
  );
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return {
    cards,
    rows,
    isLoading: query.isLoading,
    isError: query.isError && !query.data,
    error: query.error,
    // Some picks were decided or expired since: two columns are the least a comparison needs.
    tooFew: !query.isLoading && !!query.data && cards.length < APPLICANT_COMPARE_MIN,
    isRefreshing,
    onRefresh,
    onRetry,
    openApplicant,
    goBack,
  };
};
