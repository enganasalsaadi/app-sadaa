import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { DealsStackParamList } from '@/core/navigation';
import { useToast } from '@/core/toast';
import type { SegmentedOption } from '@/shared/ui';
import { useGetDealContractQuery } from '../../../api/dealsApi';
import type { DealRole } from '../../../types';
import {
  parseContractDocument,
  type ContractLang,
} from '../../../utils/dealContract';

/**
 * The deal's signed contract and addenda (`GET …/contract`): read in Arabic or English (Arabic
 * governs), with each party's signature time and the document fingerprint to copy.
 */
export const useDealContractScreen = (role: DealRole) => {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const { params } = useRoute<RouteProp<DealsStackParamList, 'DealContract'>>();
  const { data, isFetching, isError, error, refetch } = useGetDealContractQuery(
    { role, id: params.id },
  );
  const [lang, setLang] = useState<ContractLang>(
    i18n.language === 'en' ? 'en' : 'ar',
  );

  const view = useMemo(
    () => (data ? parseContractDocument(data.document, lang) : null),
    [data, lang],
  );
  const languages: SegmentedOption<ContractLang>[] = useMemo(
    () => [
      { value: 'ar', label: t('marketplace.deals.contract.arabic') },
      { value: 'en', label: t('marketplace.deals.contract.english') },
    ],
    [t],
  );

  const copyFingerprint = useCallback(
    (hash: string) => {
      Clipboard.setString(hash);
      toast.success(t('marketplace.deals.contract.copied'));
    },
    [t, toast],
  );
  const onRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    contract: data ?? null,
    view,
    lang,
    setLang,
    languages,
    copyFingerprint,
    isLoading: !data && isFetching,
    error: !data && isError ? error : null,
    onRetry,
  };
};
