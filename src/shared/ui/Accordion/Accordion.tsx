import React, { memo, useCallback, useEffect, useState } from 'react';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ChevronDown } from 'lucide-react-native';
import { motion, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export interface AccordionProps {
  title: string;
  subtitle?: string;
  /** Short content before the chevron (a price, a count); not part of the toggle label. */
  trailing?: React.ReactNode;
  children: React.ReactNode;
  /** Uncontrolled start state. */
  defaultExpanded?: boolean;
  /** Controlled mode: pass both. */
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

const HALF_TURN_DEG = 180;

/** Collapsible section (FAQ, brief do/don't, deal terms). Content mounts only when open. */
const AccordionComponent: React.FC<AccordionProps> = ({
  title,
  subtitle,
  trailing,
  children,
  defaultExpanded = false,
  expanded: expandedProp,
  onToggle,
}) => {
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const [expandedState, setExpandedState] = useState(defaultExpanded);
  const expanded = expandedProp ?? expandedState;
  const rotation = useSharedValue(expanded ? HALF_TURN_DEG : 0);

  useEffect(() => {
    const target = expanded ? HALF_TURN_DEG : 0;
    rotation.value = reduceMotion
      ? target
      : withTiming(target, { duration: motion.duration.base });
  }, [expanded, rotation, reduceMotion]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handlePress = useCallback(() => {
    const next = !expanded;
    if (expandedProp === undefined) setExpandedState(next);
    onToggle?.(next);
  }, [expanded, expandedProp, onToggle]);

  return (
    <Box>
      <Pressable
        onPress={handlePress}
        row
        align="center"
        gap="md"
        minHeight={sizes.button.md}
        py="sm"
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={subtitle}
        accessibilityState={{ expanded }}
      >
        <Box flex={1} gap="xs">
          <Text variant="bodyMedium">{title}</Text>
          {subtitle ? (
            <Text variant="caption" color={colors.text.secondary}>
              {subtitle}
            </Text>
          ) : null}
        </Box>
        {trailing}
        <Animated.View style={chevronStyle}>
          <ChevronDown size={sizes.icon.sm} color={colors.icon.secondary} />
        </Animated.View>
      </Pressable>
      {expanded ? (
        <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(motion.duration.base)}>
          <Box pb="md">{children}</Box>
        </Animated.View>
      ) : null}
    </Box>
  );
};

export const Accordion = memo(AccordionComponent);
