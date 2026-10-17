import React, { memo } from 'react';
import type { CampaignWizardStep } from '../../../types/campaignDraft';
import { CampaignStepSoon } from './CampaignStepSoon';
import { IdeaStep } from './IdeaStep';
import { MoneyStep } from './MoneyStep';
import { RequirementsStep } from './RequirementsStep';

/** The open step's body; a new step fails the build here until it has one. */
const CampaignWizardStepBodyComponent: React.FC<{ step: CampaignWizardStep }> = ({ step }) => {
  switch (step) {
    case 'idea':
      return <IdeaStep />;
    case 'requirements':
      return <RequirementsStep />;
    case 'money':
      return <MoneyStep />;
    case 'review':
      return <CampaignStepSoon />;
    default: {
      const _exhaustive: never = step;
      return _exhaustive;
    }
  }
};

export const CampaignWizardStepBody = memo(CampaignWizardStepBodyComponent);
