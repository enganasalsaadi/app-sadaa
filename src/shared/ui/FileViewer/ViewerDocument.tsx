import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Play } from 'lucide-react-native';
import { extensionOf } from '@/core/download';
import { iconStroke, useTheme } from '@/core/theme';
import { formatFileSize } from '@/shared/utils';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import type { ViewerFile } from './types';

export interface ViewerDocumentProps {
  file: ViewerFile;
  /** `preview` = a neighbour waiting off-stage; `unsupported` = a file type the app can't draw. */
  variant: 'preview' | 'unsupported';
}

/**
 * A file card on the stage: neighbours while swiping (videos and PDFs load only once active), and
 * documents the app can't draw (Word, Excel…), which open in another app from the dock.
 */
const ViewerDocumentComponent: React.FC<ViewerDocumentProps> = ({ file, variant }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const Icon = file.kind === 'video' ? Play : FileText;
  const meta = [extensionOf(file.name).toUpperCase(), file.size !== null ? formatFileSize(file.size) : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <Box flex={1} align="center" justify="center" gap="md" px="3xl">
      <Box
        width={sizes.illustration.sm}
        height={sizes.illustration.sm}
        borderRadius="lg"
        bg={colors.viewer.glass}
        borderWidth="thin"
        borderColor={colors.viewer.glassBorder}
        align="center"
        justify="center"
      >
        <Icon size={sizes.icon.xl} color={colors.viewer.text} strokeWidth={iconStroke.thin} />
      </Box>
      <Text variant="title" color={colors.viewer.text} align="center" numberOfLines={2}>
        {file.name}
      </Text>
      {meta ? (
        <Text variant="caption" color={colors.viewer.muted}>
          {meta}
        </Text>
      ) : null}
      {variant === 'unsupported' ? (
        <Text variant="bodySmall" color={colors.viewer.muted} align="center">
          {t('files.viewer.unsupported')}
        </Text>
      ) : null}
    </Box>
  );
};

export const ViewerDocument = memo(ViewerDocumentComponent);
