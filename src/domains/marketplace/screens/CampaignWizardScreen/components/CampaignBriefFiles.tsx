import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BriefFileSourceSheet } from '../../../components/brief/BriefFileSourceSheet';
import { BriefFileTiles } from '../../../components/brief/BriefFileTiles';
import { useCampaignWizard } from '../CampaignWizardContext';

/** The brief's reference files (≤ 5): tiles, then the photos-or-documents sheet that adds one. */
const CampaignBriefFilesComponent: React.FC = () => {
  const { t } = useTranslation();
  const { brief } = useCampaignWizard();
  const { attachments, fileMax, openFilesSheet, closeFilesSheet, filesSheet, chooseFileSource, onFilesSheetDismissed } = brief;

  return (
    <>
      <BriefFileTiles
        attachments={attachments}
        max={fileMax}
        caption={t('marketplace.campaign.wizard.requirements.brief.sheet.filesCaption')}
        onAdd={openFilesSheet}
      />
      <BriefFileSourceSheet
        visible={filesSheet}
        onClose={closeFilesSheet}
        body={t('marketplace.campaign.wizard.requirements.brief.sheet.filesSheetBody')}
        onChoose={chooseFileSource}
        onDismissed={onFilesSheetDismissed}
      />
    </>
  );
};

export const CampaignBriefFiles = memo(CampaignBriefFilesComponent);
