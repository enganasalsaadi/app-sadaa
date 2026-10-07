import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Eye, EyeOff, Globe, IdCard, Link2, Share2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import {
  Box,
  Card,
  CustomButton,
  IconButton,
  Notice,
  Skeleton,
  StatusPill,
  Text,
} from '@/shared/ui';
import { formatLinkLabel } from '../../utils/mediaKitCard';
import { MediaKitShareNotice } from './MediaKitShareNotice';
import type { MediaKitCardShare, MediaKitCardStatus } from './types';

export interface MediaKitCardProps {
  status: MediaKitCardStatus;
  /** Absolute `public_url` from the server, shown without its protocol. */
  link?: string;
  /** `null` until the kit has loaded. */
  isPublic: boolean | null;
  /** Nobody opened the kit in the last 30 days: the subtitle nudges a first share. */
  noActivity: boolean;
  share: MediaKitCardShare;
  onRetry: () => void;
  /** Hidden until the destination screen exists. */
  onOpenPreview?: () => void;
}

/**
 * The creator's media kit on Home, reduced to its one job: share the link. Who the
 * creator is and how the kit performs live in the Home hero. Presentational:
 * `useMediaKitCard` supplies the data and triggers.
 */
const MediaKitCardComponent: React.FC<MediaKitCardProps> = ({
  status,
  link,
  isPublic,
  noActivity,
  share,
  onRetry,
  onOpenPreview,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();

  if (status === 'error') {
    return (
      <Notice
        tone="danger"
        title={t('account.mediaKit.title')}
        message={t('account.mediaKit.loadFailed')}
        action={{ label: t('account.mediaKit.retry'), onPress: onRetry }}
      />
    );
  }

  const loading = status === 'loading';

  return (
    <Card shadow="none" p="lg" accessibilityLabel={t('account.mediaKit.title')}>
      <Box gap="lg">
        <Box row align="center" gap="md">
          <Box
            width={sizes.iconButton.md}
            height={sizes.iconButton.md}
            borderRadius="md"
            bg={colors.interactive.soft}
            align="center"
            justify="center"
          >
            <IdCard size={sizes.icon.md} color={colors.interactive.main} />
          </Box>
          <Box flex={1} gap="xs">
            <Text variant="title" numberOfLines={1}>
              {t('account.mediaKit.title')}
            </Text>
            <Text variant="caption" color={colors.text.secondary} numberOfLines={2}>
              {t(noActivity ? 'account.mediaKit.noActivity' : 'account.mediaKit.subtitle')}
            </Text>
          </Box>
          {isPublic === null ? null : (
            <StatusPill
              label={t(isPublic ? 'account.mediaKit.visibility.public' : 'account.mediaKit.visibility.hidden')}
              tone={isPublic ? 'success' : 'neutral'}
              icon={isPublic ? Globe : EyeOff}
              size="sm"
            />
          )}
        </Box>

        {loading ? (
          <Skeleton width="100%" height={sizes.input.md} borderRadius="md" />
        ) : link ? (
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
            <Link2 size={sizes.icon.sm} color={colors.icon.secondary} />
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

        <Box row gap="sm">
          <Box flex={1}>
            <CustomButton
              title={t('account.mediaKit.share.cta')}
              size="md"
              leftIcon={<Share2 />}
              onPress={share.onShare}
              loading={share.isSharing}
              disabled={loading || !share.isReady || share.isMakingPublic}
              fullWidth
            />
          </Box>
          {onOpenPreview ? (
            <CustomButton
              title={t('account.mediaKit.preview')}
              size="md"
              variant="secondary"
              leftIcon={<Eye />}
              onPress={onOpenPreview}
              disabled={loading}
            />
          ) : null}
        </Box>
      </Box>
    </Card>
  );
};

export const MediaKitCard = memo(MediaKitCardComponent);
