import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Bookmark } from 'lucide-react-native';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Pressable } from '@/shared/ui';

const RIBBON_WIDTH = moderateScale(40);
const RIBBON_HEIGHT = moderateScale(52);
const POP_SCALE = 1.25;

export interface OpportunityBookmarkProps {
  saved: boolean;
  onToggle: () => void;
}

/** The save flag hanging from the cover's top edge: dark glass when empty, teal and filled once saved, with a small pop. */
const OpportunityBookmarkComponent: React.FC<OpportunityBookmarkProps> = ({ saved, onToggle }) => {
  const { t } = useTranslation();
  const { colors, sizes, radii, spacing } = useTheme();
  const reduceMotion = useReducedMotion();
  const pop = useSharedValue(1);
  const styles = useStyles(
    (): Record<'ribbon', ViewStyle> => ({
      ribbon: {
        width: RIBBON_WIDTH,
        height: RIBBON_HEIGHT,
        // The cover pads its content; the flag undoes that to hang from the photo's edge.
        marginTop: -spacing.md,
        borderBottomStartRadius: radii.md,
        borderBottomEndRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: saved ? colors.interactive.main : colors.media.glass,
      },
    }),
    [colors.interactive.main, colors.media.glass, radii.md, saved, spacing.md],
  );
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const press = () => {
    if (!saved && !reduceMotion) pop.value = withSequence(withSpring(POP_SCALE), withSpring(1));
    onToggle();
  };

  return (
    <Pressable
      onPress={press}
      style={styles.ribbon}
      hitSlop={spacing.md}
      accessibilityRole="button"
      accessibilityState={{ selected: saved }}
      accessibilityLabel={t(saved ? 'marketplace.campaign.feed.card.unsave' : 'marketplace.campaign.feed.card.save')}
    >
      <Animated.View style={popStyle}>
        <Bookmark
          size={sizes.icon.sm}
          color={colors.text.onBrand}
          fill={saved ? colors.text.onBrand : colors.layout.transparent}
          strokeWidth={iconStroke.bold}
        />
      </Animated.View>
    </Pressable>
  );
};

export const OpportunityBookmark = memo(OpportunityBookmarkComponent);
