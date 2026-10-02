import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BrandWizardStackParamList } from '@/core/navigation';
import { useWizardHeader } from '@/shared/ui';
import { useBrandStep3KycMutation } from '../../../api';
import {
  BRAND_WIZARD_STEPS,
  KYC_ALLOWED_MIME_TYPES,
  KYC_DOCUMENT_TYPE,
  KYC_MAX_FILE_BYTES,
} from '../../../constants/brandOnboarding';
import { useBrandOnboardingFlow } from '../../../hooks/useBrandOnboardingFlow';
import { useKycFilePicker } from '../../../hooks/useKycFilePicker';
import type { KycPickError } from '../../../hooks/useKycFilePicker';
import {
  createKycSkipForm,
  isKycAlreadySubmitted,
  toFormDataFile,
} from '../../../utils/kycSubmission';

type KycAction = 'upload' | 'skip';

const PICK_ERROR_KEY = {
  size: 'auth.brandOnboarding.kyc.errors.size',
  type: 'auth.brandOnboarding.kyc.errors.type',
  failed: 'auth.brandOnboarding.kyc.errors.failed',
} as const satisfies Record<KycPickError, string>;

export const useBrandKycScreen = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<BrandWizardStackParamList, 'BrandKyc'>>();
  const [action, setAction] = useState<KycAction | null>(null);
  const {
    file: document,
    pickError,
    onPick,
    onRemove,
  } = useKycFilePicker({
    allowedMimeTypes: KYC_ALLOWED_MIME_TYPES,
    maxBytes: KYC_MAX_FILE_BYTES,
    fallbackName: t('auth.brandOnboarding.kyc.documentFallbackName'),
  });

  const [uploadKyc] = useBrandStep3KycMutation();
  const { runStep, isBusy, error } = useBrandOnboardingFlow('kyc');

  // Back always edits the profile: pop when it's underneath, otherwise
  // (resumed straight into KYC) swap it in with a pop animation.
  const onBack = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace('BrandProfile', { fromBack: true });
  }, [navigation]);

  const step = BRAND_WIZARD_STEPS.kyc;
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
      if (kind === 'upload' && document) {
        formData = new FormData();
        formData.append('is_skipped', '0');
        formData.append('kyc_document_type', KYC_DOCUMENT_TYPE);
        formData.append('kyc_document', toFormDataFile(document));
      }
      // Both outcomes complete onboarding. A retry after a timed-out upload
      // hits kyc_already_*: the document is in, so finish as a skip.
      await runStep(() => uploadKyc(formData).unwrap(), {
        resubmit: err =>
          isKycAlreadySubmitted(err) ? () => uploadKyc(createKycSkipForm()).unwrap() : null,
      });
      setAction(null);
    },
    [document, runStep, uploadKyc],
  );

  const onUpload = useCallback(() => submit('upload'), [submit]);
  const onSkip = useCallback(() => submit('skip'), [submit]);

  const pickErrorMessage = useMemo(
    () => (pickError ? t(PICK_ERROR_KEY[pickError]) : null),
    [pickError, t],
  );

  return {
    document,
    pickErrorMessage,
    onPick,
    onRemove,
    onUpload,
    onSkip,
    isUploading: isBusy && action === 'upload',
    isSkipping: isBusy && action === 'skip',
    isBusy,
    error,
  };
};
