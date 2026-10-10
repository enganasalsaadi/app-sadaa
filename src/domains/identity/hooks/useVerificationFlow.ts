import { useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { baseApi, type AppApiError } from '@/core/api';
import type {
  BrandWizardStackParamList,
  SettingsStackParamList,
} from '@/core/navigation';
import { useAppDispatch } from '@/core/store';
import { useBrandKycStep } from '@/domains/auth';
import { useWizardHeader, type LayoutProps } from '@/shared/ui';

/**
 * Where a verification method screen runs and where it goes next. The same screens serve
 * the Settings stack (under the picker) and brand registration step 4 (inside WizardShell).
 */
export interface VerificationFlow {
  context: 'settings' | 'wizard';
  /** WizardShell step number; null in settings. */
  wizardStep: number | null;
  /** Header back once the screen has nothing of its own to undo. */
  leave: () => void;
  /** "Pick another way": back to the picker. */
  pickOther: () => void;
  /** The brand is verified (seen on screen, or a 409 `kyc_already_verified`). */
  onVerified: () => void;
  /** An attempt went in (documents or email sent). Wizard: the step is taken, move on. */
  onStarted: () => void;
  /** Wizard: move on to the welcome while an attempt stays pending. */
  onContinue: (() => void) | null;
  isContinuing: boolean;
  /** Wizard: why moving on failed (step write or progress read). */
  error: AppApiError | null;
}

const noop = () => undefined;

export const useSettingsVerificationFlow = (): VerificationFlow => {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();

  const leave = useCallback(() => navigation.goBack(), [navigation]);
  const pickOther = useCallback(
    () => navigation.popTo('CompanyVerification'),
    [navigation],
  );
  // `/me` and `/user/kyc` now say verified; the picker shows it.
  const onVerified = useCallback(() => {
    dispatch(baseApi.util.invalidateTags(['User', 'Kyc']));
    navigation.popTo('CompanyVerification');
  }, [dispatch, navigation]);

  return useMemo(
    () => ({
      context: 'settings',
      wizardStep: null,
      leave,
      pickOther,
      onVerified,
      onStarted: noop,
      onContinue: null,
      isContinuing: false,
      error: null,
    }),
    [leave, pickOther, onVerified],
  );
};

/** Registration: any started attempt (or a verification) takes the step; the status stays pending in the background. */
export const useWizardVerificationFlow = (): VerificationFlow => {
  const navigation =
    useNavigation<NativeStackNavigationProp<BrandWizardStackParamList>>();
  const { header, finish, isBusy, error } = useBrandKycStep();
  const step = header.step;

  const leave = useCallback(() => navigation.goBack(), [navigation]);
  const pickOther = useCallback(() => navigation.popTo('BrandKyc'), [navigation]);
  const proceed = useCallback(() => {
    finish();
  }, [finish]);

  return useMemo(
    () => ({
      context: 'wizard',
      wizardStep: step,
      leave,
      pickOther,
      onVerified: proceed,
      onStarted: proceed,
      onContinue: proceed,
      isContinuing: isBusy,
      error,
    }),
    [step, leave, pickOther, proceed, isBusy, error],
  );
};

interface VerificationChromeOptions {
  title: string;
  onBack: () => void;
}

/**
 * Screen chrome per context: a solid header in settings; in the wizard the title and back
 * go to the WizardShell hero (no-op outside a shell) and the sheet keeps the steps' padding.
 */
export const useVerificationChrome = (
  flow: VerificationFlow,
  { title, onBack }: VerificationChromeOptions,
): Pick<LayoutProps, 'header' | 'padding'> => {
  useWizardHeader({ step: flow.wizardStep ?? 1, title, onBack });
  return flow.context === 'wizard'
    ? { padding: { y: '2xl' } }
    : { header: { title, onBackPress: onBack } };
};
