import React, { memo } from 'react';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import {
  DealDetailView,
  type DealDetailSectionKey,
} from '../../components/DealDetailView';
import { useBrandDealDetailScreen } from './hooks/useBrandDealDetailScreen';

/** Brand reading order: the next step, the deliverables while the work is on, the full offer file as sent (prices included), then the station card with its history. */
const SECTIONS: readonly DealDetailSectionKey[] = [
  'next',
  'dispute',
  'retentionCases',
  'upsell',
  'rating',
  'deliverables',
  'shipping',
  'retention',
  'dossier',
  'stage',
  'changes',
];

/** Deal detail from the brand's side (Detail archetype on the navy orbit hero). */
const BrandDealDetailScreenComponent: React.FC = () => {
  useHideBottomBar();
  const vm = useBrandDealDetailScreen();
  return <DealDetailView vm={vm} sections={SECTIONS} />;
};

export const BrandDealDetailScreen = memo(BrandDealDetailScreenComponent);
