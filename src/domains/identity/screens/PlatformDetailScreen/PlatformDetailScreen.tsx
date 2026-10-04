import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { PencilLine, SearchX, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import {
  Box,
  ConfirmSheet,
  EmptyState,
  ErrorState,
  Layout,
  LayoutFooter,
  ListGroup,
  ListRow,
  Notice,
  SectionHeader,
} from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import {
  PlatformAccountSheet,
  RatePlatformCard,
  isInfluencerPlatform,
  type PlatformResource,
} from '@/domains/auth';
import { DiscardChangesSheet } from '../../components/DiscardChangesSheet';
import { usePlatformDetailScreen, type PlatformDetailModel } from './hooks/usePlatformDetailScreen';
import { PlatformAccountCard } from './components/PlatformAccountCard';
import { PlatformReviewNotice } from './components/PlatformReviewNotice';
import { PlatformSettingsGroup } from './components/PlatformSettingsGroup';
import { PlatformDetailSkeleton } from './components/PlatformDetailSkeleton';

interface ContentProps {
  vm: PlatformDetailModel;
  platform: PlatformResource;
}

const PlatformRatesSection: React.FC<ContentProps> = memo(({ vm, platform }) => {
  const { t } = useTranslation();
  const { rates } = vm;

  if (rates.isError) {
    return (
      <Notice
        tone="danger"
        message={t('account.profile.detailsError')}
        action={{ label: t('common.retry'), onPress: rates.retry }}
      />
    );
  }
  if (!rates.ready || !isInfluencerPlatform(platform.platform)) return null;

  return (
    <Box gap="md">
      <SectionHeader
        title={t('account.platforms.ratesTitle', { platform: platform.platform_label })}
        subtitle={t('account.platforms.ratesHint')}
      />
      <RatePlatformCard
        variant="rowsOnly"
        control={rates.control}
        platform={platform.platform}
        username={platform.username}
        rows={rates.rows}
        serviceLabel={rates.serviceLabel}
      />
    </Box>
  );
});

const PlatformDetailContent: React.FC<ContentProps> = memo(({ vm, platform }) => {
  const { t } = useTranslation();

  return (
    <Box gap="2xl" pb="xl">
      <PlatformAccountCard
        platform={platform}
        onRefresh={vm.onRefresh}
        isRefreshing={vm.isRefreshing}
        refreshSeconds={vm.refreshSeconds}
      />
      <PlatformReviewNotice platform={platform} onEdit={vm.openEdit} />
      <PlatformSettingsGroup
        platform={platform}
        onToggleAvailable={vm.onToggleAvailable}
        isSettingAvailability={vm.isSettingAvailability}
        onMakePrimary={vm.onMakePrimary}
        isSettingPrimary={vm.isSettingPrimary}
        canMakePrimary={vm.canMakePrimary}
      />
      <PlatformRatesSection vm={vm} platform={platform} />
      <ListGroup tone="danger">
        <ListRow
          icon={Trash2}
          tone="danger"
          title={t('account.platforms.delete')}
          onPress={vm.openDelete}
        />
      </ListGroup>
    </Box>
  );
});

/** Detail archetype: one account, its switches and prices; saving prices is the only primary action. */
const PlatformDetailScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const vm = usePlatformDetailScreen();
  const { platform } = vm;
  useHideBottomBar();

  const body = vm.isLoading ? (
    <PlatformDetailSkeleton />
  ) : vm.isError ? (
    <ErrorState error={vm.error} onRetry={vm.retry} />
  ) : platform ? (
    <PlatformDetailContent vm={vm} platform={platform} />
  ) : vm.isNotFound ? (
    <EmptyState
      icon={SearchX}
      title={t('account.platforms.errors.notFound')}
      action={{ label: t('common.back'), onPress: vm.goBack, variant: 'secondary' }}
    />
  ) : null;

  return (
    <>
      <Layout
        header={{
          title: platform?.platform_label ?? t('account.platforms.title'),
          actions: platform
            ? [{ icon: PencilLine, accessibilityLabel: t('common.edit'), onPress: vm.openEdit }]
            : undefined,
        }}
        footer={
          platform && vm.rates.ready ? (
            <LayoutFooter
              primary={{
                label: t('account.platforms.ratesSave'),
                onPress: vm.saveRates,
                loading: vm.isSavingRates,
              }}
            />
          ) : undefined
        }
      >
        {body}
      </Layout>

      <PlatformAccountSheet {...vm.edit} />
      <ConfirmSheet
        visible={vm.deleteSheet.visible}
        onClose={vm.deleteSheet.onClose}
        icon={<Trash2 size={sizes.icon.lg} color={colors.status.danger.main} />}
        title={t('account.platforms.deleteTitle', { platform: platform?.platform_label ?? '' })}
        body={t('account.platforms.deleteBody')}
        confirmLabel={t('account.platforms.delete')}
        confirmVariant="danger"
        onConfirm={vm.deleteSheet.onConfirm}
        confirmLoading={vm.deleteSheet.loading}
        cancelLabel={t('common.cancel')}
      />
      <DiscardChangesSheet guard={vm.guard} />
    </>
  );
};

export const PlatformDetailScreen = memo(PlatformDetailScreenComponent);
