import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CustomButton, FilePickerCard } from '@/shared/ui';
import { useFilePickerDemo } from './hooks/useFilePickerDemo';
import { MOCK_PICKED_FILE } from './mockData';

const FilePickerDemoComponent: React.FC = () => {
  const { t } = useTranslation();
  const { file, onPick, onRemove, showError, toggleError, uploadProgress, toggleUpload } =
    useFilePickerDemo();

  return (
    <Box gap="md">
      <FilePickerCard
        file={file}
        onPick={onPick}
        onRemove={onRemove}
        title={t('devShowcase.filePicker.title')}
        hint={t('devShowcase.filePicker.hint')}
        error={showError ? t('devShowcase.filePicker.error') : null}
      />
      <FilePickerCard
        file={MOCK_PICKED_FILE}
        onPick={onPick}
        onRemove={onRemove}
        title={t('devShowcase.filePicker.title')}
        hint={t('devShowcase.filePicker.hint')}
        uploadProgress={uploadProgress}
      />
      <FilePickerCard
        file={null}
        onPick={onPick}
        onRemove={onRemove}
        title={t('devShowcase.filePicker.title')}
        hint={t('devShowcase.filePicker.hint')}
        disabled
      />
      <CustomButton
        title={t('devShowcase.filePicker.toggleUpload')}
        onPress={toggleUpload}
        variant="ghost"
        size="sm"
      />
      <CustomButton
        title={t('devShowcase.filePicker.toggleError')}
        onPress={toggleError}
        variant="ghost"
        size="sm"
      />
    </Box>
  );
};

export const FilePickerDemo = memo(FilePickerDemoComponent);
