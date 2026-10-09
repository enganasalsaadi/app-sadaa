import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { TOP_UP_STEP_COUNT, TOP_UP_STEPS, type TopUpStepKey } from '../constants/topUp';
import { useTopUpFlow } from '../hooks/useTopUpFlow';
import { MoneyStepLayout } from './MoneyStepLayout';

interface TopUpStepLayoutProps {
  step: TopUpStepKey;
  children: React.ReactNode;
  /** `LayoutFooter` with the step's one primary. */
  footer?: React.ReactNode;
}

/** One top-up step in the money wizard chrome. */
const TopUpStepLayoutComponent: React.FC<TopUpStepLayoutProps> = ({ step, children, footer }) => {
  const { t } = useTranslation();
  const { close } = useTopUpFlow();
  const def = TOP_UP_STEPS[step];

  return (
    <MoneyStepLayout
      title={t('finance.topUp.title')}
      stepTitle={t(def.titleKey)}
      index={def.index}
      total={TOP_UP_STEP_COUNT}
      progressLabel={t('finance.topUp.progressA11y', { current: def.index, total: TOP_UP_STEP_COUNT })}
      onClose={close}
      footer={footer}
    >
      {children}
    </MoneyStepLayout>
  );
};

export const TopUpStepLayout = memo(TopUpStepLayoutComponent);
