import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Box} from '../primitives/Box';
import type {BoxProps} from '../primitives/Box';

export interface EndScreenPaddingProps extends Omit<BoxProps, 'style' | 'height'> {
  /** Extra height below safe-area inset (e.g. footer + breathing room) */
  offset?: number;
  /** Include `insets.bottom` in total height */
  withInsets?: boolean;
  style?: BoxProps['style'];
}

/**
 * Spacer at the end of scroll content: optional bottom inset + fixed offset (overscroll / footer clearance).
 */
export const EndScreenPadding: React.FC<EndScreenPaddingProps> = ({
  offset = 48,
  withInsets = false,
  style,
  ...props
}) => {
  const insets = useSafeAreaInsets();
  const insetPart = withInsets ? insets.bottom : 0;

  return (
    <Box
      style={[{height: insetPart + offset}, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      {...props}
    />
  );
};
