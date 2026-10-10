import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, ErrorState, InlineError, Layout, LayoutFooter, Skeleton } from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import {
  useSettingsVerificationFlow,
  useVerificationChrome,
  useWizardVerificationFlow,
  type VerificationFlow,
} from '../../hooks/useVerificationFlow';
import { DomainEmailForm } from './components/DomainEmailForm';
import { DomainEmailSent } from './components/DomainEmailSent';
import {
  useDomainEmailScreen,
  type DomainEmailScreenModel,
} from './hooks/useDomainEmailScreen';

const DomainEmailSkeleton: React.FC = memo(() => {
  const { sizes } = useTheme();
  return (
    <Box gap="xl">
      <Skeleton width="60%" height={sizes.button.sm} borderRadius="md" />
      <Skeleton width="100%" height={sizes.button.lg} borderRadius="md" />
      <Skeleton width="100%" height={sizes.button.lg} borderRadius="md" />
      <Skeleton width="100%" height={sizes.button.lg * 2} borderRadius="lg" />
    </Box>
  );
});

const DomainEmailFooter: React.FC<{ vm: DomainEmailScreenModel; flow: VerificationFlow }> = memo(
  ({ vm, flow }) => {
    const { t } = useTranslation();
    switch (vm.mode) {
      case 'form':
        return (
          <LayoutFooter
            primary={{
              label: vm.form.submitLabel,
              onPress: vm.form.onSubmit,
              loading: vm.form.isSubmitting,
              disabled: vm.form.isRateLimited,
            }}
          />
        );
      case 'sent':
        return vm.sent ? (
          <LayoutFooter
            // Registration doesn't wait for the link: the status follows in the background.
            primary={
              flow.onContinue
                ? {
                    label: t('account.verification.picker.onboardingContinue'),
                    onPress: flow.onContinue,
                    loading: flow.isContinuing,
                  }
                : {
                    label: t('account.verification.domain.sent.refresh'),
                    onPress: vm.sent.onCheckAgain,
                    loading: vm.sent.isChecking,
                  }
            }
            secondary={{
              label: vm.sent.resendLabel,
              onPress: vm.sent.onResend,
              loading: vm.sent.isResending,
              disabled: vm.sent.resendDisabled,
            }}
            tertiary={{
              label: t('account.verification.domain.sent.change'),
              onPress: vm.sent.onChange,
            }}
          />
        ) : null;
      case 'expired':
        return vm.sent ? (
          <LayoutFooter
            primary={{
              label: vm.sent.newLinkLabel,
              onPress: vm.sent.onResend,
              loading: vm.sent.isResending,
              disabled: vm.sent.resendDisabled,
            }}
            secondary={{
              label: t('account.verification.domain.sent.change'),
              onPress: vm.sent.onChange,
            }}
          />
        ) : null;
      case 'loading':
      case 'error':
        return null;
      default: {
        const _exhaustive: never = vm.mode;
        return _exhaustive;
      }
    }
  },
);

/** Domain email (route 3), Detail archetype: form, check your inbox, or link expired. */
const DomainEmailView: React.FC<{ flow: VerificationFlow }> = memo(({ flow }) => {
  const { t } = useTranslation();
  const vm = useDomainEmailScreen(flow);
  const chrome = useVerificationChrome(flow, {
    title: t('account.verification.domain.title'),
    onBack: vm.onBack,
  });

  const body =
    vm.mode === 'loading' ? (
      <DomainEmailSkeleton />
    ) : vm.mode === 'error' ? (
      <ErrorState error={vm.loadError} onRetry={vm.retry} retrying={vm.isRetrying} />
    ) : vm.mode === 'form' ? (
      <DomainEmailForm form={vm.form} />
    ) : vm.sent ? (
      <DomainEmailSent sent={vm.sent} expired={vm.mode === 'expired'} />
    ) : null;

  return (
    <Layout
      {...chrome}
      footer={
        vm.mode === 'loading' || vm.mode === 'error' ? undefined : (
          <DomainEmailFooter vm={vm} flow={flow} />
        )
      }
    >
      <Box pb="xl" gap="xl">
        {body}
        <InlineError error={flow.error} />
      </Box>
    </Layout>
  );
});

/** Settings stack, under the picker. */
export const DomainEmailScreen: React.FC = memo(() => {
  useHideBottomBar();
  return <DomainEmailView flow={useSettingsVerificationFlow()} />;
});

/** Brand registration step 4 (injected into the wizard by the app). */
export const BrandDomainEmailScreen: React.FC = memo(() => (
  <DomainEmailView flow={useWizardVerificationFlow()} />
));
