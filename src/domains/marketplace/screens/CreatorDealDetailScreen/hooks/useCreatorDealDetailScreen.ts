import { useRoute, type RouteProp } from '@react-navigation/native';
import type { DealsStackParamList } from '@/core/navigation';
import { useDealDetail } from '../../../hooks/useDealDetail';

/** Creator side of one deal (`DealDetail { id }`). */
export const useCreatorDealDetailScreen = () => {
  const { params } = useRoute<RouteProp<DealsStackParamList, 'DealDetail'>>();
  return useDealDetail('creator', params.id);
};
