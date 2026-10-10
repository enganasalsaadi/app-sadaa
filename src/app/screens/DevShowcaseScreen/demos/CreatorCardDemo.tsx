import React, { memo } from 'react';
import { ScrollView } from 'react-native';
import { useStyles } from '@/core/theme';
import { Box } from '@/shared/ui';
import { CreatorCard } from '@/domains/marketplace';
import { useCreatorCardDemo } from './hooks/useCreatorCardDemo';

const CreatorCardDemoComponent: React.FC = () => {
  const demo = useCreatorCardDemo();
  const styles = useStyles(({ spacing }) => ({
    rail: { paddingVertical: spacing.sm, gap: spacing.md },
  }));

  return (
    <Box gap="lg">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {demo.cards.map(creator => (
          <CreatorCard
            key={creator.slug}
            creator={creator}
            variant="rail"
            onPress={demo.toggleSelected}
            onToggleShortlist={demo.toggleShortlist}
          />
        ))}
      </ScrollView>
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
    </Box>
  );
};

export const CreatorCardDemo = memo(CreatorCardDemoComponent);
