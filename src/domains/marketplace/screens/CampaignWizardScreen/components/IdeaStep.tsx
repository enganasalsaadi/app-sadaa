import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CustomInput } from '@/shared/ui';
import { useCampaignWizard } from '../CampaignWizardContext';
import { ActivityTypeField } from './ActivityTypeField';
import { CampaignCoverField } from './CampaignCoverField';
import { CampaignField } from './CampaignField';

/**
 * Step 1, «the idea»: the cover, the name (it starts the draft), the activity type and the public
 * announcement every creator reads. Everything autosaves; only the name has to be there to move on.
 */
const IdeaStepComponent: React.FC = () => {
  const { t } = useTranslation();
  const { values, setTitle, setTeaser, titleRef, titleError, onTitleBlur, titleMax, teaserError, teaserMax } =
    useCampaignWizard();

  return (
    <Box px="xl" py="xl" gap="2xl">
      <CampaignField
        label={t('marketplace.campaign.wizard.idea.cover.label')}
        note={t('marketplace.campaign.wizard.idea.cover.note')}
      >
        <CampaignCoverField />
      </CampaignField>
      <CampaignField
        label={t('marketplace.campaign.wizard.idea.title.label')}
        note={t('marketplace.campaign.wizard.idea.title.note')}
      >
        <CustomInput
          ref={titleRef}
          value={values.title}
          onChangeText={setTitle}
          onBlur={onTitleBlur}
          error={titleError}
          placeholder={t('marketplace.campaign.wizard.idea.title.placeholder')}
          maxLength={titleMax}
          showCount
          returnKeyType="next"
          accessibilityLabel={t('marketplace.campaign.wizard.idea.title.label')}
        />
      </CampaignField>
      <CampaignField label={t('marketplace.campaign.wizard.idea.activity.label')}>
        <ActivityTypeField />
      </CampaignField>
      <CampaignField
        label={t('marketplace.campaign.wizard.idea.teaser.label')}
        tag={t('marketplace.campaign.wizard.idea.teaser.audience')}
      >
        <CustomInput
          value={values.teaser}
          onChangeText={setTeaser}
          error={teaserError}
          placeholder={t('marketplace.campaign.wizard.idea.teaser.placeholder')}
          multiline
          numberOfLines={5}
          maxLength={teaserMax}
          showCount
          accessibilityLabel={t('marketplace.campaign.wizard.idea.teaser.label')}
        />
      </CampaignField>
    </Box>
  );
};

export const IdeaStep = memo(IdeaStepComponent);
