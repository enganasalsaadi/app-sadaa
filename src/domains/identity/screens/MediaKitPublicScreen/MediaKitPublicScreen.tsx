import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { UserX } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { EmptyState, ErrorState, Layout } from '@/shared/ui';
import { MediaKitPreview, MediaKitPreviewSkeleton } from '../../components/MediaKitPreview';
import { PriceLockFooter } from './components/PriceLockFooter';
import { useMediaKitPublicScreen } from './hooks/useMediaKitPublicScreen';

/**
 * A creator's public profile (Detail archetype), shown over the tabs or Login.
 * Footer only while prices are locked (verify / sign-in step); offers join once they ship.
 */
const MediaKitPublicScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useMediaKitPublicScreen();

  const renderBody = () => {
    switch (vm.status) {
      case 'not_found':
        return (
          <EmptyState
            icon={UserX}
            title={t('account.mediaKit.publicScreen.notFoundTitle')}
            message={t('account.mediaKit.publicScreen.notFoundBody')}
            action={{ label: t('account.mediaKit.publicScreen.back'), onPress: vm.onBack }}
          />
        );
      case 'error':
        return (
          <ErrorState
            title={t('account.mediaKit.publicScreen.loadFailed')}
            error={vm.error}
            onRetry={vm.onRetry}
          />
        );
      case 'ready':
        return vm.kit ? (
          <MediaKitPreview preview={vm.kit} nicheLabels={vm.nicheLabels} rateRows={vm.rateRows} />
        ) : null;
      case 'loading':
        return <MediaKitPreviewSkeleton />;
      default: {
        const _exhaustive: never = vm.status;
        return _exhaustive;
      }
    }
  };

  return (
    <Layout
      header={{ title: t('account.mediaKit.publicScreen.title') }}
      footer={
        vm.status === 'ready' && vm.priceLock ? (
          <PriceLockFooter notice={vm.priceLock} onAction={vm.onPriceLockAction} />
        ) : undefined
      }
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.onRefresh}
            tintColor={colors.interactive.main}
          />
        ),
      }}
    >
      {renderBody()}
    </Layout>
  );
};

export const MediaKitPublicScreen = memo(MediaKitPublicScreenComponent);
