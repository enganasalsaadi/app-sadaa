import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserRoundX } from 'lucide-react-native';
import { goBack } from '@/core/navigation';
import { toastService } from '@/core/toast';
import type { WizardShellAction } from '@/shared/ui';

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

/** Header `action` slot: a flow-level escape shown on every step. */
export const useLayoutWizardAction = (): WizardShellAction => {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      icon: UserRoundX,
      label: t('devShowcase.wizard.action'),
      onPress: () => toastService.info(t('devShowcase.wizard.actionPressed')),
    }),
    [t],
  );
};
