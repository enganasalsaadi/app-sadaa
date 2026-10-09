import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Images } from 'lucide-react-native';
import { BottomSheet, Box, ListGroup, ListRow, Text, type FilePickSource } from '@/shared/ui';

interface ReceiptSourceSheetProps {
  visible: boolean;
  onClose: () => void;
  onChoose: (source: FilePickSource) => void;
  /** Fires once the sheet is gone: the picker opens only then (iOS). */
  onDismissed: () => void;
}

/** Photos (where receipt screenshots live) or files (PDF). */
const ReceiptSourceSheetComponent: React.FC<ReceiptSourceSheetProps> = ({
  visible,
  onClose,
  onChoose,
  onDismissed,
}) => {
  const { t } = useTranslation();
  const choosePhotos = useCallback(() => onChoose('photos'), [onChoose]);
  const chooseFiles = useCallback(() => onChoose('files'), [onChoose]);

  return (
    <BottomSheet visible={visible} onClose={onClose} onDismissed={onDismissed}>
      <Box px="xl" pb="2xl" gap="lg">
        <Text variant="title" accessibilityRole="header">
          {t('finance.topUp.transfer.pickTitle')}
        </Text>
        <ListGroup>
          <ListRow icon={Images} title={t('finance.topUp.transfer.pickPhotos')} onPress={choosePhotos} />
          <ListRow icon={FileText} title={t('finance.topUp.transfer.pickFiles')} onPress={chooseFiles} />
        </ListGroup>
      </Box>
    </BottomSheet>
  );
};

export const ReceiptSourceSheet = memo(ReceiptSourceSheetComponent);
