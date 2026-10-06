import React, { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Pressable, Text } from '@/shared/ui';

interface MediaKitCardLinkProps {
  label: string;
  onPress: () => void;
}

/** Teal text link with a direction-aware chevron (≥ 44pt tall). */
const MediaKitCardLinkComponent: React.FC<MediaKitCardLinkProps> = ({ label, onPress }) => {
  const { colors, sizes, isRTL } = useTheme();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Pressable
      onPress={onPress}
      row
      align="center"
      gap="xs"
      minHeight={sizes.button.md}
      accessibilityRole="link"
      accessibilityLabel={label}
    >
      <Text variant="bodyMedium" color={colors.interactive.text}>
        {label}
      </Text>
      <Chevron size={sizes.icon.sm} color={colors.interactive.main} />
    </Pressable>
  );
};

export const MediaKitCardLink = memo(MediaKitCardLinkComponent);
