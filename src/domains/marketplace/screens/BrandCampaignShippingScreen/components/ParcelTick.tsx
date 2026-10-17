import React, { memo } from 'react';
import type { ViewStyle } from 'react-native';
import { AlertTriangle, Check, Lock } from 'lucide-react-native';
import { iconStroke, moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box } from '@/shared/ui';
import type { CampaignParcelState } from '../../../utils/campaignShipping';

const TICK = moderateScale(28);

export interface ParcelTickProps {
  state: CampaignParcelState;
  /** Ticked into the batch. */
  selected: boolean;
}

/** The parcel's checkbox: empty or filled to ship, a warning when it failed, a lock when it waits, a check once sent. */
const ParcelTickComponent: React.FC<ParcelTickProps> = ({ state, selected }) => {
  const { colors, sizes } = useTheme();
  const filled = state === 'sent' ? colors.status.success.main : selected ? colors.interactive.main : null;
  const edge =
    state === 'failed' ? colors.status.danger.main : filled ?? (state === 'locked' ? colors.border.default : colors.border.strong);
  const styles = useStyles(
    ({ borderWidths }): Record<'disc', ViewStyle> => ({
      disc: {
        width: TICK,
        height: TICK,
        borderRadius: TICK / 2,
        borderWidth: borderWidths.md,
        borderColor: edge,
        borderStyle: state === 'locked' ? 'dashed' : 'solid',
        backgroundColor: filled ?? 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
    [edge, filled, state],
  );
  const icon = sizes.icon.xs;
  return (
    <Box style={styles.disc} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {state === 'sent' || (selected && state !== 'failed') ? (
        <Check size={icon} color={colors.text.onAccent} strokeWidth={iconStroke.bold} />
      ) : state === 'failed' ? (
        <AlertTriangle size={icon} color={filled ? colors.text.onAccent : colors.status.danger.main} />
      ) : state === 'locked' ? (
        <Lock size={icon} color={colors.text.tertiary} />
      ) : null}
    </Box>
  );
};

export const ParcelTick = memo(ParcelTickComponent);
