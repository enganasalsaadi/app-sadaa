import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, ErrorState, Layout, Skeleton, Text } from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import { VerificationAttemptCard } from '../../components/VerificationAttemptCard';
import { VerificationMethodList } from '../../components/VerificationMethodList';
import { VerifiedSection } from './components/VerifiedSection';
import {
  useCompanyVerificationScreen,
  type CompanyVerificationScreenModel,
} from './hooks/useCompanyVerificationScreen';

const VerificationSkeleton: React.FC = memo(() => {
  const { sizes } = useTheme();
  return (
    <Box gap="2xl">
      <Box gap="sm">
        <Skeleton width="60%" height={sizes.button.sm} borderRadius="xs" />
        <Skeleton width="90%" height={sizes.icon.sm} borderRadius="xs" />
      </Box>
      <Skeleton width="100%" height={sizes.button.lg * 3} borderRadius="lg" />
      <Skeleton width="100%" height={sizes.button.lg * 3} borderRadius="lg" />
    </Box>
  );
});

/** Board 1: nothing open, the four methods in two groups. */
const MethodPicker: React.FC<{ vm: CompanyVerificationScreenModel }> = memo(({ vm }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  return (
    <Box gap="2xl">
      <Box gap="sm">
        <Text variant="h2">{t('account.verification.picker.heading')}</Text>
        <Text variant="body" color={colors.text.secondary}>
          {t('account.verification.picker.subtitle')}
        </Text>
      </Box>
      <VerificationMethodList variant="grouped" onSelect={vm.onSelect} hints={vm.hints} />
      <Box row align="center" justify="center" gap="sm">
        <Lock size={sizes.icon.xs} color={colors.icon.secondary} />
        <Text variant="caption" color={colors.text.secondary}>
          {t('account.verification.picker.privacy')}
        </Text>
      </Box>
    </Box>
  );
});

/** Board 2: the open attempts first, every method still one tap away (routes run in parallel). */
const ActiveAttempts: React.FC<{ vm: CompanyVerificationScreenModel }> = memo(({ vm }) => {
  const { t } = useTranslation();
  return (
    <Box gap="2xl">
      <Box gap="md">
        {vm.attempts.map(({ key, ...attempt }) => (
          <VerificationAttemptCard key={key} {...attempt} />
        ))}
      </Box>
      <VerificationMethodList
        variant="compact"
        title={t('account.verification.picker.groupOther')}
        onSelect={vm.onSelect}
        hints={vm.hints}
      />
    </Box>
  );
});

/** Brand verification hub (Settings archetype): picker, open attempts, or verified. */
const CompanyVerificationScreenComponent: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useCompanyVerificationScreen();
  useHideBottomBar();

  const body = vm.isLoading ? (
    <VerificationSkeleton />
  ) : vm.isError ? (
    <ErrorState error={vm.loadError} onRetry={vm.retry} retrying={vm.isRetrying} />
  ) : vm.verified ? (
    <VerifiedSection verified={vm.verified} />
  ) : vm.attempts.length > 0 ? (
    <ActiveAttempts vm={vm} />
  ) : (
    <MethodPicker vm={vm} />
  );

  return (
    <Layout
      header={{ title: t('account.verification.title') }}
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
      <Box pb="xl">{body}</Box>
    </Layout>
  );
};

export const CompanyVerificationScreen = memo(CompanyVerificationScreenComponent);
