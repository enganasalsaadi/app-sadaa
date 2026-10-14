import React, { memo, useCallback } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Rail, Text } from '@/shared/ui';
import type { ExploreCreator } from '../../../types/explore';
import { CreatorMedia } from './CreatorMedia';

const RING_SIZE = moderateScale(78);
const RING_WIDTH = moderateScale(3);
const ITEM_WIDTH = moderateScale(84);

interface RingsRailProps {
  creators: ExploreCreator[];
  onOpen: (creator: ExploreCreator) => void;
}

/** First name only under the ring ("Lynn Halabi" → "Lynn"). */
const firstNameOf = (name: string): string => name.trim().split(/\s+/)[0] ?? name;

const Ring = memo<{ creator: ExploreCreator; onOpen: (creator: ExploreCreator) => void }>(
  ({ creator, onOpen }) => {
    const { colors } = useTheme();
    const open = useCallback(() => onOpen(creator), [creator, onOpen]);
    const styles = useStyles(() => ({
      ring: {
        width: RING_SIZE,
        height: RING_SIZE,
        borderRadius: RING_SIZE / 2,
        padding: RING_WIDTH,
      },
    }), []);
    return (
      <Pressable
        width={ITEM_WIDTH}
        align="center"
        gap="sm"
        onPress={open}
        scaleOnPress
        accessibilityRole="button"
        accessibilityLabel={creator.displayName}
      >
        <LinearGradient
          colors={colors.gradients.storyRing}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ring}
        >
          <Box flex={1} borderRadius="full" overflow="hidden" borderWidth="lg" borderColor={colors.layout.base}>
            <CreatorMedia creator={creator} monogram="h4" />
          </Box>
        </LinearGradient>
        <Text variant="caption" color={colors.text.secondary} numberOfLines={1}>
          {firstNameOf(creator.displayName)}
        </Text>
      </Pressable>
    );
  },
);

/** New / recently viewed: story rings in a row, the lightest rail on the page. */
const RingsRailComponent: React.FC<RingsRailProps> = ({ creators, onOpen }) => {
  return (
    <Rail gap="sm">
      {creators.map(creator => (
        <Ring key={creator.slug} creator={creator} onOpen={onOpen} />
      ))}
    </Rail>
  );
};

export const RingsRail = memo(RingsRailComponent);
