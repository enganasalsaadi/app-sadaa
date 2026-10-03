import React, { memo } from 'react';
import { CustomButton } from '../CustomButton';
import type { ButtonVariant } from '../CustomButton';
import { Box } from '../primitives/Box';
import { useLayoutContext } from './LayoutContext';

export interface LayoutFooterAction {
  label: string;
  onPress: () => void;
  /** Shows the button spinner and blocks presses (double-submit guard). */
  loading?: boolean;
  disabled?: boolean;
}

export interface LayoutFooterProps {
  /** The screen's single primary action (rule 09). `onBrand` over navy. */
  primary: LayoutFooterAction & { variant?: Extract<ButtonVariant, 'primary' | 'onBrand' | 'danger'> };
  /** Optional action under the primary: `ghost` (default) for skip/cancel, `secondary` for a real alternative. */
  secondary?: LayoutFooterAction & { variant?: Extract<ButtonVariant, 'secondary' | 'ghost'> };
  /** Optional third, lowest-emphasis action (always `ghost`); pair it with a `secondary` one. */
  tertiary?: LayoutFooterAction;
  /** Content above the buttons (totals row, terms note). */
  top?: React.ReactNode;
}

/** Standard content for `Layout`'s `footer` slot. Aligns with the screen's horizontal padding. */
const LayoutFooterComponent: React.FC<LayoutFooterProps> = ({
  primary,
  secondary,
  tertiary,
  top,
}) => {
  const { paddingX } = useLayoutContext();

  return (
    <Box px={paddingX} py="md" gap="sm">
      {top}
      <CustomButton
        title={primary.label}
        onPress={primary.onPress}
        loading={primary.loading}
        disabled={primary.disabled}
        variant={primary.variant}
      />
      {secondary ? (
        <CustomButton
          title={secondary.label}
          onPress={secondary.onPress}
          loading={secondary.loading}
          disabled={secondary.disabled}
          variant={secondary.variant ?? 'ghost'}
        />
      ) : null}
      {tertiary ? (
        <CustomButton
          title={tertiary.label}
          onPress={tertiary.onPress}
          loading={tertiary.loading}
          disabled={tertiary.disabled}
          variant="ghost"
        />
      ) : null}
    </Box>
  );
};

export const LayoutFooter = memo(LayoutFooterComponent);
