import React, { memo } from 'react';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type {
  BrandWizardStackParamList,
  KycDocumentGroupParam,
  SettingsStackParamList,
} from '@/core/navigation';
import { useTheme } from '@/core/theme';
import { Box, ErrorState, InlineError, Layout, LayoutFooter, Text } from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { DiscardChangesSheet } from '../../components/DiscardChangesSheet';
import { KycCard } from '../../components/KycCard';
import { ProfileFormSkeleton } from '../../components/ProfileFormSkeleton';
import { KycUploadForm } from './components/KycUploadForm';
import {
  useSettingsVerificationFlow,
  useVerificationChrome,
  useWizardVerificationFlow,
  type VerificationFlow,
} from '../../hooks/useVerificationFlow';
import { VERIFICATION_METHOD_DEF } from '../../constants/verificationMethods';
import { useKycScreen, type KycScreenModel } from './hooks/useKycScreen';

/** Registration names the screen after the picked option. */
const WIZARD_TITLE = {
  company: VERIFICATION_METHOD_DEF.registry.titleKey,
  owner: VERIFICATION_METHOD_DEF.ownerId.titleKey,
} as const satisfies Record<KycDocumentGroupParam, ParseKeys>;

interface KycViewProps {
  flow: VerificationFlow;
  documentGroup: KycDocumentGroupParam;
}

const KycContent: React.FC<{ vm: KycScreenModel }> = memo(({ vm }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const dateLine =
    vm.status === 'verified' && vm.reviewedAt
      ? t('account.kyc.reviewedAt', { date: vm.reviewedAt })
      : vm.submittedAt && vm.status !== 'unverified'
        ? t('account.kyc.submittedAt', { date: vm.submittedAt })
        : null;

  return (
    <Box gap="2xl" pb="xl">
      {vm.status === 'unverified' ? null : (
        <Box gap="sm">
          <KycCard
            kyc={{ status: vm.status, rejectionReason: vm.rejectionReason }}
            userType={vm.userType}
          />
          {dateLine ? (
            <Text variant="caption" color={colors.text.secondary}>
              {dateLine}
            </Text>
          ) : null}
        </Box>
      )}
      {vm.canSubmit ? <KycUploadForm vm={vm} /> : null}
    </Box>
  );
});

const KycFooter: React.FC<{ vm: KycScreenModel; flow: VerificationFlow }> = memo(
  ({ vm, flow }) => {
    const { t } = useTranslation();
    if (vm.canSubmit) {
      return (
        <LayoutFooter
          primary={{
            label: vm.submitLabel,
            onPress: vm.onSubmit,
            loading: vm.isSubmitting || flow.isContinuing,
            disabled: vm.isRateLimited,
          }}
        />
      );
    }
    // Registration with a submission already under review: nothing to upload, move on.
    return flow.onContinue ? (
      <LayoutFooter
        primary={{
          label: t('account.verification.picker.onboardingContinue'),
          onPress: flow.onContinue,
          loading: flow.isContinuing,
        }}
      />
    ) : null;
  },
);

/**
 * Detail archetype: status from the server, upload only while it allows one
 * (unverified or rejected). The decision arrives later by push.
 */
const KycView: React.FC<KycViewProps> = memo(({ flow, documentGroup }) => {
  const { t } = useTranslation();
  const vm = useKycScreen({ documentGroup, flow });
  const chrome = useVerificationChrome(flow, {
    title: t(
      flow.context === 'wizard'
        ? WIZARD_TITLE[documentGroup]
        : vm.isBrand
          ? 'account.kyc.brandTitle'
          : 'account.kyc.influencerTitle',
    ),
    onBack: flow.leave,
  });
  const showFooter =
    !vm.isLoading && !vm.isError && (vm.canSubmit || flow.onContinue !== null);

  const body = vm.isLoading ? (
    <ProfileFormSkeleton fields={2} />
  ) : vm.isError ? (
    <ErrorState error={vm.loadError} onRetry={vm.retry} />
  ) : (
    <Box gap="xl">
      <KycContent vm={vm} />
      <InlineError error={flow.error} />
    </Box>
  );

  return (
    <>
      <Layout {...chrome} footer={showFooter ? <KycFooter vm={vm} flow={flow} /> : undefined}>
        {body}
      </Layout>
      <DiscardChangesSheet guard={vm.guard} />
    </>
  );
});

type SettingsRoute = RouteProp<SettingsStackParamList, 'KycScreen'>;
type WizardRoute = RouteProp<BrandWizardStackParamList, 'BrandKycDocument'>;

/** Settings stack: creators, and brands from the picker (the Profile entry predates it: company). */
export const KycScreen: React.FC = memo(() => {
  useHideBottomBar();
  const documentGroup = useRoute<SettingsRoute>().params?.documentGroup ?? 'company';
  return <KycView flow={useSettingsVerificationFlow()} documentGroup={documentGroup} />;
});

/** Brand registration step 4, picker option 1 or 2 (injected into the wizard by the app). */
export const BrandKycDocumentScreen: React.FC = memo(() => {
  const { documentGroup } = useRoute<WizardRoute>().params;
  return <KycView flow={useWizardVerificationFlow()} documentGroup={documentGroup} />;
});
