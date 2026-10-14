import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomSheet, Box, Tag } from '@/shared/ui';
import { useOfferBuilder } from '../OfferBuilderContext';
import { FileSourceTile } from './FileSourceTile';
import { SheetTitle } from './SheetTitle';

/** Photos or documents; the picker opens once the sheet is gone (iOS can't stack them). */
const FileSourceSheetComponent: React.FC = () => {
  const { t } = useTranslation();
  const { sheet, closeSheet, chooseFileSource, onFilesSheetDismissed } = useOfferBuilder();

  return (
    <BottomSheet visible={sheet === 'files'} onClose={closeSheet} onDismissed={onFilesSheetDismissed}>
      <Box px="xl" pb="2xl" gap="xl">
        <Box gap="sm">
          <SheetTitle
            title={t('marketplace.offer.brief.files.sheetTitle')}
            body={t('marketplace.offer.brief.files.sheetBody')}
          />
          <Box row gap="xs">
            <Tag label={t('marketplace.offer.brief.files.metaTypes')} />
            <Tag label={t('marketplace.offer.brief.files.metaSize')} />
          </Box>
        </Box>
        <Box row gap="md">
          <FileSourceTile source="photos" onChoose={chooseFileSource} />
          <FileSourceTile source="files" onChoose={chooseFileSource} />
        </Box>
      </Box>
    </BottomSheet>
  );
};

export const FileSourceSheet = memo(FileSourceSheetComponent);
