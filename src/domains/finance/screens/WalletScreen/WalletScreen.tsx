import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, ReceiptText } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, Layout, Notice, StaggerIn } from '@/shared/ui';
import type { WalletRole } from '../../types';
import { useWalletScreen } from './hooks/useWalletScreen';
import { EscrowTickets } from './components/EscrowTickets';
import { PayoutPort } from './components/PayoutPort';
import { RateLine } from './components/RateLine';
import { ReceiptTape } from './components/ReceiptTape';
import { TideChart } from './components/TideChart';
import { WalletHeaderBalance } from './components/WalletHeaderBalance';
import { WalletHero } from './components/WalletHero';

interface WalletScreenProps {
  /** Picked by the role's tab navigator (rule 01), never read here. */
  role: WalletRole;
}

/**
 * Wallet tab (Money archetype, rule 09 §2.1), approved mix 2026-10-11: a navy block with
 * rounded bottom corners holding the balance dial (tap the legend to explain an arc),
 * behind an overlay header that pins the balance once the hero scrolls away; the eye hides
 * every amount. Then, rising in one by one: held money as boarding tickets with rising
 * chevrons, the creator's payout pill, the earnings tide, today's rate, and the latest
 * lines on a receipt printed from a slot. Sections the server can't fill stay out (rule 09).
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
      heroBackdrop="brandRounded"
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
          dealsCount={vm.dealsCount}
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
      <Box pt="2xl" pb="5xl">
        <StaggerIn gap="3xl">
          {vm.hero.status === 'error' ? (
            <Box px="xl">
              <Notice
                tone="danger"
                message={t('finance.wallet.hero.loadFailed')}
                action={{ label: t('common.retry'), onPress: vm.hero.retry }}
              />
            </Box>
          ) : null}

          {vm.rate.staleMessage ? (
            <Box px="xl">
              <Notice tone="warning" title={t('finance.wallet.rate.staleTitle')} message={vm.rate.staleMessage} />
            </Box>
          ) : null}

          <EscrowTickets vm={vm} />

          {vm.payouts.enabled ? (
            <Box px="xl">
              <PayoutPort payouts={vm.payouts} />
            </Box>
          ) : null}

          <TideChart earnings={vm.earnings} hidden={vm.hidden} />

          {vm.rate.rate ? (
            <Box px="xl">
              <RateLine value={vm.rate.rate.value} updated={vm.rate.rate.updated} />
            </Box>
          ) : null}

          <Box px="xl">
            <ReceiptTape
              activity={vm.activity}
              emptyMessage={t(vm.copy.emptyMessage)}
              hidden={vm.hidden}
              onOpenStatement={vm.openStatement}
              onPressLine={vm.openReceipt}
            />
          </Box>
        </StaggerIn>
      </Box>
    </Layout>
  );
};

export const WalletScreen = memo(WalletScreenComponent);
