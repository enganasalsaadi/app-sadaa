import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Settings2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { Box, ErrorState, Layout, LayoutFooter, Notice } from '@/shared/ui';
import { MediaKitShareNotice } from '../../components/MediaKitCard/MediaKitShareNotice';
import { MediaKitPreview, MediaKitPreviewSkeleton } from '../../components/MediaKitPreview';
import { useMediaKitPreviewScreen } from './hooks/useMediaKitPreviewScreen';

/**
 * "Preview as brand" (Detail archetype, plan §Screens): the media kit as brands
 * see it, a hidden-kit warning with "Make public", settings in the header and
 * Share as the one primary.
 */
const MediaKitPreviewScreenComponent: React.FC = () => {
  useHideBottomBar();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useMediaKitPreviewScreen();
  const { share } = vm;

  const renderBody = () => {
    if (vm.status === 'error') {
      return (
        <ErrorState
          title={t('account.mediaKit.loadFailed')}
          error={vm.error}
          onRetry={vm.onRetry}
        />
      );
    }
    if (vm.status === 'loading' || !vm.preview) {
      return <MediaKitPreviewSkeleton />;
    }
    return (
      <Box gap="2xl">
        {vm.isPublic ? (
          <Notice tone="info" message={t('account.mediaKit.previewScreen.intro')} />
        ) : (
          <Notice
            tone="warning"
            title={t('account.mediaKit.share.privateTitle')}
            message={t('account.mediaKit.share.privateBody')}
            action={
              share.isMakingPublic
                ? undefined
                : { label: t('account.mediaKit.share.makePublic'), onPress: share.onMakePublic }
            }
          />
        )}
        <MediaKitPreview
          preview={vm.preview}
          nicheLabels={vm.nicheLabels}
          rateRows={vm.rateRows}
        />
      </Box>
    );
  };

  return (
    <Layout
      header={{
        title: t('account.mediaKit.previewScreen.title'),
        actions: [
          {
            icon: Settings2,
            accessibilityLabel: t('account.mediaKit.settingsScreen.title'),
            onPress: vm.openSettings,
          },
        ],
      }}
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.onRefresh}
            tintColor={colors.interactive.main}
          />
        ),
      }}
      footer={
        vm.status === 'ready' ? (
          <LayoutFooter
            top={
              share.error ? (
                <MediaKitShareNotice
                  error={share.error}
                  canRetry={share.canRetry}
                  onMakePublic={share.onMakePublic}
                  onRetry={share.onRetry}
                  onDismiss={share.onDismissError}
                />
              ) : undefined
            }
            primary={{
              label: t('account.mediaKit.share.cta'),
              onPress: share.onShare,
              loading: share.isSharing,
              disabled: !share.isReady || share.isMakingPublic,
            }}
          />
        ) : undefined
      }
    >
      {renderBody()}
    </Layout>
  );
};

export const MediaKitPreviewScreen = memo(MediaKitPreviewScreenComponent);
