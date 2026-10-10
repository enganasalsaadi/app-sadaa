import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BrandWizardStackParamList } from '@/core/navigation';
import { useBrandKycStep } from '@/domains/auth';
import { useWizardHeader } from '@/shared/ui';
import type { VerificationMethod } from '../../../constants/verificationMethods';

type Navigation = NativeStackNavigationProp<BrandWizardStackParamList, 'BrandKyc'>;

/**
 * Registration step 4: the four verification methods. Each opens its own screen in the
 * wizard and moves on from there once an attempt is in; Skip takes the step as is.
 */
export const useBrandVerificationStepScreen = () => {
  const navigation = useNavigation<Navigation>();
  const { header, finish, isBusy, error, backToProfile } = useBrandKycStep();

  useWizardHeader({ ...header, onBack: backToProfile });

  const onSelect = useCallback(
    (method: VerificationMethod) => {
      switch (method) {
        case 'registry':
          navigation.navigate('BrandKycDocument', { documentGroup: 'company' });
          return;
        case 'ownerId':
          navigation.navigate('BrandKycDocument', { documentGroup: 'owner' });
          return;
        case 'social':
          navigation.navigate('BrandSocialProof');
          return;
        case 'domain':
          navigation.navigate('BrandDomainEmail');
          return;
        default: {
          const _exhaustive: never = method;
          return _exhaustive;
        }
      }
    },
    [navigation],
  );

  const onSkip = useCallback(() => {
    finish();
  }, [finish]);

  return { onSelect, onSkip, isSkipping: isBusy, error };
};
