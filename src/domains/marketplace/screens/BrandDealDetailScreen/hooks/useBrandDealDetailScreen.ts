import { useCallback } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { DealsStackParamList, DealsStackScreenProps } from '@/core/navigation';
import { useDealDetail } from '../../../hooks/useDealDetail';

/** Brand side of one deal (`DealDetail { id }`); a deliverable opens its review. */
export const useBrandDealDetailScreen = () => {
  const { params } = useRoute<RouteProp<DealsStackParamList, 'DealDetail'>>();
  const navigation = useNavigation<DealsStackScreenProps<'DealDetail'>['navigation']>();
  const openItem = useCallback(
    (itemId: string) => navigation.navigate('DealDraftReview', { id: params.id, itemId }),
    [navigation, params.id],
  );
  return useDealDetail('brand', params.id, openItem);
};
