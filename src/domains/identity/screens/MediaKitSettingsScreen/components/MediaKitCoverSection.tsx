import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, ConfirmSheet, CustomButton, FormSection, Image, Text } from '@/shared/ui';
import type { MediaKitCoverModel } from '../../../hooks/useMediaKitCover';
import { MediaKitCoverFrame } from './MediaKitCoverFrame';

interface MediaKitCoverSectionProps {
  cover: MediaKitCoverModel;
}

/**
 * The cover the creator's pitch page leads with, framed 5:2 like the page so the preview is the
 * result. One photo at a time: pick → see it in the frame → confirm; nothing uploads before that.
 */
const MediaKitCoverSectionComponent: React.FC<MediaKitCoverSectionProps> = ({ cover }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const busy = cover.isUploading || cover.isRemoving;

  return (
    <>
      <FormSection
        title={t('account.mediaKit.settingsScreen.cover.section')}
        description={t('account.mediaKit.settingsScreen.cover.hint')}
      >
        <Box gap="md">
          <MediaKitCoverFrame
            accessible
            accessibilityRole="image"
            accessibilityLabel={t('account.mediaKit.settingsScreen.cover.previewA11y')}
          >
            {cover.previewUri ? (
              <Image uri={cover.previewUri} width="100%" height="100%" resizeMode="cover" />
            ) : (
              <Box flex={1} align="center" justify="center" gap="sm">
                <ImagePlus size={sizes.icon.lg} color={colors.text.secondary} />
                <Text variant="bodySmall" color={colors.text.secondary}>
                  {t('account.mediaKit.settingsScreen.cover.empty')}
                </Text>
              </Box>
            )}
          </MediaKitCoverFrame>

          {cover.isPending ? (
            <>
              <Text variant="caption" color={colors.text.secondary}>
                {t('account.mediaKit.settingsScreen.cover.pendingNote')}
              </Text>
              <Box row gap="md">
                <Box flex={1}>
                  <CustomButton
                    title={t('common.cancel')}
                    variant="ghost"
                    size="md"
                    onPress={cover.onCancelPending}
                    disabled={cover.isUploading}
                  />
                </Box>
                <Box flex={1}>
                  <CustomButton
                    title={t('account.mediaKit.settingsScreen.cover.use')}
                    variant="secondary"
                    size="md"
                    onPress={cover.onUpload}
                    loading={cover.isUploading}
                  />
                </Box>
              </Box>
            </>
          ) : (
            <Box row gap="md">
              <Box flex={1}>
                <CustomButton
                  title={t(
                    cover.hasCover
                      ? 'account.mediaKit.settingsScreen.cover.change'
                      : 'account.mediaKit.settingsScreen.cover.choose',
                  )}
                  variant="secondary"
                  size="md"
                  leftIcon={<ImagePlus />}
                  onPress={cover.onChoose}
                  disabled={busy}
                />
              </Box>
              {cover.hasCover ? (
                <Box flex={1}>
                  <CustomButton
                    title={t('account.mediaKit.settingsScreen.cover.remove')}
                    variant="ghost"
                    size="md"
                    leftIcon={<Trash2 />}
                    onPress={cover.openRemoveSheet}
                    loading={cover.isRemoving}
                    disabled={cover.isUploading}
                  />
                </Box>
              ) : null}
            </Box>
          )}
        </Box>
      </FormSection>
      <ConfirmSheet
        visible={cover.removeSheetVisible}
        onClose={cover.closeRemoveSheet}
        icon={<Trash2 size={sizes.icon.lg} color={colors.text.secondary} />}
        title={t('account.mediaKit.settingsScreen.cover.removeTitle')}
        body={t('account.mediaKit.settingsScreen.cover.removeBody')}
        confirmLabel={t('account.mediaKit.settingsScreen.cover.removeConfirm')}
        onConfirm={cover.confirmRemove}
        cancelLabel={t('common.cancel')}
      />
    </>
  );
};

export const MediaKitCoverSection = memo(MediaKitCoverSectionComponent);
