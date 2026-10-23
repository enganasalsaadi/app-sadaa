import React, { memo, useCallback, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { useStyles, useTheme } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { SuperList } from '../SuperList';
import { ViewerGlassButton } from './ViewerGlassButton';

export interface ViewerPdfPagesProps {
  pages: number;
  page: number;
  onPick: (page: number) => void;
  onClose: () => void;
}

/** The panel covers this share of the screen; the page stays visible above. */
const PANEL_SHARE = 0.55;

/** Paper-shaped lines, a hint of text on each page card. */
const PAPER_LINES = [0, 1, 2] as const;

interface PageCellProps {
  page: number;
  current: boolean;
  onPick: (page: number) => void;
}

const PageCell = memo<PageCellProps>(({ page, current, onPick }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ colors: palette, radii, borderWidths, sizes, spacing }): Record<'paper' | 'line' | 'lineShort', ViewStyle> => ({
      paper: {
        height: sizes.viewer.pageCell,
        borderRadius: radii.xs,
        backgroundColor: palette.viewer.paper,
        borderWidth: borderWidths.md,
        borderColor: current ? palette.viewer.accent : palette.viewer.paper,
        padding: spacing.sm,
        gap: spacing.xs,
      },
      line: { height: borderWidths.lg, borderRadius: radii.full, backgroundColor: palette.viewer.paperLine },
      lineShort: {
        height: borderWidths.lg,
        width: '60%',
        borderRadius: radii.full,
        backgroundColor: palette.viewer.paperLine,
      },
    }),
    [current],
  );
  const pick = useCallback(() => onPick(page), [onPick, page]);
  return (
    <Pressable
      onPress={pick}
      scaleOnPress
      flex={1}
      mx="xs"
      gap="xs"
      align="center"
      accessibilityRole="button"
      accessibilityLabel={t('files.viewer.goToPageNumber', { page })}
      accessibilityState={{ selected: current }}
    >
      <Box style={styles.paper} width="100%">
        {PAPER_LINES.map(line => (
          <Box key={line} style={line === PAPER_LINES.length - 1 ? styles.lineShort : styles.line} />
        ))}
      </Box>
      <Text variant="amountSmall" color={current ? colors.viewer.accent : colors.viewer.muted}>
        {page}
      </Text>
    </Pressable>
  );
});
PageCell.displayName = 'PageCell';

/** «الصفحات»: every page as a card; a tap jumps there and closes the panel. */
const ViewerPdfPagesComponent: React.FC<ViewerPdfPagesProps> = ({ pages, page, onPick, onClose }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStyles(
    ({ colors: palette, radii, borderWidths, screen }): Record<'panel', ViewStyle> => ({
      panel: {
        height: screen.height * PANEL_SHARE,
        borderTopStartRadius: radii.xl,
        borderTopEndRadius: radii.xl,
        backgroundColor: palette.viewer.dock,
        borderWidth: borderWidths.thin,
        borderColor: palette.viewer.glassBorder,
        overflow: 'hidden',
      },
    }),
  );
  const data = useMemo(() => Array.from({ length: pages }, (_, i) => i + 1), [pages]);
  const keyExtractor = useCallback((value: number) => String(value), []);
  const renderItem = useCallback(
    ({ item }: { item: number }) => <PageCell page={item} current={item === page} onPick={onPick} />,
    [onPick, page],
  );

  return (
    <Box style={styles.panel}>
      <Box row align="center" justify="space-between" px="lg" py="md">
        <Text variant="title" color={colors.viewer.text}>
          {t('files.viewer.pagesTitle', { count: pages })}
        </Text>
        <ViewerGlassButton icon={X} label={t('files.viewer.close')} onPress={onClose} />
      </Box>
      <Box flex={1} px="md">
        <SuperList data={data} layout="grid-3" keyExtractor={keyExtractor} renderItem={renderItem} extraData={page} />
      </Box>
    </Box>
  );
};

export const ViewerPdfPages = memo(ViewerPdfPagesComponent);
