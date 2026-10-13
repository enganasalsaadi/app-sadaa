import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Eye, Share2, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, Pressable, Text } from '@/shared/ui';
import { MediaKitShareNotice, type MediaKitCardModel } from '@/domains/identity';

const SideKey = memo<{ icon: LucideIcon; label: string; onPress: () => void; disabled?: boolean }>(
  ({ icon: Icon, label, onPress, disabled = false }) => {
    const { colors, sizes } = useTheme();
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        scaleOnPress
        width={sizes.button.lg}
        height={sizes.button.lg}
        borderRadius="md"
        bg={colors.interactive.soft}
        align="center"
        justify="center"
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
      >
        <Icon size={sizes.icon.md} color={colors.interactive.main} />
      </Pressable>
    );
  },
);

interface ShareBarProps {
  mediaKit: MediaKitCardModel;
  onOpenPreview: () => void;
}

/**
 * Under "who's looking": share the storefront link (the screen's one primary), with copy and
 * the brand's-eye preview as soft teal keys beside it. A failed share explains itself right
 * under it; a kit nobody opened yet gets a nudge instead.
 */
const ShareBarComponent: React.FC<ShareBarProps> = ({ mediaKit, onOpenPreview }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { share, status, noActivity } = mediaKit;
  const loading = status === 'loading';
  const shareBlocked = loading || !share.isReady || share.isMakingPublic;

  return (
    <Box gap="md">
      <Box row gap="sm" align="center">
        <Box flex={1}>
          <CustomButton
            title={t('marketplace.creatorHome.storefront.share')}
            variant="primary"
            size="lg"
            leftIcon={<Share2 />}
            onPress={share.onShare}
            loading={share.isSharing}
            disabled={shareBlocked}
            fullWidth
          />
        </Box>
        <SideKey
          icon={Copy}
          label={t('account.mediaKit.share.copy')}
          onPress={share.onCopy}
          disabled={!share.isReady || share.isSharing}
        />
        <SideKey icon={Eye} label={t('account.mediaKit.preview')} onPress={onOpenPreview} />
      </Box>
      {share.error ? (
        <MediaKitShareNotice
          error={share.error}
          canRetry={share.canRetry}
          onMakePublic={share.onMakePublic}
          onRetry={share.onRetry}
          onDismiss={share.onDismissError}
        />
      ) : noActivity ? (
        <Text variant="caption" color={colors.text.secondary} align="center">
          {t('account.mediaKit.noActivity')}
        </Text>
      ) : null}
    </Box>
  );
};

export const ShareBar = memo(ShareBarComponent);
