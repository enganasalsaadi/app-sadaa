import React, { memo, useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@/core/theme';
import { Box, MoneyText, Notice, Rail, Skeleton, Text, useLayoutInView } from '@/shared/ui';
import { EscrowFlowCard } from '../../../components';
import type { EscrowFlowNode } from '../../../components';
import type { WalletScreenModel } from '../hooks/useWalletScreen';
import { EscrowTicket, TICKET_HEIGHT, TICKET_WIDTH } from './EscrowTicket';
import { WalletSectionTitle } from './WalletSectionTitle';

type Nodes = readonly [EscrowFlowNode, EscrowFlowNode, EscrowFlowNode];

const SKELETON_TICKETS = [0, 1] as const;
const SKELETON_TITLE = '55%';

interface EscrowTicketsProps {
  vm: Pick<WalletScreenModel, 'role' | 'copy' | 'escrows' | 'hidden'>;
}

/**
 * Money held for active deals as a rail of boarding tickets (closest to release first),
 * full bleed so the next ticket peeks in. No active escrow, or a server without the
 * endpoint yet: how escrow works, as a still path.
 */
const EscrowTicketsComponent: React.FC<EscrowTicketsProps> = ({ vm }) => {
  const { t } = useTranslation();
  const { colors, sizes, spacing, typography } = useTheme();
  const { role, copy, escrows: section, hidden } = vm;
  const data = section.escrows;
  const incoming = role === 'creator';
  const rail = useLayoutInView({ track: true });

  const explainerNodes = useMemo<Nodes>(() => {
    const wallet: EscrowFlowNode = { key: 'wallet', kind: 'wallet', label: t('finance.wallet.escrowCard.walletNode') };
    const escrow: EscrowFlowNode = { key: 'escrow', kind: 'escrow', label: t('finance.wallet.escrowCard.escrowNode') };
    const party: EscrowFlowNode = {
      key: 'party',
      kind: 'party',
      label: t(copy.counterpartyNode),
      partyIcon: role === 'creator' ? 'brand' : 'creator',
    };
    return role === 'creator' ? [party, escrow, wallet] : [wallet, escrow, party];
  }, [copy.counterpartyNode, role, t]);

  switch (section.status) {
    case 'loading':
      return (
        <Box gap="md">
          <Box px="xl">
            <Skeleton width={SKELETON_TITLE} height={typography.h4.lineHeight} borderRadius="md" />
          </Box>
          <Box row gap="md" px="xl">
            {SKELETON_TICKETS.map(ticket => (
              <Skeleton key={ticket} width={TICKET_WIDTH} height={TICKET_HEIGHT} borderRadius="lg" />
            ))}
          </Box>
        </Box>
      );
    case 'error':
      return (
        <Box px="xl">
          <Notice
            tone="danger"
            message={t('finance.wallet.escrowCard.loadFailed')}
            action={{ label: t('common.retry'), onPress: section.retry }}
          />
        </Box>
      );
    case 'explainer':
      return (
        <Box px="xl">
          <EscrowFlowCard title={t(copy.explainerTitle)} nodes={explainerNodes} caption={t(copy.explainerBody)} />
        </Box>
      );
    case 'ready':
      return (
        <Box gap="md">
          <Box px="xl">
            <WalletSectionTitle title={t(copy.escrowTitle)}>
              <ShieldCheck size={sizes.icon.xs} color={colors.interactive.main} />
              <Text variant="bodySmall" color={colors.text.secondary} numberOfLines={1}>
                {t('finance.wallet.escrowCard.dealsCount', { count: data?.count ?? 0 })}
              </Text>
              {data?.total_amount ? (
                <>
                  <Box width={sizes.dot.sm} height={sizes.dot.sm} borderRadius="full" bg={colors.border.strong} />
                  <MoneyText value={data.total_amount} size="sm" tone={incoming ? 'money' : 'default'} hidden={hidden} />
                </>
              ) : null}
            </WalletSectionTitle>
          </Box>
          <Animated.View ref={rail.ref} onLayout={rail.onLayout}>
          <Rail shadow="card" snapInterval={TICKET_WIDTH + spacing.md}>
            {data?.items.map(escrow => (
              <EscrowTicket key={escrow.id} escrow={escrow} incoming={incoming} hidden={hidden} active={rail.visible} />
            ))}
          </Rail>
          </Animated.View>
        </Box>
      );
    default: {
      const _exhaustive: never = section.status;
      return _exhaustive;
    }
  }
};

export const EscrowTickets = memo(EscrowTicketsComponent);
