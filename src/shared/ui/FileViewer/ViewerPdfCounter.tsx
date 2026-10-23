import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import type { PdfState } from './types';

export interface ViewerPdfCounterProps {
  state: PdfState;
}

/** «3 / 12 | ×1.0»: which page and how close, under the top bar. */
const ViewerPdfCounterComponent: React.FC<ViewerPdfCounterProps> = ({ state }) => {
  const { t } = useTranslation();
  const { colors, sizes, borderWidths } = useTheme();
  if (state.pages === 0) return null;
  const zoom = t('files.viewer.zoomLevel', {
    zoom: formatNumber(state.scale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
  });
  return (
    <Box
      row
      align="center"
      gap="md"
      px="lg"
      py="xs"
      borderRadius="full"
      bg={colors.viewer.glass}
      borderWidth="thin"
      borderColor={colors.viewer.glassBorder}
      accessible
      accessibilityLabel={`${t('files.viewer.pageOf', { page: state.page, pages: state.pages })}, ${zoom}`}
    >
      <Text variant="amountSmall" color={colors.viewer.text}>
        {t('files.viewer.pageCounter', { page: state.page, pages: state.pages })}
      </Text>
      <Box width={borderWidths.thin} height={sizes.icon.xs} bg={colors.viewer.glassBorder} />
      <Text variant="amountSmall" color={colors.viewer.muted}>
        {zoom}
      </Text>
    </Box>
  );
};

export const ViewerPdfCounter = memo(ViewerPdfCounterComponent);
