import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Share2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Card, CustomButton, IconButton, Notice, Skeleton, Text } from '@/shared/ui';
import type { PublicMediaKit } from '../../types/mediaKit';
import { formatLinkLabel } from '../../utils/mediaKitCard';
import { MediaKitCardIdentity } from './MediaKitCardIdentity';
import { MediaKitCardLink } from './MediaKitCardLink';
import { MediaKitCardStats } from './MediaKitCardStats';
import { MediaKitShareNotice } from './MediaKitShareNotice';
import type { MediaKitCardShare, MediaKitCardStats as MediaKitCardStatsModel, MediaKitCardStatus } from './types';

export interface MediaKitCardProps {
  status: MediaKitCardStatus;
  preview?: PublicMediaKit;
  /** Absolute `public_url` from the server, shown without its protocol. */
  link?: string;
  /** Already localised from the niche lookup, capped to three. */
  nicheLabels: readonly string[];
  stats: MediaKitCardStatsModel;
  share: MediaKitCardShare;
  onRetry: () => void;
  onRetryStats: () => void;
  /** Hidden until the destination screen exists. */
  onOpenInsights?: () => void;
  onOpenPreview?: () => void;
}

/**
 * The creator's media kit on Home: who brands see, how it is doing, and the one
 * Share action. Presentational: `useMediaKitCard` supplies the data and triggers.
 */
const MediaKitCardComponent: React.FC<MediaKitCardProps> = ({
  status,
  preview,
  link,
  nicheLabels,
  stats,
  share,
  onRetry,
  onRetryStats,
  onOpenInsights,
  onOpenPreview,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  if (status === 'loading') {
    return (
      <Card shadow="none" p="lg" accessibilityLabel={t('account.mediaKit.title')}>
        <Box gap="lg">
          <Box row align="center" gap="md">
            <Skeleton width={sizes.avatar.lg} height={sizes.avatar.lg} borderRadius="full" />
            <Box flex={1} gap="sm">
              <Skeleton width="60%" height={sizes.icon.md} borderRadius="sm" />
              <Skeleton width="40%" height={sizes.icon.sm} borderRadius="sm" />
            </Box>
          </Box>
          <MediaKitCardStats status="loading" tiles={[]} onRetry={onRetryStats} />
          <Skeleton width="100%" height={sizes.button.lg} borderRadius="md" />
        </Box>
      </Card>
    );
  }

  if (status === 'error' || !preview) {
    return (
      <Notice
        tone="danger"
        title={t('account.mediaKit.title')}
        message={t('account.mediaKit.loadFailed')}
        action={{ label: t('account.mediaKit.retry'), onPress: onRetry }}
      />
    );
  }

  return (
    <Card shadow="none" p="lg" accessibilityLabel={t('account.mediaKit.title')}>
      <Box gap="lg">
        <MediaKitCardIdentity preview={preview} nicheLabels={nicheLabels} />

        <MediaKitCardStats {...stats} onRetry={onRetryStats} />

        {link ? (
          <Box
            row
            align="center"
            gap="sm"
            ps="md"
            borderRadius="md"
            borderWidth="thin"
            borderColor={colors.border.default}
            bg={colors.surface.elevated}
          >
            <Box flex={1}>
              <Text
                variant="bodySmall"
                color={colors.text.secondary}
                numberOfLines={1}
                accessibilityLabel={t('account.mediaKit.linkLabel')}
              >
                {formatLinkLabel(link)}
              </Text>
            </Box>
            <IconButton
              icon={Copy}
              variant="ghost"
              accessibilityLabel={t('account.mediaKit.share.copy')}
              onPress={share.onCopy}
              disabled={!share.isReady || share.isSharing}
            />
          </Box>
        ) : null}

        {share.error ? (
          <MediaKitShareNotice
            error={share.error}
            canRetry={share.canRetry}
            onMakePublic={share.onMakePublic}
            onRetry={share.onRetry}
            onDismiss={share.onDismissError}
          />
        ) : null}

        <CustomButton
          title={t('account.mediaKit.share.cta')}
          leftIcon={<Share2 />}
          onPress={share.onShare}
          loading={share.isSharing}
          disabled={!share.isReady || share.isMakingPublic}
          fullWidth
        />

        {onOpenInsights || onOpenPreview ? (
          <Box row align="center" justify="space-between">
            {onOpenInsights ? (
              <MediaKitCardLink label={t('account.mediaKit.insights')} onPress={onOpenInsights} />
            ) : null}
            {onOpenPreview ? (
              <MediaKitCardLink label={t('account.mediaKit.preview')} onPress={onOpenPreview} />
            ) : null}
          </Box>
        ) : null}
      </Box>
    </Card>
  );
};

export const MediaKitCard = memo(MediaKitCardComponent);
