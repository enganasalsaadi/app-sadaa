import React, { memo, useMemo } from 'react';
import { GestureDetector } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { moderateScale, useTheme } from '@/core/theme';
import { Box, Text } from '@/shared/ui';
import type { ExploreCreator } from '../../../types/explore';
import { useStoryDeck } from '../hooks/useStoryDeck';
import { DeckCard } from './DeckCard';

/** Full deck height, including the cards peeking out below the top one. */
export const STORY_DECK_HEIGHT = moderateScale(476);

interface StoryDeckProps {
  creators: ExploreCreator[];
  onOpen: (creator: ExploreCreator) => void;
  onToggleShortlist: (creator: ExploreCreator) => void;
}

/**
 * Brand Home signature: the "near you" creators as a stack of full-bleed story cards. Swipe the
 * top one away (either side) for the next, tap it for the Media Kit, ❤️ to shortlist. The deck
 * loops; each card's bars show where it sits.
 */
const StoryDeckComponent: React.FC<StoryDeckProps> = ({ creators, onOpen, onToggleShortlist }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const count = creators.length;
  const deck = useStoryDeck(count);
  // Furthest card first, so the top one also draws last (Android ignores animated zIndex order).
  const ordered = useMemo(
    () =>
      creators
        .map((creator, index) => ({ creator, index, rel: (index - deck.top + count) % count }))
        .sort((a, b) => b.rel - a.rel),
    [count, creators, deck.top],
  );

  return (
    <Box gap="sm">
      <GestureDetector gesture={deck.gesture}>
        <Box height={STORY_DECK_HEIGHT} mx="xl">
          {ordered.map(({ creator, index }) => (
            <DeckCard
              key={creator.slug}
              creator={creator}
              index={index}
              count={count}
              isTop={index === deck.top}
              base={deck.base}
              drag={deck.drag}
              onOpen={onOpen}
              onToggleShortlist={onToggleShortlist}
              onNext={deck.next}
            />
          ))}
        </Box>
      </GestureDetector>
      {count > 1 ? (
        <Text variant="caption" color={colors.text.tertiary} align="center">
          {t('marketplace.brandHome.deck.hint')}
        </Text>
      ) : null}
    </Box>
  );
};

export const StoryDeck = memo(StoryDeckComponent);
