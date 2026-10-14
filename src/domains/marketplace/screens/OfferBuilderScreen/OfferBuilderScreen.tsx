import React from 'react';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { Layout } from '@/shared/ui';
import { BriefStep } from './components/BriefStep';
import { ContractSheet } from './components/ContractSheet';
import { DeliveryDaysSheet } from './components/DeliveryDaysSheet';
import { FileSourceSheet } from './components/FileSourceSheet';
import { HoldToSign } from './components/HoldToSign';
import { OfferBlocked } from './components/OfferBlocked';
import { OfferDock } from './components/OfferDock';
import { OfferGate } from './components/OfferGate';
import { OfferSentView } from './components/OfferSentView';
import { OfferTicketHeader } from './components/OfferTicketHeader';
import { PriceChangedSheet } from './components/PriceChangedSheet';
import { ReceiptSheet } from './components/ReceiptSheet';
import { ResumeSheet } from './components/ResumeSheet';
import { ReviewStep } from './components/ReviewStep';
import { ServicesStep } from './components/ServicesStep';
import { useOfferBuilderScreen } from './hooks/useOfferBuilderScreen';
import { OfferBuilderContext } from './OfferBuilderContext';

/**
 * Brand → creator direct offer: preflight gate, three steps under a navy ticket (services, brief,
 * review & hold-to-sign), then the «sent» stamp. Each step is its own scroll (keyed), so moving
 * on always starts at the top.
 */
export const OfferBuilderScreen: React.FC = () => {
  const model = useOfferBuilderScreen();
  const reduceMotion = useReducedMotion();
  const { phase, step, creatorName, onClose, onDone } = model;

  let body: React.ReactNode;
  if (phase === 'building') {
    body = (
      <Layout
        key={step}
        header={<OfferTicketHeader />}
        footer={step === 'review' ? <HoldToSign /> : <OfferDock />}
        footerBehavior={step === 'review' ? 'elevate' : 'divider'}
      >
        <Animated.View entering={reduceMotion ? undefined : FadeIn}>
          {step === 'services' ? <ServicesStep /> : step === 'brief' ? <BriefStep /> : <ReviewStep />}
        </Animated.View>
      </Layout>
    );
  } else if (phase === 'sent') {
    body = (
      <Layout header={{ title: creatorName, backIcon: 'close', onBackPress: onDone }}>
        <OfferSentView />
      </Layout>
    );
  } else {
    body = (
      <Layout header={{ title: creatorName, backIcon: 'close', onBackPress: onClose }}>
        {phase === 'blocked' ? <OfferBlocked /> : <OfferGate />}
      </Layout>
    );
  }

  return (
    <OfferBuilderContext.Provider value={model}>
      {body}
      <ReceiptSheet />
      <DeliveryDaysSheet />
      <ContractSheet />
      <FileSourceSheet />
      <PriceChangedSheet />
      <ResumeSheet />
    </OfferBuilderContext.Provider>
  );
};
