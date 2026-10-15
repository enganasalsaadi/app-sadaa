import { useRoute, type RouteProp } from '@react-navigation/native';
import type { DealsStackParamList } from '@/core/navigation';
import { useDealDetail } from '../../../hooks/useDealDetail';

/** Brand side of one deal (`DealDetail { id }`). */
export const useBrandDealDetailScreen = () => {
  const { params } = useRoute<RouteProp<DealsStackParamList, 'DealDetail'>>();
  return useDealDetail('brand', params.id);
};
