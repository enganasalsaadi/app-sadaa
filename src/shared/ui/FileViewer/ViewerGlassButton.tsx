import React, { memo } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { iconStroke, useTheme } from '@/core/theme';
import { Pressable } from '../primitives/Pressable';

export interface ViewerGlassButtonProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}

/** A round frosted control over the dark stage (close, mute). 44pt. */
const ViewerGlassButtonComponent: React.FC<ViewerGlassButtonProps> = ({ icon: Icon, label, onPress }) => {
  const { colors, sizes } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      scaleOnPress
      width={sizes.iconButton.md}
      height={sizes.iconButton.md}
      borderRadius="full"
      bg={colors.viewer.glass}
      borderWidth="thin"
      borderColor={colors.viewer.glassBorder}
      align="center"
      justify="center"
      hitSlop={sizes.hitSlop.sm}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon size={sizes.icon.sm} color={colors.viewer.text} strokeWidth={iconStroke.regular} />
    </Pressable>
  );
};

export const ViewerGlassButton = memo(ViewerGlassButtonComponent);
