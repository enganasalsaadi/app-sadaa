import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Globe, Landmark, Palmtree, RefreshCw, Smartphone, Store, Trash2, Wallet } from 'lucide-react-native';
import { Badge, Box, ListGroup, ListRow, StatusPill, Switch } from '@/shared/ui';
import { formatMoney } from '@/core/i18n';
import { MOCK_DEAL_SUMMARY } from './mockData';
import { useListRowsDemo } from './hooks/useListRowsDemo';

const UNREAD = 4;

const ListRowsDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const demo = useListRowsDemo();

  return (
    <Box gap="xl">
      <ListGroup
        title={t('devShowcase.listRows.groupTitle')}
        footer={t('devShowcase.listRows.groupFooter')}
      >
        <ListRow icon={Globe} title={t('devShowcase.listRows.language')} value={t('devShowcase.listRows.languageValue')} onPress={demo.press} />
        <ListRow
          icon={Wallet}
          title={t('devShowcase.listRows.wallet')}
          subtitle={t('devShowcase.listRows.walletSubtitle')}
          value={formatMoney(MOCK_DEAL_SUMMARY.payout)}
          onPress={demo.press}
        />
        <ListRow
          icon={Bell}
          title={t('devShowcase.listRows.notifications')}
          trailing={<Badge count={UNREAD} />}
          onPress={demo.press}
        />
        <ListRow
          icon={Palmtree}
          title={t('devShowcase.listRows.vacation')}
          subtitle={t('devShowcase.listRows.vacationSubtitle')}
          trailing={
            <Switch
              value={demo.vacationMode}
              onValueChange={demo.setVacationMode}
              accessibilityLabel={t('devShowcase.listRows.vacation')}
            />
          }
        />
        <ListRow
          title={t('devShowcase.listRows.kyc')}
          trailing={<StatusPill tone="warning" size="sm" label={t('devShowcase.badges.warning')} />}
        />
        <ListRow
          icon={RefreshCw}
          title={t('devShowcase.listRows.sync')}
          loading={demo.loading}
          onPress={demo.startLoading}
        />
        <ListRow icon={Globe} title={t('devShowcase.listRows.disabled')} onPress={demo.press} disabled />
      </ListGroup>

      <ListGroup title={t('devShowcase.listRows.optionsTitle')}>
        <ListRow
          icon={Store}
          title={t('devShowcase.listRows.optionOffice')}
          subtitle={t('devShowcase.listRows.optionOfficeCaption')}
          selected={demo.option === 'office'}
          onPress={demo.pickOffice}
        />
        <ListRow
          icon={Landmark}
          title={t('devShowcase.listRows.optionBank')}
          subtitle={t('devShowcase.listRows.optionOfficeCaption')}
          selected={demo.option === 'bank'}
          onPress={demo.pickBank}
        />
        <ListRow
          icon={Smartphone}
          title={t('devShowcase.listRows.optionWallet')}
          subtitle={t('devShowcase.listRows.optionWalletCaption')}
          selected={false}
          onPress={demo.press}
          disabled
        />
      </ListGroup>

      <ListGroup tone="danger">
        <ListRow icon={Trash2} tone="danger" title={t('devShowcase.listRows.delete')} onPress={demo.press} />
      </ListGroup>
    </Box>
  );
};

export const ListRowsDemo = memo(ListRowsDemoComponent);
