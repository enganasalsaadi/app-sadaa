import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BriefcaseBusiness } from 'lucide-react-native';
import { DealsBoard } from '../../components/DealsBoard';
import { DealStrikesBanner } from '../../components/DealStrikesBanner';
import { useCreatorDealsScreen } from './hooks/useCreatorDealsScreen';

/** Creator `DealsTab` root (List archetype): the deal board from the creator's side. */
const CreatorDealsScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const vm = useCreatorDealsScreen();
  return (
    <DealsBoard
      vm={vm}
      emptyIcon={BriefcaseBusiness}
      errorMessage={t('marketplace.deals.loadFailed')}
      notice={vm.strikes ? <DealStrikesBanner strikes={vm.strikes} onPress={vm.openStrikes} /> : null}
    />
  );
};

export const CreatorDealsScreen = memo(CreatorDealsScreenComponent);
