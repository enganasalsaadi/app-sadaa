import type { TextStyle, ViewStyle } from 'react-native';
import type { RadiiToken, Theme } from '@/core/theme/types';

export type InputSize = 'sm' | 'md' | 'lg';

interface InputColors {
  background: string;
  border: string;
  focusBorder: string;
  text: string;
  placeholder: string;
  label: string;
  disabledBg: string;
}

export const getInputColors = (theme: Theme): InputColors => {
  const { colors } = theme;
  return {
    background: colors.form.input.background,
    border: colors.border.default,
    focusBorder: colors.interactive.main,
    text: colors.text.primary,
    placeholder: colors.form.input.placeholder,
    label: colors.form.input.label,
    disabledBg: colors.surface.elevated,
  };
};

export const getInputHeight = (size: InputSize, theme: Theme): number => {
  return theme.sizes.input[size];
};

interface FieldFrameState {
  focused: boolean;
  error: boolean;
  editable: boolean;
  borderRadius: RadiiToken;
}

/** Border, fill and row direction shared by every single-field input frame. */
export const getFieldFrameStyle = (
  theme: Theme,
  { focused, error, editable, borderRadius }: FieldFrameState,
): ViewStyle => {
  const ic = getInputColors(theme);
  return {
    flexDirection: theme.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: editable ? ic.background : ic.disabledBg,
    borderRadius: theme.radii[borderRadius],
    borderWidth: focused ? theme.borderWidths.sm : theme.borderWidths.thin,
    borderColor: focused
      ? ic.focusBorder
      : error
      ? theme.colors.form.input.borderError
      : ic.border,
  };
};

export const createInputTextStyle = (theme: Theme): TextStyle => ({
  fontSize: theme.typography.body.fontSize,
  fontFamily: theme.typography.body.fontFamily,
  fontWeight: theme.typography.body.fontWeight,
  color: theme.colors.text.primary,
  flex: 1,
  padding: 0,
});

export const createMultilineContainerStyle = (
  theme: Theme,
  numberOfLines: number,
): ViewStyle => ({
  minHeight: theme.sizes.input.md,
  height:
    theme.typography.body.lineHeight * numberOfLines + theme.spacing.md * 2,
  alignItems: 'flex-start',
  paddingVertical: theme.spacing.sm,
});
