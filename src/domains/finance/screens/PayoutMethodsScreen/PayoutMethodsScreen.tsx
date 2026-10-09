import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WalletCards } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import {
  Box,
  EmptyState,
  ErrorState,
  Layout,
  LayoutFooter,
  ListGroup,
  Notice,
  SectionHeader,
  Text,
} from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { PayoutChannelSheet } from '../../components/PayoutChannelSheet';
import { PayoutMethodRow } from '../../components/PayoutMethodRow';
import { PayoutMethodsSkeleton } from '../../components/PayoutMethodsSkeleton';
import { usePayoutMethodsScreen, type PayoutMethodsScreenModel } from './hooks/usePayoutMethodsScreen';

const SKELETON_ROWS = 3;

const Intro = memo(() => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Box gap="xs">
      <Text variant="h2" accessibilityRole="header">
        {t('finance.payouts.list.heading')}
      </Text>
      <Text variant="body" color={colors.text.secondary}>
        {t('finance.payouts.list.subtitle')}
      </Text>
    </Box>
  );
});

const MethodsList: React.FC<{ vm: PayoutMethodsScreenModel }> = memo(({ vm }) => {
  const { t } = useTranslation();
  return (
    <Box gap="2xl">
      <Intro />
      <Box gap="sm">
        <SectionHeader title={t('finance.payouts.list.saved')} subtitle={vm.countLabel} />
        <ListGroup>
          {vm.views.map(view => (
            <PayoutMethodRow key={view.id} method={view} onPress={vm.openMethod} />
          ))}
        </ListGroup>
      </Box>
      {vm.atLimit ? <Notice tone="warning" message={t('finance.payouts.list.limitReached')} /> : null}
      <Notice tone="info" message={t('finance.payouts.list.sentNotice')} />
    </Box>
  );
});

/** List archetype, at most 10 rows so one grouped card (rule 09); Add opens the channel sheet. */
const PayoutMethodsScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const vm = usePayoutMethodsScreen();
  useHideBottomBar();

  const body = vm.isLoading ? (
    <Box gap="2xl">
      <Intro />
      <PayoutMethodsSkeleton rows={SKELETON_ROWS} />
    </Box>
  ) : vm.isError ? (
    <ErrorState error={vm.error} onRetry={vm.retry} retrying={vm.isRetrying} />
  ) : vm.isEmpty ? (
    <EmptyState
      icon={WalletCards}
      title={t('finance.payouts.list.emptyTitle')}
      message={t('finance.payouts.list.emptyMessage')}
    />
  ) : (
    <MethodsList vm={vm} />
  );

  return (
    <>
      <Layout
        header={{ title: vm.title }}
        scrollProps={{ refreshControl: <RefreshControl refreshing={vm.refreshing} onRefresh={vm.onRefresh} /> }}
        footer={
          vm.canAdd ? (
            <LayoutFooter primary={{ label: t('finance.payouts.list.add'), onPress: vm.openSheet }} />
          ) : undefined
        }
      >
        {body}
      </Layout>
      <PayoutChannelSheet visible={vm.sheetVisible} onClose={vm.closeSheet} onPick={vm.onPickChannel} />
    </>
  );
};

export const PayoutMethodsScreen = memo(PayoutMethodsScreenComponent);
