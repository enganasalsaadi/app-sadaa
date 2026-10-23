import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, VolumeX, X } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { ViewerGlassButton } from './ViewerGlassButton';

export interface ViewerTopBarProps {
  name: string;
  /** «Brief · 1 / 18» or «Brief · 2.4 MB». */
  subtitle: string;
  onClose: () => void;
  /** Video only: the mute toggle on the end side. */
  mute?: { muted: boolean; onToggle: () => void } | null;
}

/** Close, the file's name and where it belongs; mute for videos. */
const ViewerTopBarComponent: React.FC<ViewerTopBarProps> = ({ name, subtitle, onClose, mute }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box row align="center" gap="md" px="md">
      <ViewerGlassButton icon={X} label={t('files.viewer.close')} onPress={onClose} />
      <Box flex={1} align="center">
        <Text variant="bodyMedium" color={colors.viewer.text} numberOfLines={1}>
          {name}
        </Text>
        <Text variant="caption" color={colors.viewer.muted} numberOfLines={1}>
          {subtitle}
        </Text>
      </Box>
      {mute ? (
        <ViewerGlassButton
          icon={mute.muted ? VolumeX : Volume2}
          label={mute.muted ? t('files.viewer.unmute') : t('files.viewer.mute')}
          onPress={mute.onToggle}
        />
      ) : (
        <Box width={sizes.iconButton.md} />
      )}
    </Box>
  );
};

export const ViewerTopBar = memo(ViewerTopBarComponent);
