import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Ban } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import {
  Box,
  Card,
  ConfirmSheet,
  CustomButton,
  ErrorState,
  InlineError,
  Layout,
  LayoutFooter,
  Notice,
  StaggerIn,
  Timeline,
} from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { ReportLink } from '../../components/ReportLink';
import { DetailRowsCard, WithdrawalDetailSkeleton, WithdrawalHead } from './components/WithdrawalDetailParts';
import { useWithdrawalDetailScreen, type WithdrawalDetailScreenModel } from './hooks/useWithdrawalDetailScreen';

/** Pending: cancel (secondary); returned: check payout methods; always report a problem. */
const RecordFooter = memo<{ vm: WithdrawalDetailScreenModel }>(({ vm }) => {
  const { t } = useTranslation();
  const { view } = vm;
  return (
    <Box px="xl" py="md" gap="sm">
      {view?.canCancel ? (
        <CustomButton title={t('finance.withdraw.detail.cancel')} variant="secondary" onPress={vm.openCancel} />
      ) : null}
      {view?.returned ? (
        <CustomButton title={t('finance.withdraw.detail.reviewMethods')} variant="secondary" onPress={vm.openPayoutMethods} />
      ) : null}
      <ReportLink onPress={vm.onReport} />
    </Box>
  );
});

/**
 * Withdrawal request (Money archetype, receipt): head, transfer timeline, reason, details,
 * amounts. Right after submitting it confirms the request (rises in once): ✕, "Back to
 * wallet" primary, history and cancel.
 */
const WithdrawalDetailScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const vm = useWithdrawalDetailScreen();
  useHideBottomBar();
  const { view } = vm;

  const sections = view
    ? [
        <WithdrawalHead key="head" view={view} />,
        view.reason ? (
          <Notice key="reason" tone={view.reason.tone} title={view.reason.title} message={view.reason.message} />
        ) : null,
        <Card key="timeline" px="lg" py="lg">
          <Timeline steps={view.steps} />
        </Card>,
        <DetailRowsCard key="details" title={t('finance.withdraw.detail.details')} rows={view.details} onCopy={vm.onCopy} />,
        <DetailRowsCard key="amounts" title={t('finance.withdraw.detail.amounts')} rows={view.amounts} onCopy={vm.onCopy} />,
      ]
    : null;

  const body = (() => {
    switch (vm.status) {
      case 'loading':
        return <WithdrawalDetailSkeleton />;
      case 'notFound':
        return <InlineError error={t('finance.withdraw.detail.notFound')} />;
      case 'error':
        return <ErrorState onRetry={vm.retry} />;
      case 'ready':
        return vm.submitted ? <StaggerIn gap="2xl">{sections}</StaggerIn> : <Box gap="2xl">{sections}</Box>;
      default: {
        const _exhaustive: never = vm.status;
        return _exhaustive;
      }
    }
  })();

  const footer = vm.submitted ? (
    <LayoutFooter
      primary={{ label: t('finance.withdraw.detail.backToWallet'), onPress: vm.backToWallet }}
      secondary={{ label: t('finance.withdraw.detail.history'), onPress: vm.openHistory, variant: 'ghost' }}
      tertiary={view?.canCancel ? { label: t('finance.withdraw.detail.cancel'), onPress: vm.openCancel } : undefined}
    />
  ) : vm.status === 'ready' || vm.status === 'notFound' ? (
    <RecordFooter vm={vm} />
  ) : undefined;

  return (
    <Layout
      header={{
        title: t(vm.submitted ? 'finance.withdraw.detail.submittedHeader' : 'finance.withdraw.detail.title'),
        backIcon: vm.submitted ? 'close' : 'back',
        onBackPress: vm.submitted ? vm.backToWallet : undefined,
      }}
      footer={footer}
    >
      {body}
      <ConfirmSheet
        visible={vm.cancelVisible}
        onClose={vm.closeCancel}
        icon={<Ban size={sizes.icon.lg} color={colors.status.danger.main} />}
        title={t('finance.withdraw.detail.cancelTitle')}
        body={t('finance.withdraw.detail.cancelBody')}
        confirmLabel={t('finance.withdraw.detail.cancelConfirm')}
        confirmVariant="danger"
        confirmLoading={vm.isCancelling}
        onConfirm={vm.onConfirmCancel}
        cancelLabel={t('finance.withdraw.detail.cancelKeep')}
      />
    </Layout>
  );
};

export const WithdrawalDetailScreen = memo(WithdrawalDetailScreenComponent);
