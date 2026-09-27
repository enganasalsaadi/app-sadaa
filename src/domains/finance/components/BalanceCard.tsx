import React, { memo } from 'react';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { formatMoney } from '@/core/i18n';
import type { Money } from '@/core/money';
import { useTheme } from '@/core/theme';
import { Box, Card, CustomButton, Divider, KeyValueRow, MoneyText, Text } from '@/shared/ui';
import type { WalletRole } from '../types';

/** The one money action each role has; the other one is never shown (rule 06). */
const ROLE_ACTION = {
  creator: { labelKey: 'finance.wallet.withdraw', icon: ArrowUpFromLine },
  brand: { labelKey: 'finance.wallet.deposit', icon: ArrowDownToLine },
} as const satisfies Record<WalletRole, { labelKey: ParseKeys; icon: LucideIcon }>;

export interface BalanceCardProps {
  role: WalletRole;
  /** Spendable / withdrawable now (server figure). */
  available: Money;
  /** Held for active deals. */
  escrow?: Money;
  /** Released but not settled yet. */
  pending?: Money;
  onAction: () => void;
  /** Money mutation in flight: button shows loading and ignores taps (rule 06). */
  actionLoading?: boolean;
  actionDisabled?: boolean;
}

/** Wallet summary with the role's single money action. */
const BalanceCardComponent: React.FC<BalanceCardProps> = ({
  role,
  available,
  escrow,
  pending,
  onAction,
  actionLoading = false,
  actionDisabled = false,
}) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const action = ROLE_ACTION[role];
  const ActionIcon = action.icon;

  return (
    <Card p="lg">
      <Box gap="md">
        <Box gap="xs">
          <Text variant="bodySmall" color={colors.text.secondary}>
            {t('finance.wallet.available')}
          </Text>
          <MoneyText value={available} size="lg" tone="money" />
        </Box>

        {escrow || pending ? (
          <Box>
            <Divider spacing="xs" />
            {escrow ? (
              <KeyValueRow
                label={t('finance.wallet.escrow')}
                hint={t('finance.wallet.escrowHint')}
                value={formatMoney(escrow)}
              />
            ) : null}
            {pending ? <KeyValueRow label={t('finance.wallet.pending')} value={formatMoney(pending)} /> : null}
          </Box>
        ) : null}

        <CustomButton
          title={t(action.labelKey)}
          onPress={onAction}
          loading={actionLoading}
          disabled={actionDisabled}
          leftIcon={<ActionIcon size={sizes.icon.sm} />}
          fullWidth
        />
      </Box>
    </Card>
  );
};

export const BalanceCard = memo(BalanceCardComponent);
