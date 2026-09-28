import React from 'react';
import { PhoneVerifyStepView } from '../../components/PhoneVerifyStepView';
import { useBrandVerifyPhoneScreen } from './hooks/useBrandVerifyPhoneScreen';

export const BrandVerifyPhoneScreen: React.FC = () => {
  const step = useBrandVerifyPhoneScreen();
  return <PhoneVerifyStepView {...step} />;
};
