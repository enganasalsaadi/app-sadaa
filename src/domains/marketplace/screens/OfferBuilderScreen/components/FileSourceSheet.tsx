import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BriefFileSourceSheet } from '../../../components/brief/BriefFileSourceSheet';
import { useOfferBuilder } from '../OfferBuilderContext';

/** The offer's «photos or documents» sheet: the shared brief sheet bound to the builder's state. */
const FileSourceSheetComponent: React.FC = () => {
  const { t } = useTranslation();
  const { sheet, closeSheet, chooseFileSource, onFilesSheetDismissed } = useOfferBuilder();
  return (
    <BriefFileSourceSheet
      visible={sheet === 'files'}
      onClose={closeSheet}
      body={t('marketplace.offer.brief.files.sheetBody')}
      onChoose={chooseFileSource}
      onDismissed={onFilesSheetDismissed}
    />
  );
};

export const FileSourceSheet = memo(FileSourceSheetComponent);
