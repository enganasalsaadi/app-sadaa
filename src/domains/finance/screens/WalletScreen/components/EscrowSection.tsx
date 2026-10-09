import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { moderateScale } from '@/core/theme';
import { Card, Notice, Skeleton } from '@/shared/ui';
import { EscrowFlowCard } from '../../../components';
import type { EscrowFlowNode } from '../../../components';
import type { WalletScreenModel } from '../hooks/useWalletScreen';

type Nodes = readonly [EscrowFlowNode, EscrowFlowNode, EscrowFlowNode];

const SKELETON_HEIGHT = moderateScale(220);

interface EscrowSectionProps {
  vm: Pick<WalletScreenModel, 'role' | 'copy' | 'escrows' | 'hidden'>;
}

/**
 * Money held for active deals as a flow (creator: brand → escrow → you · brand: you →
 * escrow → creator). No active escrow, or a server without the endpoint yet: the same
 * path as a still explainer.
 */
const EscrowSectionComponent: React.FC<EscrowSectionProps> = ({ vm }) => {
  const { t } = useTranslation();
  const { role, copy, escrows: section, hidden } = vm;
  const data = section.escrows;
  const first = data?.items[0];
  const count = data?.count ?? 0;

  const nodes = useMemo<Nodes>(() => {
    const wallet: EscrowFlowNode = { key: 'wallet', kind: 'wallet', label: t('finance.wallet.escrowCard.walletNode') };
    const escrow: EscrowFlowNode = { key: 'escrow', kind: 'escrow', label: t('finance.wallet.escrowCard.escrowNode') };
    const party: EscrowFlowNode = first?.counterparty
      ? {
          key: 'party',
          kind: 'party',
          label:
            count > 1
              ? t('finance.wallet.escrowCard.dealsCount', { count })
              : first.counterparty.name,
          avatarUrl: first.counterparty.avatar_url,
        }
      : {
          key: 'party',
          kind: 'party',
          label: t(copy.counterpartyNode),
          partyIcon: role === 'creator' ? 'brand' : 'creator',
        };
    return role === 'creator' ? [party, escrow, wallet] : [wallet, escrow, party];
  }, [copy.counterpartyNode, count, first, role, t]);

  switch (section.status) {
    case 'loading':
      return (
        <Card p="lg">
          <Skeleton width="100%" height={SKELETON_HEIGHT} borderRadius="md" />
        </Card>
      );
    case 'error':
      return (
        <Notice
          tone="danger"
          message={t('finance.wallet.escrowCard.loadFailed')}
          action={{ label: t('common.retry'), onPress: section.retry }}
        />
      );
    case 'explainer':
      return <EscrowFlowCard title={t(copy.explainerTitle)} nodes={nodes} variant="explainer" caption={t(copy.explainerBody)} />;
    case 'ready':
      return (
        <EscrowFlowCard
          title={t(copy.escrowTitle)}
          nodes={nodes}
          variant="live"
          amount={data?.total_amount ?? (count === 1 ? first?.amount : null)}
          caption={count === 1 && first?.release_hint ? first.release_hint : t(copy.releaseMany)}
          hidden={hidden}
        />
      );
    default: {
      const _exhaustive: never = section.status;
      return _exhaustive;
    }
  }
};

export const EscrowSection = memo(EscrowSectionComponent);
