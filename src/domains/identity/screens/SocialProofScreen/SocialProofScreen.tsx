import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import {
  Box,
  ConfirmSheet,
  ErrorState,
  InlineError,
  Layout,
  LayoutFooter,
  Skeleton,
} from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import {
  useSettingsVerificationFlow,
  useVerificationChrome,
  useWizardVerificationFlow,
  type VerificationFlow,
} from '../../hooks/useVerificationFlow';
import { SocialProofCode } from './components/SocialProofCode';
import { SocialProofForm } from './components/SocialProofForm';
import { SocialProofRejected } from './components/SocialProofRejected';
import {
  useSocialProofScreen,
  type SocialProofScreenModel,
} from './hooks/useSocialProofScreen';

const SocialProofSkeleton: React.FC = memo(() => {
  const { sizes } = useTheme();
  return (
    <Box gap="xl">
      <Skeleton width="40%" height={sizes.button.sm} borderRadius="full" />
      <Skeleton width="100%" height={sizes.button.lg * 3} borderRadius="lg" />
      <Skeleton width="100%" height={sizes.button.lg * 3} borderRadius="lg" />
    </Box>
  );
});

const SocialProofFooter: React.FC<{ vm: SocialProofScreenModel; flow: VerificationFlow }> = memo(
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
      case 'code': {
        if (!vm.code) return null;
        const change = {
          label: t('account.verification.social.code.change'),
          onPress: vm.code.onChange,
        };
        // Registration: the code stays pending in the background, the brand moves on.
        return flow.onContinue ? (
          <LayoutFooter
            primary={{ label: vm.code.primaryLabel, onPress: vm.code.onOpen }}
            secondary={{
              label: t('account.verification.picker.onboardingContinue'),
              onPress: flow.onContinue,
              loading: flow.isContinuing,
              variant: 'secondary',
            }}
            tertiary={change}
          />
        ) : (
          <LayoutFooter
            primary={{ label: vm.code.primaryLabel, onPress: vm.code.onOpen }}
            secondary={change}
          />
        );
      }
      case 'rejected':
        return vm.rejected ? (
          <LayoutFooter
            primary={{
              label: t('account.verification.social.rejected.retry'),
              onPress: vm.rejected.onRetry,
            }}
            secondary={{
              label: t('account.verification.social.rejected.other'),
              onPress: vm.rejected.onPickOther,
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

/** Social page proof (route 2), Detail archetype: form, code + pending review, or rejected. */
const SocialProofView: React.FC<{ flow: VerificationFlow }> = memo(({ flow }) => {
  const { t } = useTranslation();
  const vm = useSocialProofScreen(flow);
  const chrome = useVerificationChrome(flow, {
    title: t('account.verification.social.title'),
    onBack: vm.onBack,
  });

  const body =
    vm.mode === 'loading' ? (
      <SocialProofSkeleton />
    ) : vm.mode === 'error' ? (
      <ErrorState
        error={vm.loadError}
        onRetry={vm.retry}
        retrying={vm.isRetrying}
      />
    ) : vm.mode === 'form' ? (
      <SocialProofForm form={vm.form} />
    ) : vm.mode === 'rejected' && vm.rejected ? (
      <SocialProofRejected rejected={vm.rejected} />
    ) : vm.code ? (
      <SocialProofCode code={vm.code} />
    ) : null;

  return (
    <>
      <Layout
        {...chrome}
        footer={
          vm.mode === 'loading' || vm.mode === 'error' ? undefined : (
            <SocialProofFooter vm={vm} flow={flow} />
          )
        }
      >
        <Box pb="xl" gap="xl">
          {body}
          <InlineError error={flow.error} />
        </Box>
      </Layout>
      <ConfirmSheet
        visible={vm.confirm.visible}
        onClose={vm.confirm.onClose}
        title={t('account.verification.social.code.replaceTitle')}
        body={vm.confirm.body}
        confirmLabel={t('account.verification.social.code.replaceConfirm')}
        onConfirm={vm.confirm.onConfirm}
        confirmLoading={vm.confirm.loading}
        cancelLabel={t('common.cancel')}
      />
    </>
  );
});

/** Settings stack, under the picker. */
export const SocialProofScreen: React.FC = memo(() => {
  useHideBottomBar();
  return <SocialProofView flow={useSettingsVerificationFlow()} />;
});

/** Brand registration step 4 (injected into the wizard by the app). */
export const BrandSocialProofScreen: React.FC = memo(() => (
  <SocialProofView flow={useWizardVerificationFlow()} />
));
