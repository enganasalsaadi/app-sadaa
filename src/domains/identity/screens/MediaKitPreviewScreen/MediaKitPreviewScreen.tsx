import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Settings2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { ErrorState, Layout, LayoutFooter, Notice } from '@/shared/ui';
import { MediaKitShareNotice } from '../../components/MediaKitShare';
import {
  MediaKitHeaderBar,
  MediaKitShowcaseBody,
  MediaKitShowcaseBodySkeleton,
  MediaKitStage,
  MediaKitStageSkeleton,
} from '../../components/MediaKitShowcase';
import { useMediaKitPreviewScreen, type MediaKitPreviewScreenModel } from './hooks/useMediaKitPreviewScreen';

const PreviewIntro = memo<{ vm: MediaKitPreviewScreenModel }>(({ vm }) => {
  const { t } = useTranslation();
  const { share } = vm;
  if (vm.isPublic) {
    return <Notice tone="info" message={t('account.mediaKit.previewScreen.intro')} />;
  }
  return (
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
  );
});

const ShareFooter = memo<{ vm: MediaKitPreviewScreenModel }>(({ vm }) => {
  const { t } = useTranslation();
  const { share } = vm;
  return (
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
  );
});

/**
 * "Preview as brand": the same stage and sections brands see, read-only, with the hidden-kit
 * warning above the first section, settings in the header and Share as the one primary. No
 * heart: the server never offers shortlisting on the creator's own kit.
 */
const MediaKitPreviewScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useMediaKitPreviewScreen();
  const { preview } = vm;

  const settingsAction = {
    icon: Settings2,
    accessibilityLabel: t('account.mediaKit.settingsScreen.title'),
    onPress: vm.openSettings,
  };

  if (vm.status === 'error') {
    return (
      <Layout header={{ title: t('account.mediaKit.previewScreen.title'), actions: [settingsAction] }}>
        <ErrorState title={t('account.mediaKit.loadFailed')} error={vm.error} onRetry={vm.onRetry} />
      </Layout>
    );
  }

  const ready = vm.status === 'ready' && preview !== undefined;

  return (
    <Layout
      padding="none"
      statusBar="light"
      headerBehavior="overlay"
      heroBackdrop="brandOpen"
      header={{
        title: t('account.mediaKit.previewScreen.title'),
        variant: 'brand',
        leading: preview ? <MediaKitHeaderBar kit={preview} /> : undefined,
        actions: [{ ...settingsAction, glass: true }],
      }}
      hero={ready ? <MediaKitStage kit={preview} nicheLabels={vm.nicheLabels} /> : <MediaKitStageSkeleton />}
      footer={ready ? <ShareFooter vm={vm} /> : undefined}
      // The stage shows whole on arrival; the footer slides in once the visitor scrolls.
      footerBehavior="reveal"
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.onRefresh}
            tintColor={colors.text.onBrand}
          />
        ),
      }}
    >
      {ready ? (
        <MediaKitShowcaseBody
          kit={preview}
          metrics={vm.metrics}
          services={vm.services}
          selectable={false}
          intro={<PreviewIntro vm={vm} />}
        />
      ) : (
        <MediaKitShowcaseBodySkeleton />
      )}
    </Layout>
  );
};

export const MediaKitPreviewScreen = memo(MediaKitPreviewScreenComponent);
