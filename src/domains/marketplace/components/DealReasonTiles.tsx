import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box, Pressable, Text } from '@/shared/ui';
import type { DealReasonDef } from '../constants/dealChanges';

export interface DealReasonTilesProps {
  /** Server codes, in the order they show. */
  reasons: readonly string[];
  defs: Readonly<Record<string, DealReasonDef>>;
  value: string | null;
  onChange: (reason: string) => void;
  error?: string;
}

interface ReasonTileProps {
  reason: string;
  def: DealReasonDef;
  selected: boolean;
  onPick: (reason: string) => void;
}

const ReasonTile = memo<ReasonTileProps>(({ reason, def, selected, onPick }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const Icon = def.icon;
  const styles = useStyles(
    ({ radii, spacing, borderWidths }): Record<'tile' | 'icon' | 'check', ViewStyle> => ({
      tile: {
        flexBasis: '47%',
        flexGrow: 1,
        minHeight: sizes.thumbnail.md,
        padding: spacing.md,
        gap: spacing.sm,
        justifyContent: 'space-between',
        borderRadius: radii.lg,
        borderWidth: borderWidths.md,
        borderColor: selected ? colors.interactive.main : colors.border.default,
        backgroundColor: selected ? colors.interactive.soft : colors.surface.main,
      },
      icon: {
        width: sizes.icon.xl,
        height: sizes.icon.xl,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected ? colors.interactive.main : colors.surface.elevated,
      },
      check: {
        position: 'absolute',
        top: spacing.md,
        end: spacing.md,
        width: sizes.icon.md,
        height: sizes.icon.md,
        borderRadius: radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.interactive.main,
      },
    }),
    [
      colors.border.default,
      colors.interactive.main,
      colors.interactive.soft,
      colors.surface.elevated,
      colors.surface.main,
      selected,
      sizes,
    ],
  );
  const onPress = useCallback(() => onPick(reason), [onPick, reason]);
  return (
    <Pressable
      style={styles.tile}
      scaleOnPress
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={t(def.label)}
    >
      <Box style={styles.icon}>
        <Icon size={sizes.icon.sm} color={selected ? colors.text.onAccent : colors.icon.secondary} />
      </Box>
      <Text variant="buttonSmall" color={colors.text.primary}>
        {t(def.label)}
      </Text>
      {selected ? (
        <Box style={styles.check}>
          <Check size={sizes.icon.xs} color={colors.text.onAccent} />
        </Box>
      ) : null}
    </Pressable>
  );
});

/** A sheet's reasons as two-up tiles (a tap picks one), the field error under them. */
const DealReasonTilesComponent: React.FC<DealReasonTilesProps> = ({ reasons, defs, value, onChange, error }) => {
  const { colors } = useTheme();
  return (
    <Box gap="xs" accessibilityRole="radiogroup">
      <Box row wrap gap="sm">
        {reasons.map(reason => {
          const def = defs[reason];
          return def ? (
            <ReasonTile key={reason} reason={reason} def={def} selected={value === reason} onPick={onChange} />
          ) : null;
        })}
      </Box>
      {error ? (
        <Text variant="caption" color={colors.status.danger.text} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </Box>
  );
};

export const DealReasonTiles = memo(DealReasonTilesComponent);
