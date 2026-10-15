import { useCallback } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { DealsStackParamList, DealsStackScreenProps } from '@/core/navigation';
import { useDealDetail } from '../../../hooks/useDealDetail';
import type { DealItemStage } from '../../../utils/dealPublish';

/** Creator side of one deal (`DealDetail { id }`); a deliverable opens its draft round, then its live post. */
export const useCreatorDealDetailScreen = () => {
  const { params } = useRoute<RouteProp<DealsStackParamList, 'DealDetail'>>();
  const navigation = useNavigation<DealsStackScreenProps<'DealDetail'>['navigation']>();
  const openItem = useCallback(
    (itemId: string, stage: DealItemStage) =>
      navigation.navigate(stage === 'publish' ? 'DealPublish' : 'DealDraftUpload', { id: params.id, itemId }),
    [navigation, params.id],
  );
  return useDealDetail('creator', params.id, openItem);
};
