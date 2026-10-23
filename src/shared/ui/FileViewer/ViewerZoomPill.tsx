import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Minus, Plus } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, opacity, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { MAX_ZOOM, MIN_ZOOM } from './viewerGeometry';

export interface ViewerZoomPillProps {
  /** The current zoom, rounded to one decimal. */
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

/** «− ×2.4 +»: steps the zoom for one-handed use and says how close the user is. */
const ViewerZoomPillComponent: React.FC<ViewerZoomPillProps> = ({ zoom, onZoomIn, onZoomOut }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const label = t('files.viewer.zoomLevel', {
    zoom: formatNumber(zoom, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
  });

  const step = (icon: typeof Plus, a11y: string, onPress: () => void, disabled: boolean) => {
    const Icon = icon;
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        width={sizes.iconButton.md}
        height={sizes.iconButton.md}
        align="center"
        justify="center"
        opacity={disabled ? opacity.disabled : 1}
        accessibilityRole="button"
        accessibilityLabel={a11y}
        accessibilityState={{ disabled }}
      >
        <Icon size={sizes.icon.sm} color={colors.viewer.text} strokeWidth={iconStroke.regular} />
      </Pressable>
    );
  };

  return (
    <Box
      row
      align="center"
      borderRadius="full"
      bg={colors.viewer.glass}
      borderWidth="thin"
      borderColor={colors.viewer.glassBorder}
      accessibilityLabel={label}
    >
      {step(Minus, t('files.viewer.zoomOut'), onZoomOut, zoom <= MIN_ZOOM)}
      <Text variant="amountSmall" color={colors.viewer.text}>
        {label}
      </Text>
      {step(Plus, t('files.viewer.zoomIn'), onZoomIn, zoom >= MAX_ZOOM)}
    </Box>
  );
};

export const ViewerZoomPill = memo(ViewerZoomPillComponent);
