import { useCallback } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { DealsStackParamList, DealsStackScreenProps } from '@/core/navigation';
import { useDealDetail } from '../../../hooks/useDealDetail';

/** Creator side of one deal (`DealDetail { id }`); a deliverable opens its hand-in. */
export const useCreatorDealDetailScreen = () => {
  const { params } = useRoute<RouteProp<DealsStackParamList, 'DealDetail'>>();
  const navigation = useNavigation<DealsStackScreenProps<'DealDetail'>['navigation']>();
  const openItem = useCallback(
    (itemId: string) => navigation.navigate('DealDraftUpload', { id: params.id, itemId }),
    [navigation, params.id],
  );
  return useDealDetail('creator', params.id, openItem);
};
