import React, { memo } from 'react';
import { Box } from '@/shared/ui';
import { DealCard } from '@/domains/marketplace';
import { useDealCardDemo } from './hooks/useDealCardDemo';

const DealCardDemoComponent: React.FC = () => {
  const { deals, onPress } = useDealCardDemo();

  return (
    <Box gap="md">
      <DealCard deal={deals.creating} role="brand" showProgress onPress={onPress} />
      <DealCard deal={deals.offer} role="creator" onPress={onPress} />
      <DealCard deal={deals.completed} role="brand" onPress={onPress} />
    </Box>
  );
};

export const DealCardDemo = memo(DealCardDemoComponent);
