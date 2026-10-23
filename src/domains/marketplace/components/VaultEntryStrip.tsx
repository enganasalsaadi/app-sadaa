import React, { memo, useCallback } from 'react';
import type { ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, FileText, Play } from 'lucide-react-native';
import type { RefreshUrl } from '@/core/download';
import { formatNumber } from '@/core/i18n';
import { iconStroke, useStyles, useTheme } from '@/core/theme';
import { Box, FileViewer, Image, Pressable, Text, useFileViewer, type ViewerFile } from '@/shared/ui';

/** Thumbnails in the strip; the last slot says how many more when there are. */
const SLOTS = 4;
const THUMB_RATIO = 3 / 4;

export interface VaultEntryStripProps {
  title: string;
  /** Every file the vault holds (purged ones count). */
  count: number;
  /** Files that open in the viewer, in vault order. */
  files: readonly ViewerFile[];
  refreshUrl?: RefreshUrl;
  onSeeAll: () => void;
}

const Thumb = memo<{ file: ViewerFile; onOpen: (id: string) => void }>(({ file, onOpen }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const open = useCallback(() => onOpen(file.id), [file.id, onOpen]);
  const styles = useStyles((): Record<'thumb', ViewStyle> => ({ thumb: { aspectRatio: THUMB_RATIO, overflow: 'hidden' } }));
  const Icon = file.kind === 'video' ? Play : FileText;
  return (
    <Pressable
      onPress={open}
      scaleOnPress
      flex={1}
      style={styles.thumb}
      borderRadius="md"
      align="center"
      justify="center"
      bg={file.kind === 'video' ? colors.viewer.backdrop : colors.surface.elevated}
      accessibilityRole="imagebutton"
      accessibilityLabel={t('marketplace.vault.tile.open', { name: file.name })}
    >
      {file.kind === 'image' && file.url ? (
        <Image uri={file.url} width="100%" height="100%" resizeMode="cover" />
      ) : (
        <Icon
          size={sizes.icon.md}
          color={file.kind === 'video' ? colors.viewer.text : colors.icon.secondary}
          fill={file.kind === 'video' ? colors.viewer.text : undefined}
          strokeWidth={iconStroke.regular}
        />
      )}
    </Pressable>
  );
});
Thumb.displayName = 'Thumb';

/**
 * The way into a vault from a deal or campaign page: the first files as a strip (tap = the viewer
 * straight away) and «see all» with the count (the vault itself).
 */
const VaultEntryStripComponent: React.FC<VaultEntryStripProps> = ({ title, count, files, refreshUrl, onSeeAll }) => {
  const { t } = useTranslation();
  const { colors, sizes, isRTL } = useTheme();
  const viewer = useFileViewer(files);
  const styles = useStyles(
    (): Record<'more', ViewStyle> => ({ more: { aspectRatio: THUMB_RATIO } }),
  );
  const overflow = count > SLOTS;
  const shown = files.slice(0, overflow ? SLOTS - 1 : SLOTS);
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <Box gap="md">
      <Box row align="center" justify="space-between">
        <Text variant="title">{title}</Text>
        <Pressable
          onPress={onSeeAll}
          row
          align="center"
          gap="xs"
          minHeight={sizes.iconButton.md}
          accessibilityRole="button"
          accessibilityLabel={t('marketplace.vault.entry.seeAllLabel', { count })}
        >
          <Text variant="buttonSmall" color={colors.interactive.text}>
            {`${t('marketplace.vault.entry.seeAll')} ${formatNumber(count)}`}
          </Text>
          <Chevron size={sizes.icon.sm} color={colors.interactive.text} strokeWidth={iconStroke.regular} />
        </Pressable>
      </Box>
      <Box row gap="sm">
        {shown.map(file => (
          <Thumb key={file.id} file={file} onOpen={viewer.open} />
        ))}
        {overflow ? (
          <Pressable
            onPress={onSeeAll}
            scaleOnPress
            flex={1}
            style={styles.more}
            borderRadius="md"
            align="center"
            justify="center"
            bg={colors.brand.soft}
            accessibilityRole="button"
            accessibilityLabel={t('marketplace.vault.entry.seeAllLabel', { count })}
          >
            <Text variant="title" color={colors.brand.text}>
              {t('marketplace.vault.entry.more', { count: count - shown.length })}
            </Text>
          </Pressable>
        ) : (
          Array.from({ length: SLOTS - shown.length }, (_, slot) => <Box key={slot} flex={1} />)
        )}
      </Box>
      <FileViewer {...viewer.props} refreshUrl={refreshUrl} />
    </Box>
  );
};

export const VaultEntryStrip = memo(VaultEntryStripComponent);
