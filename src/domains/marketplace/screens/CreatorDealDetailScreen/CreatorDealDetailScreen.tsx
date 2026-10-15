import React, { memo } from 'react';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import {
  DealDetailView,
  type DealDetailSectionKey,
} from '../../components/DealDetailView';
import { useCreatorDealDetailScreen } from './hooks/useCreatorDealDetailScreen';

/** Creator reading order: the next step, the deliverables while the work is on, the offer file (read before accepting), then the station card with its history. */
const SECTIONS: readonly DealDetailSectionKey[] = ['next', 'rating', 'deliverables', 'dossier', 'stage'];

/** Deal detail from the creator's side (Detail archetype on the navy orbit hero). */
const CreatorDealDetailScreenComponent: React.FC = () => {
  useHideBottomBar();
  const vm = useCreatorDealDetailScreen();
  return <DealDetailView vm={vm} sections={SECTIONS} />;
};

export const CreatorDealDetailScreen = memo(CreatorDealDetailScreenComponent);
