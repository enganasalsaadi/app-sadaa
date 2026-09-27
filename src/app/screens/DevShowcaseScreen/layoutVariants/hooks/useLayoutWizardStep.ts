import { useCallback, useState } from 'react';
import { goBack } from '@/core/navigation';

export const WIZARD_DEMO_TOTAL = 3;

/** One screen standing in for a wizard: steps change in place instead of pushing a stack. */
export const useLayoutWizardStep = () => {
  const [step, setStep] = useState(1);
  const isLast = step === WIZARD_DEMO_TOTAL;

  const onBack = useCallback(() => {
    if (step === 1) goBack();
    else setStep(prev => prev - 1);
  }, [step]);

  const onNext = useCallback(() => {
    if (isLast) goBack();
    else setStep(prev => prev + 1);
  }, [isLast]);

  return { step, isLast, onBack, onNext };
};
