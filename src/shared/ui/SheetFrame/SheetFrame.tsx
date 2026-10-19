import React, { memo } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { useTheme } from '@/core/theme';
import type { SpacingToken } from '@/core/theme';
import { BottomSheet } from '../BottomSheet';
import { Box, Text } from '../primitives';

/** Tall forms (ruler + reason + hold) still fit small phones with the keyboard up. */
const MAX_HEIGHT_RATIO = 0.92;

export interface SheetFrameProps {
  visible: boolean;
  onClose: () => void;
  onDismissed?: () => void;
  /** In the white header, over the sunken body. */
  title: string;
  body?: string;
  /** Trailing the title on its row (a «Reset» link). */
  action?: React.ReactNode;
  /** Pinned in the white header under the title (a platform row, a search): stays while the body scrolls. */
  headerAccessory?: React.ReactNode;
  /** The sheet's one decision, pinned in the white footer. A picker that closes on tap has none. */
  footer?: React.ReactNode;
  /** Space between the body's blocks (default `lg`). */
  gap?: SpacingToken;
  children: React.ReactNode;
}

/**
 * The standard sheet shell: a white header (handle + title), the content sunken on the page
 * color so its cards stand off it, and the decision pinned in a white footer that stays above the
 * keyboard. Only the middle scrolls.
 */
const SheetFrameComponent: React.FC<SheetFrameProps> = ({
  visible,
  onClose,
  onDismissed,
  title,
  body,
  action,
  headerAccessory,
  footer,
  gap = 'lg',
  children,
}) => {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      onDismissed={onDismissed}
      maxHeight={height * MAX_HEIGHT_RATIO}
      bg={colors.layout.base}
      header={
        <Box px="xl" pb="lg" gap="lg">
          <Box row align="center" justify="space-between" gap="md">
            <Box flex={1} gap="xs">
              <Text variant="h3" color={colors.text.primary} accessibilityRole="header">
                {title}
              </Text>
              {body ? (
                <Text variant="bodySmall" color={colors.text.secondary}>
                  {body}
                </Text>
              ) : null}
            </Box>
            {action}
          </Box>
          {headerAccessory}
        </Box>
      }
      footer={
        footer ? (
          <Box px="xl" pt="md" pb="md">
            {footer}
          </Box>
        ) : undefined
      }
      // Without a footer the page color runs to the bottom edge instead of a white strip.
      muted={!footer}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Box px="xl" py="lg" gap={gap}>
          {children}
        </Box>
      </ScrollView>
    </BottomSheet>
  );
};

export const SheetFrame = memo(SheetFrameComponent);
