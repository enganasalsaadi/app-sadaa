import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BrandWizardStackParamList } from '@/core/navigation';
import { useBrandStep3KycMutation } from '../api';
import { BRAND_WIZARD_STEPS } from '../constants/brandOnboarding';
import { createKycSkipForm } from '../utils/kycSubmission';
import { useBrandOnboardingFlow } from './useBrandOnboardingFlow';

/**
 * Brand wizard step 4 for the verification screens (identity owns them, the app injects
 * them into the wizard). Every method runs on its own endpoint; `finish` then sends step 3
 * as a skip, which the server counts as taken once any attempt exists (contract
 * §Resolved), re-reads progress and moves on to the welcome.
 */
export const useBrandKycStep = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<BrandWizardStackParamList>>();
  const [sendStep] = useBrandStep3KycMutation();
  const { runStep, isBusy, error } = useBrandOnboardingFlow('kyc');

  const finish = useCallback(
    () => runStep(() => sendStep(createKycSkipForm()).unwrap()),
    [runStep, sendStep],
  );

  // Back from the picker always edits the profile: pop when it's underneath, otherwise
  // (resumed straight into KYC) swap it in with a pop animation.
  const backToProfile = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace('BrandProfile', { fromBack: true });
  }, [navigation]);

  const def = BRAND_WIZARD_STEPS.kyc;
  const header = useMemo(
    () => ({ step: def.index, title: t(def.titleKey), subtitle: t(def.subtitleKey) }),
    [def, t],
  );

  return {
    /** The picker's WizardShell header; method screens keep `step` with their own title. */
    header,
    finish,
    isBusy,
    error,
    backToProfile,
  };
};

export type BrandKycStep = ReturnType<typeof useBrandKycStep>;
