import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone } from 'lucide-react-native';
import { DealsBoard } from '../../components/DealsBoard';
import { useBrandDealsScreen } from './hooks/useBrandDealsScreen';

/** Brand `DealsTab` root (List archetype): the deal board from the brand's side. */
const BrandDealsScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const vm = useBrandDealsScreen();
  return (
    <DealsBoard
      vm={vm}
      emptyIcon={Megaphone}
      errorMessage={t('marketplace.deals.loadFailed')}
    />
  );
};

export const BrandDealsScreen = memo(BrandDealsScreenComponent);
