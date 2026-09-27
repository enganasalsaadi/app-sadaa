import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@/shared/ui';
import { CreatorCard } from '@/domains/marketplace';
import { useCreatorCardDemo } from './hooks/useCreatorCardDemo';
import { MOCK_AVATAR_GROUP, MOCK_CREATOR_PRICE, MOCK_STATS } from './mockData';

const CreatorCardDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const demo = useCreatorCardDemo();
  const niches = useMemo(
    () => [t('devShowcase.chips.food'), t('devShowcase.chips.fashion'), t('devShowcase.sada.nicheBeauty'), t('devShowcase.sada.nicheTech')],
    [t],
  );

  return (
    <Box gap="md">
      <CreatorCard
        name={t('devShowcase.sada.creatorName')}
        avatarUri={MOCK_AVATAR_GROUP[4]?.uri}
        city={t('devShowcase.sada.cityDamascus')}
        niches={niches}
        followers={MOCK_STATS.followers}
        rating={4.8}
        ratingCount={42}
        priceFrom={MOCK_CREATOR_PRICE}
        verified
        selected={demo.linaSelected}
        onPress={demo.toggleLina}
      />
      <CreatorCard
        name={t('devShowcase.sada.creatorNameAlt')}
        city={t('devShowcase.sada.cityAleppo')}
        niches={niches.slice(0, 1)}
        followers={8400}
        selected={demo.omarSelected}
        onPress={demo.toggleOmar}
      />
    </Box>
  );
};

export const CreatorCardDemo = memo(CreatorCardDemoComponent);
