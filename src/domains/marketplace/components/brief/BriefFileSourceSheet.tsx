import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomSheet, Box, Tag } from '@/shared/ui';
import type { BriefFileSource } from '../../utils/briefFiles';
import { SheetTitle } from '../SheetTitle';
import { BriefFileSourceTile } from './BriefFileSourceTile';

interface BriefFileSourceSheetProps {
  visible: boolean;
  onClose: () => void;
  /** One line on what happens to the file. */
  body: string;
  onChoose: (source: BriefFileSource) => void;
  /** After the sheet is gone: open the picker from here (iOS can't stack it on a dismissing modal). */
  onDismissed: () => void;
}

/** Photos or documents for a brief's reference files; the picker opens once the sheet is gone. */
const BriefFileSourceSheetComponent: React.FC<BriefFileSourceSheetProps> = ({ visible, onClose, body, onChoose, onDismissed }) => {
  const { t } = useTranslation();

  return (
    <BottomSheet visible={visible} onClose={onClose} onDismissed={onDismissed}>
      <Box px="xl" pb="2xl" gap="xl">
        <Box gap="sm">
          <SheetTitle
            title={t('marketplace.offer.brief.files.sheetTitle')}
            body={body}
          />
          <Box row gap="xs">
            <Tag label={t('marketplace.offer.brief.files.metaTypes')} />
            <Tag label={t('marketplace.offer.brief.files.metaSize')} />
          </Box>
        </Box>
        <Box row gap="md">
          <BriefFileSourceTile source="photos" onChoose={onChoose} />
          <BriefFileSourceTile source="files" onChoose={onChoose} />
        </Box>
      </Box>
    </BottomSheet>
  );
};

export const BriefFileSourceSheet = memo(BriefFileSourceSheetComponent);
