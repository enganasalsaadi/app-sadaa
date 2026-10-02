import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { InfluencerWizardStackParamList } from '@/core/navigation';
import { useWizardHeader } from '@/shared/ui';
import { useInfluencerStep4KycMutation } from '../../../api';
import {
  INFLUENCER_KYC_ALLOWED_MIME_TYPES,
  INFLUENCER_KYC_MAX_FILE_BYTES,
  INFLUENCER_WIZARD_STEPS,
} from '../../../constants/influencerOnboarding';
import { useInfluencerOnboardingFlow } from '../../../hooks/useInfluencerOnboardingFlow';
import { useKycFilePicker } from '../../../hooks/useKycFilePicker';
import type { KycPickError } from '../../../hooks/useKycFilePicker';
import {
  createKycSkipForm,
  isKycAlreadySubmitted,
  toFormDataFile,
} from '../../../utils/kycSubmission';

type KycAction = 'upload' | 'skip';

const PICK_ERROR_KEY = {
  size: 'auth.influencerOnboarding.kyc.errors.size',
  type: 'auth.influencerOnboarding.kyc.errors.type',
  failed: 'auth.influencerOnboarding.kyc.errors.failed',
} as const satisfies Record<KycPickError, string>;

export const useInfluencerKycScreen = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<InfluencerWizardStackParamList, 'InfluencerKyc'>>();
  const [action, setAction] = useState<KycAction | null>(null);

  const front = useKycFilePicker({
    allowedMimeTypes: INFLUENCER_KYC_ALLOWED_MIME_TYPES,
    maxBytes: INFLUENCER_KYC_MAX_FILE_BYTES,
    fallbackName: t('auth.influencerOnboarding.kyc.frontFallbackName'),
  });
  const back = useKycFilePicker({
    allowedMimeTypes: INFLUENCER_KYC_ALLOWED_MIME_TYPES,
    maxBytes: INFLUENCER_KYC_MAX_FILE_BYTES,
    fallbackName: t('auth.influencerOnboarding.kyc.backFallbackName'),
  });

  const [submitKyc] = useInfluencerStep4KycMutation();
  const { runStep, isBusy, error } = useInfluencerOnboardingFlow('kyc');

  // Back edits rates: pop when underneath, otherwise (resumed here) swap it in.
  const onBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace('InfluencerRates', { fromBack: true });
  }, [navigation]);

  const step = INFLUENCER_WIZARD_STEPS.kyc;
  useWizardHeader({
    step: step.index,
    title: t(step.titleKey),
    subtitle: t(step.subtitleKey),
    onBack,
  });

  const submit = useCallback(
    async (kind: KycAction) => {
      setAction(kind);
      let formData = createKycSkipForm();
      if (kind === 'upload' && front.file && back.file) {
        formData = new FormData();
        formData.append('is_skipped', '0');
        formData.append('id_front', toFormDataFile(front.file));
        formData.append('id_back', toFormDataFile(back.file));
      }
      // Both outcomes complete onboarding. A retry after a timed-out upload
      // hits kyc_already_*: the ID is in, so finish as a skip (contract §16).
      await runStep(() => submitKyc(formData).unwrap(), {
        resubmit: err =>
          isKycAlreadySubmitted(err) ? () => submitKyc(createKycSkipForm()).unwrap() : null,
      });
      setAction(null);
    },
    [front.file, back.file, runStep, submitKyc],
  );

  const onUpload = useCallback(() => submit('upload'), [submit]);
  const onSkip = useCallback(() => submit('skip'), [submit]);

  return {
    front: {
      file: front.file,
      onPick: front.onPick,
      onRemove: front.onRemove,
      error: front.pickError ? t(PICK_ERROR_KEY[front.pickError]) : null,
    },
    back: {
      file: back.file,
      onPick: back.onPick,
      onRemove: back.onRemove,
      error: back.pickError ? t(PICK_ERROR_KEY[back.pickError]) : null,
    },
    canUpload: !!front.file && !!back.file,
    onUpload,
    onSkip,
    isUploading: isBusy && action === 'upload',
    isSkipping: isBusy && action === 'skip',
    isBusy,
    error,
  };
};
