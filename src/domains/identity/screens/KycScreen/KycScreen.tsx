import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme';
import { Box, ErrorState, Layout, LayoutFooter, Text } from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { DiscardChangesSheet } from '../../components/DiscardChangesSheet';
import { KycCard } from '../../components/KycCard';
import { ProfileFormSkeleton } from '../../components/ProfileFormSkeleton';
import { KycUploadForm } from './components/KycUploadForm';
import { useKycScreen, type KycScreenModel } from './hooks/useKycScreen';

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

/**
 * Detail archetype: status from the server, upload only while it allows one
 * (unverified or rejected). The decision arrives later by push.
 */
const KycScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const vm = useKycScreen();
  useHideBottomBar();

  const body = vm.isLoading ? (
    <ProfileFormSkeleton fields={2} />
  ) : vm.isError ? (
    <ErrorState error={vm.loadError} onRetry={vm.retry} />
  ) : (
    <KycContent vm={vm} />
  );

  return (
    <>
      <Layout
        header={{ title: t(vm.isBrand ? 'account.kyc.brandTitle' : 'account.kyc.influencerTitle') }}
        footer={
          vm.canSubmit && !vm.isLoading ? (
            <LayoutFooter
              primary={{
                label: vm.submitLabel,
                onPress: vm.onSubmit,
                loading: vm.isSubmitting,
                disabled: vm.isRateLimited,
              }}
            />
          ) : undefined
        }
      >
        {body}
      </Layout>
      <DiscardChangesSheet guard={vm.guard} />
    </>
  );
};

export const KycScreen = memo(KycScreenComponent);
