import React, { memo, useCallback } from 'react';
import type { AccessibilityActionEvent } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { IconButton } from '../IconButton';

export interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  /** What the number counts ("Delivery time"); read before the value. */
  accessibilityLabel: string;
  /** Shown and read instead of the bare number ("5 days"). */
  formatValue?: (value: number) => string;
  disabled?: boolean;
}

const ACCESSIBILITY_ACTIONS = [{ name: 'increment' }, { name: 'decrement' }] as const;

/** − value + for a small bounded count (delivery days, quantities). Buttons stop at the bounds. */
const NumberStepperComponent: React.FC<NumberStepperProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  accessibilityLabel,
  formatValue,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const text = formatValue ? formatValue(value) : String(value);
  const canDecrement = !disabled && value - step >= min;
  const canIncrement = !disabled && value + step <= max;

  const decrement = useCallback(() => {
    if (canDecrement) onChange(value - step);
  }, [canDecrement, onChange, step, value]);
  const increment = useCallback(() => {
    if (canIncrement) onChange(value + step);
  }, [canIncrement, onChange, step, value]);

  const onAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === 'increment') increment();
      else if (event.nativeEvent.actionName === 'decrement') decrement();
    },
    [decrement, increment],
  );

  return (
    <Box
      row
      align="center"
      gap="sm"
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value, text }}
      accessibilityState={{ disabled }}
      accessibilityActions={ACCESSIBILITY_ACTIONS}
      onAccessibilityAction={onAccessibilityAction}
    >
      <IconButton
        icon={Minus}
        variant="outline"
        size="md"
        accessibilityLabel={t('common.decrease')}
        onPress={decrement}
        disabled={!canDecrement}
      />
      <Box minWidth={sizes.button.md * 2} align="center">
        <Text variant="bodyMedium" color={disabled ? colors.text.tertiary : colors.text.primary}>
          {text}
        </Text>
      </Box>
      <IconButton
        icon={Plus}
        variant="outline"
        size="md"
        accessibilityLabel={t('common.increase')}
        onPress={increment}
        disabled={!canIncrement}
      />
    </Box>
  );
};

export const NumberStepper = memo(NumberStepperComponent);
