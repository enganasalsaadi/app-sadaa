import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { errorCodes, isErrorWithCode, pick, types } from '@react-native-documents/picker';
import type { BrandWizardStackParamList } from '@/core/navigation';
import { useWizardHeader } from '@/shared/ui';
import type { PickedFile } from '@/shared/ui';
import { formatFileSize } from '@/shared/utils';
import { useBrandStep3KycMutation } from '../../../api';
import {
  BRAND_WIZARD_STEPS,
  KYC_ALLOWED_MIME_TYPES,
  KYC_DOCUMENT_TYPE,
  KYC_MAX_FILE_BYTES,
} from '../../../constants/brandOnboarding';
import { useBrandOnboardingFlow } from '../../../hooks/useBrandOnboardingFlow';

type PickError = 'size' | 'type' | 'failed';
type KycAction = 'upload' | 'skip';

const PICK_ERROR_KEY = {
  size: 'auth.brandOnboarding.kyc.errors.size',
  type: 'auth.brandOnboarding.kyc.errors.type',
  failed: 'auth.brandOnboarding.kyc.errors.failed',
} as const satisfies Record<PickError, string>;

const isAllowedMime = (mime: string | null): mime is string =>
  !!mime && (KYC_ALLOWED_MIME_TYPES as readonly string[]).includes(mime);

export const useBrandKycScreen = () => {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<BrandWizardStackParamList, 'BrandKyc'>>();
  const [document, setDocument] = useState<PickedFile | null>(null);
  const [pickError, setPickError] = useState<PickError | null>(null);
  const [action, setAction] = useState<KycAction | null>(null);

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

  const onPick = useCallback(async () => {
    setPickError(null);
    try {
      const [result] = await pick({ type: [types.pdf, types.images] });
      if (!result) return;
      if (!isAllowedMime(result.type)) {
        setPickError('type');
        return;
      }
      if ((result.size ?? 0) > KYC_MAX_FILE_BYTES) {
        setPickError('size');
        return;
      }
      setDocument({
        uri: result.uri,
        name: result.name ?? t('auth.brandOnboarding.kyc.documentFallbackName'),
        type: result.type,
        sizeLabel: result.size ? formatFileSize(result.size) : undefined,
      });
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return;
      setPickError('failed');
    }
  }, [t]);

  const onRemove = useCallback(() => {
    setDocument(null);
    setPickError(null);
  }, []);

  const submit = useCallback(
    async (kind: KycAction) => {
      setAction(kind);
      const formData = new FormData();
      if (kind === 'upload' && document) {
        formData.append('kyc_document_type', KYC_DOCUMENT_TYPE);
        const file: FormDataValue = {
          uri: document.uri,
          name: document.name,
          type: document.type,
        };
        formData.append('kyc_document', file);
      }
      // Skip = same endpoint without a file; the server then completes onboarding.
      await runStep(() => uploadKyc(formData).unwrap());
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
