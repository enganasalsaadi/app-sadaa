import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, Eye, Lock, RotateCw, Share2, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, CustomButton, LiveDot, Pressable, Text } from '@/shared/ui';
import { MediaKitShareNotice, type MediaKitCardModel } from '@/domains/identity';
import { useCopyFlash } from '../hooks/useCopyFlash';

interface GlassKeyProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Mint with a check: the tap just did its job. */
  done?: boolean;
}

const GlassKey = memo<GlassKeyProps>(({ icon: Icon, label, onPress, disabled = false, done = false }) => {
  const { colors, sizes } = useTheme();
  const Glyph = done ? Check : Icon;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      scaleOnPress
      width={sizes.iconButton.md}
      height={sizes.iconButton.md}
      borderRadius="md"
      bg={done ? colors.glass.iconMoney : colors.glass.badge}
      align="center"
      justify="center"
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Glyph size={sizes.icon.sm} color={done ? colors.glass.onIconInteractive : colors.text.onBrand} />
    </Pressable>
  );
});

interface SharePassProps {
  mediaKit: MediaKitCardModel;
  onOpenPreview: () => void;
}

/**
 * The creator's link, first thing under their name: the address and whether brands can open it,
 * then copy, the brand's-eye preview and share (or «make public» while the kit is private). A
 * failed share explains itself right under it.
 */
const SharePassComponent: React.FC<SharePassProps> = ({ mediaKit, onOpenPreview }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { share, status, isPublic, linkLabel } = mediaKit;
  const { flashing, copy } = useCopyFlash(share.onCopy);

  if (status === 'error') {
    return (
      <Pressable
        row
        align="center"
        gap="md"
        p="md"
        minHeight={sizes.button.xl}
        borderRadius="lg"
        bg={colors.glass.fill}
        borderWidth="thin"
        borderColor={colors.glass.border}
        onPress={mediaKit.onRetry}
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.creatorHome.storefront.pass.linkFailed')}
      >
        <Box flex={1}>
          <Text variant="bodySmall" color={colors.text.onBrandMuted} numberOfLines={2}>
            {t('marketplace.creatorHome.storefront.pass.linkFailed')}
          </Text>
        </Box>
        <RotateCw size={sizes.icon.sm} color={colors.text.onBrand} />
      </Pressable>
    );
  }

  const loading = status === 'loading';
  const isPrivate = isPublic === false;
  const busy = share.isSharing || share.isMakingPublic;

  return (
    <Box gap="sm">
      <Box
        row
        align="center"
        gap="sm"
        p="sm"
        ps="md"
        borderRadius="lg"
        bg={colors.glass.fill}
        borderWidth="thin"
        borderColor={colors.glass.border}
      >
        {isPrivate ? (
          <Box
            width={sizes.iconButton.sm}
            height={sizes.iconButton.sm}
            borderRadius="sm"
            bg={colors.glass.badge}
            align="center"
            justify="center"
          >
            <Lock size={sizes.icon.xs} color={colors.text.onBrand} />
          </Box>
        ) : null}
        <Box flex={1} gap="xs">
          <Text
            variant="bodyMedium"
            color={isPrivate ? colors.text.onBrandMuted : colors.text.onBrand}
            numberOfLines={1}
          >
            {linkLabel ?? t('marketplace.creatorHome.hero.linkLoading')}
          </Text>
          {loading ? null : (
            <Box row align="center" gap="xs">
              {isPrivate ? null : <LiveDot color={colors.glass.iconMoney} />}
              <Text variant="caption" color={colors.text.onBrandMuted} numberOfLines={1}>
                {t(isPrivate ? 'marketplace.creatorHome.hero.linkPrivate' : 'marketplace.creatorHome.hero.linkPublic')}
              </Text>
            </Box>
          )}
        </Box>
        {isPrivate ? null : (
          <GlassKey
            icon={Copy}
            label={t(flashing ? 'marketplace.creatorHome.hero.copiedA11y' : 'marketplace.creatorHome.hero.copyA11y')}
            onPress={copy}
            disabled={!share.isReady || busy}
            done={flashing}
          />
        )}
        <GlassKey icon={Eye} label={t('marketplace.creatorHome.hero.previewA11y')} onPress={onOpenPreview} />
        {isPrivate ? (
          <CustomButton
            title={t('account.mediaKit.share.makePublic')}
            variant="onBrand"
            size="md"
            px="lg"
            onPress={share.onMakePublic}
            loading={share.isMakingPublic}
          />
        ) : (
          <CustomButton
            title={t('marketplace.creatorHome.hero.share')}
            variant="onBrand"
            size="md"
            px="lg"
            leftIcon={<Share2 />}
            onPress={share.onShare}
            loading={share.isSharing}
            disabled={loading || !share.isReady || share.isMakingPublic}
            accessibilityLabel={t('marketplace.creatorHome.hero.shareA11y')}
          />
        )}
      </Box>
      {share.error ? (
        <MediaKitShareNotice
          error={share.error}
          canRetry={share.canRetry}
          onMakePublic={share.onMakePublic}
          onRetry={share.onRetry}
          onDismiss={share.onDismissError}
        />
      ) : null}
    </Box>
  );
};

export const SharePass = memo(SharePassComponent);
