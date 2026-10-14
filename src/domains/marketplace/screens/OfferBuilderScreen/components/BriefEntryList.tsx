import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';

interface BriefEntryListProps {
  entries: readonly string[];
  /** `chips`: hashtags / mentions as removable pills; `points`: talking points / don'ts as a list. */
  look: 'chips' | 'points';
  /** Don'ts get a danger-toned bullet. */
  tone?: 'default' | 'avoid';
  onRemove: (entry: string) => void;
}

/** What the brand added so far; each entry slides in and has its own remove (≥ 44pt). */
const BriefEntryListComponent: React.FC<BriefEntryListProps> = ({ entries, look, tone = 'default', onRemove }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const reduceMotion = useReducedMotion();
  const styles = useStyles(
    ({ radii, spacing }): Record<'chip' | 'point' | 'bullet', ViewStyle> => ({
      chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingStart: spacing.md,
        borderRadius: radii.full,
        backgroundColor: colors.interactive.soft,
      },
      point: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
      bullet: {
        width: spacing.sm,
        height: spacing.sm,
        borderRadius: radii.full,
        backgroundColor: tone === 'avoid' ? colors.status.danger.main : colors.interactive.main,
      },
    }),
    [colors, tone],
  );
  if (entries.length === 0) return null;
  const entering = reduceMotion ? undefined : FadeInDown.springify();
  const exiting = reduceMotion ? undefined : FadeOut;
  const layout = reduceMotion ? undefined : LinearTransition;

  if (look === 'chips') {
    return (
      <Box row wrap gap="sm">
        {entries.map(entry => (
          <Animated.View key={entry} entering={entering} exiting={exiting} layout={layout} style={styles.chip}>
            <Text variant="bodySmall" color={colors.interactive.text} writingDirection="ltr">
              {entry}
            </Text>
            <Pressable
              width={sizes.button.sm}
              height={sizes.button.sm}
              align="center"
              justify="center"
              hitSlop={sizes.hitSlop.sm}
              onPress={() => onRemove(entry)}
              accessibilityRole="button"
              accessibilityLabel={t('marketplace.offer.brief.remove', { text: entry })}
            >
              <X size={sizes.icon.xs} color={colors.interactive.text} />
            </Pressable>
          </Animated.View>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {entries.map(entry => (
        <Animated.View key={entry} entering={entering} exiting={exiting} layout={layout} style={styles.point}>
          <Box style={styles.bullet} />
          <Box flex={1}>
            <Text variant="bodySmall" color={colors.text.primary}>
              {entry}
            </Text>
          </Box>
          <Pressable
            width={sizes.button.md}
            height={sizes.button.md}
            align="center"
            justify="center"
            onPress={() => onRemove(entry)}
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.offer.brief.remove', { text: entry })}
          >
            <X size={sizes.icon.sm} color={colors.text.tertiary} />
          </Pressable>
        </Animated.View>
      ))}
    </Box>
  );
};

export const BriefEntryList = memo(BriefEntryListComponent);
