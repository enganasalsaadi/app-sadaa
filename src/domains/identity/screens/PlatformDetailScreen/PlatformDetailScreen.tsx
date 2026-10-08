import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleDollarSign, PencilLine, SearchX, Trash2 } from 'lucide-react-native';
import { formatNumber } from '@/core/i18n';
import { useTheme } from '@/core/theme';
import {
  Box,
  ConfirmSheet,
  EmptyState,
  ErrorState,
  Layout,
  ListGroup,
  ListRow,
  Notice,
} from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { PlatformAccountSheet, type PlatformResource } from '@/domains/auth';
import { usePlatformDetailScreen, type PlatformDetailModel } from './hooks/usePlatformDetailScreen';
import { PlatformAccountCard } from './components/PlatformAccountCard';
import { PlatformReviewNotice } from './components/PlatformReviewNotice';
import { PlatformSettingsGroup } from './components/PlatformSettingsGroup';
import { PlatformDetailSkeleton } from './components/PlatformDetailSkeleton';

interface ContentProps {
  vm: PlatformDetailModel;
  platform: PlatformResource;
}

/** Prices live on the rates screen: a nudge while this platform has none, else a count. */
const PlatformRatesRow: React.FC<ContentProps> = memo(({ vm, platform }) => {
  const { t } = useTranslation();
  const { count, open } = vm.rates;

  if (count === null) return null;
  if (count === 0) {
    return (
      <Notice
        tone="warning"
        icon={CircleDollarSign}
        title={t('account.rates.notice.title')}
        message={t('account.platforms.ratesEmpty', { platform: platform.platform_label })}
        action={{ label: t('account.rates.notice.action'), onPress: open }}
      />
    );
  }
  return (
    <ListGroup>
      <ListRow
        icon={CircleDollarSign}
        title={t('account.platforms.ratesRow', { platform: platform.platform_label })}
        value={formatNumber(count)}
        onPress={open}
      />
    </ListGroup>
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
      <PlatformRatesRow vm={vm} platform={platform} />
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

/** Detail archetype: one account, its switches and a link to its prices. */
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
    </>
  );
};

export const PlatformDetailScreen = memo(PlatformDetailScreenComponent);
