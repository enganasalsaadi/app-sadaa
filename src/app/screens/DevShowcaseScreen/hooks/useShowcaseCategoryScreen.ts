import { useMemo } from 'react';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { DevShowcaseStackParamList } from '@/core/navigation';
import {
  SHOWCASE_CATEGORIES,
  SHOWCASE_ENTRIES,
} from '../registry/showcaseRegistry';
import type { ShowcaseEntryId } from '../registry/showcaseRegistry';

const ENTRY_IDS = Object.keys(SHOWCASE_ENTRIES) as ShowcaseEntryId[];

export const useShowcaseCategoryScreen = () => {
  const { params } =
    useRoute<RouteProp<DevShowcaseStackParamList, 'DevShowcaseCategory'>>();
  const { category } = params;

  const entryIds = useMemo(
    () => ENTRY_IDS.filter(id => SHOWCASE_ENTRIES[id].category === category),
    [category],
  );

  return { titleKey: SHOWCASE_CATEGORIES[category].titleKey, entryIds };
};
