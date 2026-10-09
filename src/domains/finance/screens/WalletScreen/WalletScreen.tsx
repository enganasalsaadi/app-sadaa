import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ReceiptText } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Layout, Notice, StaggerIn } from '@/shared/ui';
import { ExchangeRateRow } from '../../components';
import type { WalletRole } from '../../types';
import { useWalletScreen } from './hooks/useWalletScreen';
import { EarningsCard } from './components/EarningsCard';
import { EscrowSection } from './components/EscrowSection';
import { PayoutDestinationCard } from './components/PayoutDestinationCard';
import { WalletActivity } from './components/WalletActivity';
import { WalletHeaderBalance } from './components/WalletHeaderBalance';
import { WalletHero } from './components/WalletHero';

interface WalletScreenProps {
  /** Picked by the role's tab navigator (rule 01), never read here. */
  role: WalletRole;
}

/**
 * Wallet tab (Money archetype, rule 09 §2.1): the navy balance hero with its lights
 * behind an overlay header that pins the balance once the hero scrolls away; the eye
 * hides every amount. Then, rising in one by one: the stale-rate notice, held money as
 * a flow, the monthly chart, today's rate and the latest lines. Sections the server
 * can't fill yet stay out (rule 09).
 */
const WalletScreenComponent: React.FC<WalletScreenProps> = ({ role }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const vm = useWalletScreen(role);

  return (
    <Layout
      padding="none"
      statusBar="light"
      headerBehavior="overlay"
      heroBackdrop="brandGlow"
      heroBehavior="parallax"
      header={{
        title: vm.title,
        variant: 'brand',
        showBackButton: false,
        leading: (
          <WalletHeaderBalance
            label={vm.hero.availableLabel}
            available={vm.hero.available}
            hidden={vm.hidden}
          />
        ),
        actions: [
          {
            icon: vm.hidden ? EyeOff : Eye,
            accessibilityLabel: vm.hiddenLabel,
            onPress: vm.toggleHidden,
            glass: true,
          },
          {
            icon: ReceiptText,
            accessibilityLabel: t('finance.statement.title'),
            onPress: vm.openStatement,
            glass: true,
          },
        ],
      }}
      hero={
        <WalletHero
          title={vm.title}
          hero={vm.hero}
          hidden={vm.hidden}
          actions={vm.actions}
          onOpenTile={vm.onOpenTile}
        />
      }
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.onRefresh}
            // The spinner sits over the navy backdrop.
            tintColor={colors.text.onBrand}
          />
        ),
      }}
    >
      <Box px="xl" pt="xl" pb="5xl">
        <StaggerIn gap="2xl">
          {vm.hero.status === 'error' ? (
            <Notice
              tone="danger"
              message={t('finance.wallet.hero.loadFailed')}
              action={{ label: t('common.retry'), onPress: vm.hero.retry }}
            />
          ) : null}

          {vm.rate.staleMessage ? (
            <Notice tone="warning" title={t('finance.wallet.rate.staleTitle')} message={vm.rate.staleMessage} />
          ) : null}

          <EscrowSection vm={vm} />

          {vm.payouts.enabled ? <PayoutDestinationCard payouts={vm.payouts} /> : null}

          <EarningsCard earnings={vm.earnings} hidden={vm.hidden} />

          {vm.rate.rate ? <ExchangeRateRow value={vm.rate.rate.value} updated={vm.rate.rate.updated} /> : null}

          <WalletActivity
            activity={vm.activity}
            emptyMessage={t(vm.copy.emptyMessage)}
            hidden={vm.hidden}
            onOpenStatement={vm.openStatement}
            onPressLine={vm.openReceipt}
          />
        </StaggerIn>
      </Box>
    </Layout>
  );
};

export const WalletScreen = memo(WalletScreenComponent);
