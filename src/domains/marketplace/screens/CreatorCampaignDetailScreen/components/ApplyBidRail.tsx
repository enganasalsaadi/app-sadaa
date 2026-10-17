import React, { memo } from 'react';
import type { DimensionValue, ViewStyle } from 'react-native';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box } from '@/shared/ui';

const TRACK = moderateScale(8);
const THUMB = moderateScale(22);

export interface ApplyBidRailProps {
  /** 0–1: where the bid sits between $5 and the maximum. */
  position: number;
  /** 0–1: where the suggested range starts (it runs on to the maximum). */
  suggestedFrom: number;
  invalid: boolean;
}

const percent = (share: number): DimensionValue => `${Math.round(share * 100)}%`;

/**
 * The bid on a ruler from $5 to the binding maximum: the stretch the brand suggests is lit
 * underneath, the creator's bid is the filled part and its knob. It shows, it doesn't take input
 * (the number above does), and the knob turns red when the bid is outside what is allowed.
 */
const ApplyBidRailComponent: React.FC<ApplyBidRailProps> = ({ position, suggestedFrom, invalid }) => {
  const { colors } = useTheme();
  const tone = invalid ? colors.form.input.borderError : colors.interactive.main;
  const styles = useStyles(
    ({ borderWidths }): Record<'track' | 'suggested' | 'fill' | 'thumb', ViewStyle> => ({
      track: { height: TRACK, borderRadius: TRACK / 2, backgroundColor: colors.border.default, justifyContent: 'center' },
      suggested: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        start: percent(suggestedFrom),
        end: 0,
        borderRadius: TRACK / 2,
        backgroundColor: colors.brand.soft,
      },
      fill: { position: 'absolute', top: 0, bottom: 0, start: 0, width: percent(position), borderRadius: TRACK / 2, backgroundColor: tone },
      thumb: {
        position: 'absolute',
        start: percent(position),
        marginStart: -THUMB / 2,
        width: THUMB,
        height: THUMB,
        borderRadius: THUMB / 2,
        backgroundColor: colors.surface.main,
        borderWidth: borderWidths.lg,
        borderColor: tone,
      },
    }),
    [colors.border.default, colors.brand.soft, colors.surface.main, position, suggestedFrom, tone],
  );
  return (
    <Box
      py="sm"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Box style={styles.track}>
        <Box style={styles.suggested} />
        <Box style={styles.fill} />
        <Box style={styles.thumb} />
      </Box>
    </Box>
  );
};

export const ApplyBidRail = memo(ApplyBidRailComponent);
