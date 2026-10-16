import { createContext, useContext } from 'react';
import type { CampaignWizardModel } from './hooks/useCampaignWizardScreen';

/** One wizard state for every part of the screen (header, steps, dock, sheets). */
export const CampaignWizardContext = createContext<CampaignWizardModel | null>(null);

export const useCampaignWizard = (): CampaignWizardModel => {
  const model = useContext(CampaignWizardContext);
  if (!model) throw new Error('useCampaignWizard outside CampaignWizardScreen');
  return model;
};
