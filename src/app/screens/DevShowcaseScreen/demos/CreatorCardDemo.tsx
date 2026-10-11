import React, { memo } from 'react';
import { Box } from '@/shared/ui';
import { CreatorCard } from '@/domains/marketplace';
import { useCreatorCardDemo } from './hooks/useCreatorCardDemo';

const CreatorCardDemoComponent: React.FC = () => {
  const demo = useCreatorCardDemo();

  return (
    <Box gap="md">
      {demo.cards.map(creator => (
        <CreatorCard
          key={creator.slug}
          creator={creator}
          selected={demo.selected.has(creator.slug)}
          onPress={demo.toggleSelected}
          onToggleShortlist={demo.toggleShortlist}
        />
      ))}
    </Box>
  );
};

export const CreatorCardDemo = memo(CreatorCardDemoComponent);
