import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/core/i18n';
import { moderateScale, useTheme } from '@/core/theme';
import {
  Box,
  ErrorState,
  Layout,
  SegmentedControl,
  Skeleton,
  StaggerIn,
  Text,
} from '@/shared/ui';
import { useHideBottomBar } from '@/shared/context/BottomBarContext';
import type { DealRole } from '../../types';
import { ContractAddendumCard } from './components/ContractAddendumCard';
import { ContractPaper } from './components/ContractPaper';
import { ContractSeal } from './components/ContractSeal';
import { useDealContractScreen } from './hooks/useDealContractScreen';

const ISSUED_FORMAT: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

interface DealContractScreenProps {
  /** Picked by the role's navigator (rule 01). */
  role: DealRole;
}

/**
 * The signed contract (Detail archetype): a language switch with the Arabic-governs note, the
 * contract as paper, its seal (signatures + fingerprint), then every addendum with its own seal.
 */
const DealContractScreenComponent: React.FC<DealContractScreenProps> = ({
  role,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const vm = useDealContractScreen(role);
  useHideBottomBar();
  const { contract, view } = vm;
  const names = useMemo(
    () => ({
      brand: view?.brand?.legalName ?? t('marketplace.deals.contract.brand'),
      creator:
        view?.creator?.legalName ?? t('marketplace.deals.contract.creator'),
    }),
    [t, view],
  );

  if (vm.isLoading) {
    return (
      <Layout header={{ title: t('marketplace.deals.contract.title') }}>
        <Box gap="lg">
          <Skeleton width="100%" height={moderateScale(48)} borderRadius="lg" />
          <Skeleton
            width="100%"
            height={moderateScale(420)}
            borderRadius="xl"
          />
        </Box>
      </Layout>
    );
  }
  if (!contract || !view) {
    return (
      <Layout
        mode="static"
        header={{ title: t('marketplace.deals.contract.title') }}
      >
        <ErrorState
          error={vm.error}
          onRetry={vm.onRetry}
          title={t('marketplace.deals.contract.loadFailed')}
        />
      </Layout>
    );
  }

  return (
    <Layout header={{ title: t('marketplace.deals.contract.title') }}>
      <StaggerIn gap="xl">
        <Box gap="sm">
          <SegmentedControl
            options={vm.languages}
            value={vm.lang}
            onChange={vm.setLang}
            accessibilityLabel={t('marketplace.deals.contract.language')}
          />
          <Box row justify="space-between" gap="md">
            <Text variant="caption" color={colors.text.tertiary}>
              {t('marketplace.deals.contract.governs')}
            </Text>
            <Text variant="caption" color={colors.text.tertiary}>
              {t('marketplace.deals.contract.issued', {
                date: formatDate(
                  contract.issuedAt,
                  ISSUED_FORMAT,
                  i18n.language,
                ),
              })}
            </Text>
          </Box>
        </Box>
        <ContractPaper view={view} lang={vm.lang} />
        <ContractSeal
          hash={contract.hash}
          signatures={contract.signatures}
          names={names}
          onCopy={vm.copyFingerprint}
        />
        {contract.addenda.length > 0 ? (
          <Box gap="md">
            <Text variant="h4" color={colors.text.primary}>
              {t('marketplace.deals.contract.addenda')}
            </Text>
            {contract.addenda.map(addendum => (
              <ContractAddendumCard
                key={addendum.id}
                addendum={addendum}
                lang={vm.lang}
                names={names}
                onCopy={vm.copyFingerprint}
              />
            ))}
          </Box>
        ) : null}
      </StaggerIn>
    </Layout>
  );
};

export const DealContractScreen = memo(DealContractScreenComponent);
