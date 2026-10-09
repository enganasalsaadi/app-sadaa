import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import { LogOut } from 'lucide-react-native';
import type { DiscardGuard } from '@/core/hooks';
import { useTheme } from '@/core/theme';
import { ConfirmSheet } from '@/shared/ui';

type DiscardFlow = 'topUp' | 'payoutMethod';

interface DiscardCopy {
  title: ParseKeys;
  body: ParseKeys;
  confirm: ParseKeys;
  stay: ParseKeys;
}

const DISCARD_COPY = {
  topUp: {
    title: 'finance.topUp.discard.title',
    body: 'finance.topUp.discard.body',
    confirm: 'finance.topUp.discard.confirm',
    stay: 'finance.topUp.discard.stay',
  },
  payoutMethod: {
    title: 'finance.payouts.discard.title',
    body: 'finance.payouts.discard.body',
    confirm: 'finance.payouts.discard.confirm',
    stay: 'finance.payouts.discard.stay',
  },
} as const satisfies Record<DiscardFlow, DiscardCopy>;

interface DiscardSheetProps {
  guard: DiscardGuard;
  flow: DiscardFlow;
}

/** Asked when leaving a finance flow with something entered (`useDiscardGuard`). */
const DiscardSheetComponent: React.FC<DiscardSheetProps> = ({ guard, flow }) => {
  const { t } = useTranslation();
  const { colors, sizes } = useTheme();
  const copy = DISCARD_COPY[flow];

  return (
    <ConfirmSheet
      visible={guard.visible}
      onClose={guard.stay}
      icon={<LogOut size={sizes.icon.lg} color={colors.text.secondary} />}
      title={t(copy.title)}
      body={t(copy.body)}
      confirmLabel={t(copy.confirm)}
      confirmVariant="danger"
      onConfirm={guard.discard}
      cancelLabel={t(copy.stay)}
    />
  );
};

export const DiscardSheet = memo(DiscardSheetComponent);
