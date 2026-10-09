import { useCallback, useState } from 'react';
import { goBack } from '@/core/navigation';

const STEP_COUNT = 4;

/** Demo-only step state: the real wizard is a nested stack (`TopUpNavigator`). */
export const useLayoutMoneyWizardScreen = () => {
  const [step, setStep] = useState(1);
  const next = useCallback(() => setStep(current => Math.min(current + 1, STEP_COUNT)), []);
  const back = useCallback(() => {
    if (step === 1) goBack();
    else setStep(step - 1);
  }, [step]);

  return { step, total: STEP_COUNT, first: step === 1, last: step === STEP_COUNT, next, back };
};
