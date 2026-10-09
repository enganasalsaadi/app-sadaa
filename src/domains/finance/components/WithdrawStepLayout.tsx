import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { WITHDRAW_STEP_COUNT, WITHDRAW_STEPS, type WithdrawStepKey } from '../constants/withdraw';
import { useWithdrawFlow } from '../hooks/useWithdrawFlow';
import { MoneyStepLayout } from './MoneyStepLayout';

interface WithdrawStepLayoutProps {
  step: WithdrawStepKey;
  children: React.ReactNode;
  /** `LayoutFooter` with the step's one primary. */
  footer?: React.ReactNode;
}

/** One withdraw step in the money wizard chrome. */
const WithdrawStepLayoutComponent: React.FC<WithdrawStepLayoutProps> = ({ step, children, footer }) => {
  const { t } = useTranslation();
  const { close } = useWithdrawFlow();
  const def = WITHDRAW_STEPS[step];

  return (
    <MoneyStepLayout
      title={t('finance.withdraw.title')}
      stepTitle={t(def.titleKey)}
      index={def.index}
      total={WITHDRAW_STEP_COUNT}
      progressLabel={t('finance.withdraw.progressA11y', { current: def.index, total: WITHDRAW_STEP_COUNT })}
      onClose={close}
      footer={footer}
    >
      {children}
    </MoneyStepLayout>
  );
};

export const WithdrawStepLayout = memo(WithdrawStepLayoutComponent);
