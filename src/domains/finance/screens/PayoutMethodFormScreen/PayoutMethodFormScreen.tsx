import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchX, Trash2 } from 'lucide-react-native';
import { Box, EmptyState, ErrorState, Layout, LayoutFooter } from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { DiscardSheet } from '../../components/DiscardSheet';
import { PayoutChannelSheet } from '../../components/PayoutChannelSheet';
import { PayoutFormSkeleton } from './components/PayoutFormSkeleton';
import { PayoutChannelCard } from './components/PayoutChannelCard';
import { PayoutDeleteSheet } from './components/PayoutDeleteSheet';
import { PayoutDetailsFields } from './components/PayoutDetailsFields';
import { PayoutExtrasSection } from './components/PayoutExtrasSection';
import { usePayoutMethodFormScreen } from './hooks/usePayoutMethodFormScreen';

/**
 * Detail/form archetype (rule 09): channel card, the channel's details, label + primary
 * switch; saving is the one primary action. Adding opens with ✕; edit has delete in the header.
 */
const PayoutMethodFormScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const vm = usePayoutMethodFormScreen();
  useHideBottomBar();

  const ready = !vm.isLoading && !vm.isError && !vm.isNotFound && vm.channel !== null;
  const body = vm.isLoading ? (
    <PayoutFormSkeleton />
  ) : vm.isError ? (
    <ErrorState error={vm.error} onRetry={vm.retry} retrying={vm.isRetrying} />
  ) : !ready || !vm.channel ? (
    <EmptyState
      icon={SearchX}
      title={t('finance.payouts.form.gone')}
      action={{ label: t('common.back'), onPress: vm.goBack, variant: 'secondary' }}
    />
  ) : (
    <Box gap="3xl" pb="xl">
      <PayoutChannelCard channel={vm.channel} onChange={vm.channelSheet.onOpen} />
      <PayoutDetailsFields vm={vm} />
      <PayoutExtrasSection vm={vm} />
    </Box>
  );

  return (
    <>
      <Layout
        header={{
          title: t(vm.isEdit ? 'finance.payouts.form.editTitle' : 'finance.payouts.form.newTitle'),
          backIcon: vm.isEdit ? 'back' : 'close',
          actions:
            vm.isEdit && ready
              ? [{ icon: Trash2, accessibilityLabel: t('finance.payouts.delete.confirm'), onPress: vm.deleteSheet.onOpen }]
              : undefined,
        }}
        footer={
          ready ? (
            <LayoutFooter
              primary={{
                label: t(vm.isEdit ? 'finance.payouts.form.saveChanges' : 'finance.payouts.form.save'),
                onPress: vm.onSave,
                loading: vm.isSaving,
              }}
            />
          ) : undefined
        }
      >
        {body}
      </Layout>

      {vm.isEdit ? (
        <PayoutDeleteSheet sheet={vm.deleteSheet} />
      ) : (
        <PayoutChannelSheet
          visible={vm.channelSheet.visible}
          onClose={vm.channelSheet.onClose}
          onPick={vm.channelSheet.onPick}
          selected={vm.channel?.value ?? undefined}
        />
      )}
      <DiscardSheet guard={vm.guard} flow="payoutMethod" />
    </>
  );
};

export const PayoutMethodFormScreen = memo(PayoutMethodFormScreenComponent);
