import React, { memo } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react-native';
import type { UploadFailure } from '@/core/upload';
import { moderateScale, useStyles, useTheme } from '@/core/theme';
import { Box, CustomButton, Image, Pressable, ProgressBar, Text } from '@/shared/ui';
import { useCampaignWizard } from '../CampaignWizardContext';

const COVER_HEIGHT = moderateScale(168);

const FAILURE_KEY = {
  type: 'marketplace.campaign.wizard.idea.cover.errType',
  size: 'marketplace.campaign.wizard.idea.cover.errSize',
  empty: 'marketplace.campaign.wizard.idea.cover.errEmpty',
  slot: 'marketplace.campaign.wizard.idea.cover.failed',
  transfer: 'marketplace.campaign.wizard.idea.cover.failed',
  canceled: 'marketplace.campaign.wizard.idea.cover.failed',
} as const satisfies Record<UploadFailure, ParseKeys>;

/**
 * The campaign's one cover: a dashed invitation while empty, the photo once it has one (change /
 * remove), and, while a new one is on its way, the local photo under a progress scrim so the brand
 * sees it at once. A rejected file says why and offers retry or drop.
 */
const CampaignCoverFieldComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const { cover, pickCover } = useCampaignWizard();
  const { upload, coverUrl, removing } = cover;
  const localUri = upload?.source.uri ?? null;
  const uri = localUri ?? coverUrl;

  const styles = useStyles(
    ({ borderWidths, radii, spacing }): Record<'frame' | 'empty' | 'actions' | 'scrim' | 'status', ViewStyle> => ({
      frame: {
        height: COVER_HEIGHT,
        borderRadius: radii.xl,
        overflow: 'hidden',
        backgroundColor: colors.surface.elevated,
      },
      empty: {
        height: COVER_HEIGHT,
        borderRadius: radii.xl,
        borderWidth: borderWidths.md,
        borderStyle: 'dashed',
        borderColor: colors.border.strong,
        backgroundColor: colors.surface.main,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
      },
      actions: {
        position: 'absolute',
        end: spacing.md,
        bottom: spacing.md,
        flexDirection: 'row',
        gap: spacing.sm,
      },
      scrim: { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, justifyContent: 'flex-end' },
      status: { padding: spacing.lg, gap: spacing.sm },
    }),
    [colors.border.strong, colors.surface.elevated, colors.surface.main],
  );

  if (!uri) {
    return (
      <Pressable
        style={styles.empty}
        scaleOnPress
        onPress={pickCover}
        accessibilityRole="button"
        accessibilityLabel={t('marketplace.campaign.wizard.idea.cover.add')}
      >
        <ImagePlus size={sizes.icon.lg} color={colors.interactive.text} />
        <Text variant="label" color={colors.interactive.text}>
          {t('marketplace.campaign.wizard.idea.cover.add')}
        </Text>
      </Pressable>
    );
  }

  const sending = upload !== null && upload.status !== 'failed';
  const failed = upload?.status === 'failed';

  return (
    <Box style={styles.frame}>
      <Image uri={uri} width="100%" height="100%" />
      {sending ? (
        <Box style={styles.scrim}>
          <LinearGradient colors={colors.gradients.mediaScrim.colors} locations={colors.gradients.mediaScrim.locations} style={StyleSheet.absoluteFill} />
          <Box style={styles.status}>
            <Text variant="label" color={colors.text.onBrand}>
              {t('marketplace.campaign.wizard.idea.cover.uploading')}
            </Text>
            <ProgressBar
              value={upload.status === 'done' ? 1 : upload.progress}
              tone="interactive"
              surface="brand"
              accessibilityLabel={t('marketplace.campaign.wizard.idea.cover.uploading')}
            />
          </Box>
        </Box>
      ) : null}
      {failed ? (
        <Box style={styles.scrim}>
          <LinearGradient colors={colors.gradients.mediaScrim.colors} locations={colors.gradients.mediaScrim.locations} style={StyleSheet.absoluteFill} />
          <Box style={styles.status} accessibilityRole="alert">
            <Text variant="label" color={colors.text.onBrand}>
              {t(FAILURE_KEY[upload.failure ?? 'transfer'])}
            </Text>
            <Box row gap="sm">
              {upload.failure === 'slot' || upload.failure === 'transfer' ? (
                <CustomButton
                  title={t('marketplace.campaign.wizard.idea.cover.retry')}
                  variant="glass"
                  size="sm"
                  leftIcon={<RefreshCw />}
                  onPress={cover.retryUpload}
                />
              ) : null}
              <CustomButton
                title={t('marketplace.campaign.wizard.idea.cover.discard')}
                variant="glass"
                size="sm"
                onPress={cover.discardUpload}
              />
            </Box>
          </Box>
        </Box>
      ) : null}
      {upload === null ? (
        <Box style={styles.actions}>
          <CustomButton
            title={t('marketplace.campaign.wizard.idea.cover.change')}
            variant="glass"
            size="sm"
            leftIcon={<ImagePlus />}
            onPress={pickCover}
          />
          <CustomButton
            title={t('marketplace.campaign.wizard.idea.cover.remove')}
            variant="glass"
            size="sm"
            leftIcon={<Trash2 />}
            loading={removing}
            onPress={cover.removeCover}
          />
        </Box>
      ) : null}
    </Box>
  );
};

export const CampaignCoverField = memo(CampaignCoverFieldComponent);
