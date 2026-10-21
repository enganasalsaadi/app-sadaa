import { useCallback, useMemo } from 'react';
import { useLookupItems } from '@/core/api';
import { useGetPayoutMethodsQuery } from '../api/payoutMethodApi';
import { buildPayoutMethodView } from '../utils/payoutMethodView';
import { usePaymentChannels } from './usePaymentChannels';

interface UsePayoutMethodsOptions {
  /** Brands have no payout methods: no request at all. */
  skip?: boolean;
}

/** The creator's saved methods, ready to render (governorate names from `/lookups`). */
export const usePayoutMethods = ({ skip = false }: UsePayoutMethodsOptions = {}) => {
  const query = useGetPayoutMethodsQuery(undefined, { skip });
  const governorates = useLookupItems('governorates');
  const { find } = usePaymentChannels();
  const { items } = governorates;

  const governorateLabel = useCallback(
    (value: string) => items.find(item => String(item.value) === value)?.label,
    [items],
  );

  const { data } = query;
  const views = useMemo(
    () => data?.map(method => buildPayoutMethodView(method, governorateLabel, find)) ?? [],
    [data, find, governorateLabel],
  );

  return {
    methods: data,
    views,
    isLoading: query.isLoading,
    isError: query.isError && !data,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};
