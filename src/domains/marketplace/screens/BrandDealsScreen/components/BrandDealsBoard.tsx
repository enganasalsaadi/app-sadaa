import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone } from 'lucide-react-native';
import { DealsBoard } from '../../../components/DealsBoard';
import { useBrandDealsScreen } from '../hooks/useBrandDealsScreen';

export interface BrandDealsBoardProps {
  /** The «campaigns | deals» switch while Public Campaigns are on. */
  titleSlot?: React.ReactNode;
}

/** The deal board from the brand's side. */
const BrandDealsBoardComponent: React.FC<BrandDealsBoardProps> = ({ titleSlot }) => {
  const { t } = useTranslation();
  const vm = useBrandDealsScreen();
  return (
    <DealsBoard
      vm={vm}
      emptyIcon={Megaphone}
      errorMessage={t('marketplace.deals.loadFailed')}
      titleSlot={titleSlot}
    />
  );
};

export const BrandDealsBoard = memo(BrandDealsBoardComponent);
