import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DevShowcaseStackParamList } from '@/core/navigation';

export type LayoutVariantScreenName = Exclude<
  keyof DevShowcaseStackParamList,
  'DevShowcase' | 'DevShowcaseCategory'
>;

export const useShowcaseNavigation = () =>
  useNavigation<NativeStackNavigationProp<DevShowcaseStackParamList>>();
