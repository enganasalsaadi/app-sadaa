import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatMoney } from '@/core/i18n';
import { LINE_STATUS_PILL, lineDisplayAmount, lineKind, lineTitle } from '../constants/walletLineLook';
import type { WalletTransaction } from '../types';

const TIME: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };

/**
 * What every ledger line shows, however it is drawn (statement row, wallet receipt tape):
 * the kind, the title, the open-status pill, the time, the signed amount, the paid amount in
 * another currency (`≈ 500.00 $` under a SYP top-up) and the row's spoken label.
 */
export const useWalletLineView = (line: WalletTransaction, hidden: boolean) => {
  const { t, i18n } = useTranslation();

  return useMemo(() => {
    const created = new Date(line.created_at);
    const time = Number.isNaN(created.getTime()) ? '' : formatDate(created, TIME, i18n.language);
    const title = lineTitle(line);
    const signed = line.affects_balance;
    const amount = lineDisplayAmount(line);
    const paid =
      line.original && line.original.currency !== line.amount.currency
        ? t('common.money.approx', {
            amount: formatMoney(
              { amount: Math.abs(line.original.amount), currency: line.original.currency },
              i18n.language,
            ),
          })
        : null;

    return {
      kind: lineKind(line),
      title,
      pill: line.status ? LINE_STATUS_PILL[line.status] : null,
      signed,
      amount,
      // Memo lines (escrow held for a creator) carry no sign and no mint.
      credit: signed && line.direction === 'credit',
      time,
      paid,
      accessibilityLabel: t('finance.statement.lineA11y', {
        title,
        amount: hidden
          ? t('common.money.hidden')
          : formatMoney(amount, i18n.language, { signDisplay: signed ? 'exceptZero' : 'auto' }),
        time,
      }),
    };
  }, [hidden, i18n.language, line, t]);
};

export type WalletLineView = ReturnType<typeof useWalletLineView>;
