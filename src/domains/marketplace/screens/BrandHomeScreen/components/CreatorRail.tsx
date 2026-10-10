import React, { memo, useCallback, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useStyles, useTheme } from '@/core/theme';
import { Box, SectionHeader } from '@/shared/ui';
import { CREATOR_RAIL_CARD_WIDTH, CreatorCard } from '../../../components/CreatorCard';
import type { BrandHomeRail, ExploreCreator } from '../../../types/explore';

interface CreatorRailProps {
  rail: BrandHomeRail;
  onOpenCreator: (creator: ExploreCreator) => void;
  onToggleShortlist: (creator: ExploreCreator) => void;
  /** "See all" → Explore with the rail's filters; shown only when the rail has them. */
  onSeeAll: (rail: BrandHomeRail) => void;
}

/**
 * One server rail ("Near you", "Verified", …): title, then compact cards edge to edge that
 * settle card by card. Bounded by the server (a handful per rail), so no virtualised list.
 */
const CreatorRailComponent: React.FC<CreatorRailProps> = ({
  rail,
  onOpenCreator,
  onToggleShortlist,
  onSeeAll,
}) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const seeAll = useCallback(() => onSeeAll(rail), [onSeeAll, rail]);
  const action = useMemo(
    () => (rail.seeAll ? { label: t('marketplace.brandHome.seeAll'), onPress: seeAll } : undefined),
    [rail.seeAll, seeAll, t],
  );
  const styles = useStyles(theme => ({
    // Vertical room keeps the cards' shadows from being clipped by the scroll view.
    content: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.md,
    },
  }));

  return (
    <Box gap="xs">
      <Box px="xl">
        <SectionHeader title={rail.title} emphasis="strong" action={action} />
      </Box>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        snapToInterval={CREATOR_RAIL_CARD_WIDTH + spacing.md}
        snapToAlignment="start"
        decelerationRate="fast"
      >
        {rail.items.map(creator => (
          <CreatorCard
            key={creator.slug}
            creator={creator}
            variant="rail"
            onPress={onOpenCreator}
            onToggleShortlist={onToggleShortlist}
          />
        ))}
      </ScrollView>
    </Box>
  );
};

export const CreatorRail = memo(CreatorRailComponent);
