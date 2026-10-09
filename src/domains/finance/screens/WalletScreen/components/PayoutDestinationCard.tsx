import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, WalletCards } from 'lucide-react-native';
import { ListGroup, ListRow } from '@/shared/ui';
import { PayoutMethodRow } from '../../../components/PayoutMethodRow';
import { PayoutMethodsSkeleton } from '../../../components/PayoutMethodsSkeleton';
import type { WalletPayouts } from '../hooks/useWalletPayouts';

/** Where the creator's withdrawals go: the primary method with "Manage", or an add nudge. */
const PayoutDestinationCardComponent: React.FC<{ payouts: WalletPayouts }> = ({ payouts }) => {
  const { t } = useTranslation();
  const title = t('finance.payouts.walletCard.title');

  if (payouts.isLoading) return <PayoutMethodsSkeleton rows={1} />;

  if (payouts.isError) {
    return (
      <ListGroup title={title}>
        <ListRow
          icon={RefreshCw}
          title={t('finance.payouts.walletCard.loadFailed')}
          subtitle={t('finance.payouts.walletCard.retry')}
          onPress={payouts.retry}
        />
      </ListGroup>
    );
  }

  if (!payouts.primary) {
    return (
      <ListGroup title={title}>
        <ListRow
          icon={WalletCards}
          title={t('finance.payouts.walletCard.addTitle')}
          subtitle={t('finance.payouts.walletCard.addMessage')}
          onPress={payouts.openManage}
        />
      </ListGroup>
    );
  }

  return (
    <ListGroup title={title} action={{ label: t('finance.payouts.walletCard.manage'), onPress: payouts.openManage }}>
      <PayoutMethodRow method={payouts.primary} onPress={payouts.openManage} compact />
    </ListGroup>
  );
};

export const PayoutDestinationCard = memo(PayoutDestinationCardComponent);
