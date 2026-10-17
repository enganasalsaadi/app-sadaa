import React from 'react';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { moderateScale } from '@/core/theme';
import { Box, ErrorState, Layout, Skeleton } from '@/shared/ui';
import { CampaignInReview } from './components/CampaignInReview';
import { CampaignWizardDock } from './components/CampaignWizardDock';
import { CampaignWizardHeader } from './components/CampaignWizardHeader';
import { CampaignWizardStepBody } from './components/CampaignWizardStepBody';
import { LeaveSheet } from './components/LeaveSheet';
import { CampaignWizardContext } from './CampaignWizardContext';
import { useCampaignWizardScreen } from './hooks/useCampaignWizardScreen';

const COVER_HEIGHT = moderateScale(168);
const TITLE_HEIGHT = moderateScale(56);
const TEASER_HEIGHT = moderateScale(112);

/**
 * Brand → public campaign wizard: four steps under a navy rail (idea, requirements, money, review).
 * The draft saves itself as the brand types. Each step is its own scroll (keyed), so moving on
 * always starts at the top. Once sent, the same screen shows «in review» until the team decides.
 */
export const CampaignWizardScreen: React.FC = () => {
  const { t } = useTranslation();
  const model = useCampaignWizardScreen();
  const reduceMotion = useReducedMotion();
  const { ready, loadError, reload, onClose, step, inReview, live } = model;
  const loadingTitle = t(live ? 'marketplace.campaign.wizard.live.title' : 'marketplace.campaign.wizard.header.newTitle');

  let body: React.ReactNode;
  if (loadError) {
    body = (
      <Layout header={{ title: loadingTitle, backIcon: 'close', onBackPress: onClose }}>
        <ErrorState error={loadError} onRetry={reload} />
      </Layout>
    );
  } else if (!ready) {
    body = (
      <Layout header={{ title: loadingTitle, backIcon: 'close', onBackPress: onClose }}>
        <Box px="xl" py="xl" gap="2xl">
          <Skeleton width="100%" height={COVER_HEIGHT} borderRadius="xl" />
          <Skeleton width="100%" height={TITLE_HEIGHT} borderRadius="md" />
          <Skeleton width="100%" height={TEASER_HEIGHT} borderRadius="md" />
        </Box>
      </Layout>
    );
  } else if (inReview) {
    body = <CampaignInReview />;
  } else {
    body = (
      <Layout
        key={step}
        header={<CampaignWizardHeader />}
        footer={<CampaignWizardDock />}
        footerBehavior="divider"
      >
        <Animated.View entering={reduceMotion ? undefined : FadeIn}>
          <CampaignWizardStepBody step={step} />
        </Animated.View>
      </Layout>
    );
  }

  return (
    <CampaignWizardContext.Provider value={model}>
      {body}
      <LeaveSheet />
    </CampaignWizardContext.Provider>
  );
};
