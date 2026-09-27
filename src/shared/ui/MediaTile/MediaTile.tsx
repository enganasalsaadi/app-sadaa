import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Film, ImageIcon, Play, RefreshCw } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { iconStroke, useStyles, useTheme } from '@/core/theme';
import type { HueTone } from '@/core/theme';
import { Box } from '../primitives/Box';
import { Image } from '../primitives/Image';
import { Pressable } from '../primitives/Pressable';
import { Text } from '../primitives/Text';
import { IconButton } from '../IconButton';
import { ProgressBar } from '../ProgressBar';
import { StatusPill } from '../StatusPill';

export type MediaKind = 'image' | 'video';

export type MediaTileUpload =
  | { state: 'uploading'; /** 0–1 */ progress: number }
  | { state: 'failed'; onRetry: () => void };

/** Review state shown on the tile (approved, changes requested). Always has a label (rule 08). */
export interface MediaTileStatus {
  label: string;
  tone: HueTone;
  icon?: LucideIcon;
}

export interface MediaTileProps {
  /** Sized thumbnail from the API, never the full-res original (rule 05). */
  uri?: string;
  kind?: MediaKind;
  durationSeconds?: number;
  /** Width / height. Default 1 (square grid). */
  aspectRatio?: number;
  upload?: MediaTileUpload;
  status?: MediaTileStatus;
  /** Opens the viewer (`GalleryModal`). */
  onPress?: () => void;
  accessibilityLabel: string;
}

const formatDuration = (seconds: number): string => {
  const total = Math.max(0, Math.round(seconds));
  return `${formatNumber(Math.floor(total / 60))}:${formatNumber(total % 60, { minimumIntegerDigits: 2 })}`;
};

/** Photo or video thumbnail for drafts, portfolios and proofs, with upload and review states. */
const MediaTileComponent: React.FC<MediaTileProps> = ({
  uri,
  kind = 'image',
  durationSeconds,
  aspectRatio = 1,
  upload,
  status,
  onPress,
  accessibilityLabel,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const styles = useStyles(
    ({ spacing }) => ({
    placeholder: { width: '100%' as const, aspectRatio },
    fill: { position: 'absolute' as const, top: 0, bottom: 0, start: 0, end: 0 },
    topStart: { position: 'absolute' as const, top: spacing.sm, start: spacing.sm },
    bottomStart: { position: 'absolute' as const, bottom: spacing.sm, start: spacing.sm },
    bottomBar: { position: 'absolute' as const, bottom: spacing.sm, start: spacing.sm, end: spacing.sm },
    }),
    [aspectRatio],
  );
  const Placeholder = kind === 'video' ? Film : ImageIcon;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      width="100%"
      borderRadius="lg"
      overflow="hidden"
      bg={colors.surface.elevated}
      accessibilityRole={onPress ? 'imagebutton' : 'image'}
      accessibilityLabel={accessibilityLabel}
    >
      {uri ? (
        <Image uri={uri} width="100%" aspectRatio={aspectRatio} resizeMode="cover" />
      ) : (
        <Box style={styles.placeholder} align="center" justify="center">
          <Placeholder size={sizes.icon.lg} color={colors.icon.secondary} strokeWidth={iconStroke.thin} />
        </Box>
      )}

      {kind === 'video' && !upload ? (
        <Box style={styles.bottomStart} row align="center" gap="xs" px="sm" py="xs" borderRadius="sm" bg={colors.overlay}>
          <Play size={sizes.icon.xs} color={colors.text.onBrand} fill={colors.text.onBrand} />
          {durationSeconds !== undefined ? (
            <Text variant="caption" color={colors.text.onBrand}>
              {formatDuration(durationSeconds)}
            </Text>
          ) : null}
        </Box>
      ) : null}

      {status && !upload ? (
        <Box style={styles.topStart}>
          <StatusPill size="sm" label={status.label} tone={status.tone} icon={status.icon} />
        </Box>
      ) : null}

      {upload?.state === 'uploading' ? (
        <Box style={styles.fill} bg={colors.overlay} align="center" justify="center">
          <Text variant="bodyMedium" color={colors.text.onBrand}>
            {formatNumber(upload.progress, { style: 'percent', maximumFractionDigits: 0 })}
          </Text>
          <Box style={styles.bottomBar}>
            <ProgressBar value={upload.progress} accessibilityLabel={t('common.media.uploading')} />
          </Box>
        </Box>
      ) : null}

      {upload?.state === 'failed' ? (
        <Box style={styles.fill} bg={colors.overlay} align="center" justify="center" gap="sm" p="sm">
          <Box row align="center" gap="xs">
            <AlertCircle size={sizes.icon.sm} color={colors.text.onBrand} />
            <Text variant="caption" color={colors.text.onBrand}>
              {t('common.media.failed')}
            </Text>
          </Box>
          <IconButton
            icon={RefreshCw}
            variant="overlay"
            onPress={upload.onRetry}
            accessibilityLabel={t('common.media.retry')}
          />
        </Box>
      ) : null}
    </Pressable>
  );
};

export const MediaTile = memo(MediaTileComponent);
