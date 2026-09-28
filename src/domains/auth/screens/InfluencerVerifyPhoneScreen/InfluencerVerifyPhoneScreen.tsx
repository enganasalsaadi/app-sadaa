import React from 'react';
import { PhoneVerifyStepView } from '../../components/PhoneVerifyStepView';
import { useInfluencerVerifyPhoneScreen } from './hooks/useInfluencerVerifyPhoneScreen';

export const InfluencerVerifyPhoneScreen: React.FC = () => {
  const step = useInfluencerVerifyPhoneScreen();
  return <PhoneVerifyStepView {...step} />;
};
