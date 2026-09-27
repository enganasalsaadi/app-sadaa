import React, { memo } from 'react';
import { Switch as RNSwitch } from 'react-native';
import { useTheme } from '@/core/theme';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** Required: a switch is usually read without its row label. */
  accessibilityLabel: string;
  disabled?: boolean;
}

/** Native switch in theme colors. Put it in a `ListRow` `trailing` for a labelled setting. */
const SwitchComponent: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  accessibilityLabel,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const palette = colors.form.switch;

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: palette.trackOff, true: palette.trackOn }}
      thumbColor={palette.thumb}
      ios_backgroundColor={palette.trackOff}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
    />
  );
};

export const Switch = memo(SwitchComponent);
