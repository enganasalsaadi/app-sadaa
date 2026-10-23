import React, { memo } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FileWarning, RotateCcw } from 'lucide-react-native';
import { iconStroke, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';

export type ViewerFallbackState = 'loading' | 'failed' | 'gone';

export interface ViewerFallbackProps {
  state: ViewerFallbackState;
  /** 0–1 while a document downloads. */
  progress?: number;
  onRetry?: () => void;
}

/** What the stage shows instead of the file: loading, a failed open (retry) or a purged file. */
const ViewerFallbackComponent: React.FC<ViewerFallbackProps> = ({ state, progress, onRetry }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  if (state === 'loading') {
    return (
      <Box flex={1} align="center" justify="center" gap="md">
        <ActivityIndicator color={colors.viewer.accent} />
        {progress !== undefined && progress > 0 ? (
          <Text variant="caption" color={colors.viewer.muted}>
            {t('files.viewer.loadingPercent', { percent: Math.round(progress * 100) })}
          </Text>
        ) : null}
      </Box>
    );
  }

  return (
    <Box flex={1} align="center" justify="center" gap="md" px="3xl">
      <FileWarning size={sizes.icon.xl} color={colors.viewer.muted} strokeWidth={iconStroke.thin} />
      <Text variant="title" color={colors.viewer.text} align="center">
        {state === 'gone' ? t('files.viewer.gone') : t('files.viewer.loadFailed')}
      </Text>
      <Text variant="bodySmall" color={colors.viewer.muted} align="center">
        {state === 'gone' ? t('files.viewer.goneBody') : t('files.viewer.loadFailedBody')}
      </Text>
      {state === 'failed' && onRetry ? (
        <Pressable
          onPress={onRetry}
          row
          align="center"
          gap="sm"
          px="xl"
          height={sizes.button.md}
          borderRadius="full"
          bg={colors.viewer.glass}
          accessibilityRole="button"
          accessibilityLabel={t('files.viewer.retry')}
        >
          <RotateCcw size={sizes.icon.sm} color={colors.viewer.text} strokeWidth={iconStroke.regular} />
          <Text variant="buttonSmall" color={colors.viewer.text}>
            {t('files.viewer.retry')}
          </Text>
        </Pressable>
      ) : null}
    </Box>
  );
};

export const ViewerFallback = memo(ViewerFallbackComponent);
