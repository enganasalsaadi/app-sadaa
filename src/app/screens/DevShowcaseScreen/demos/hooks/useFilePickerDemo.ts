import { useCallback, useState } from 'react';
import type { PickedFile } from '@/shared/ui';
import { MOCK_PICKED_FILE } from '../mockData';

const MOCK_UPLOAD_PROGRESS = 0.6;

/** Picking is mocked: real screens open the document picker through `@/core/permissions`. */
export const useFilePickerDemo = () => {
  const [file, setFile] = useState<PickedFile | null>(null);
  const [showError, setShowError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const onPick = useCallback(() => setFile(MOCK_PICKED_FILE), []);
  const onRemove = useCallback(() => setFile(null), []);
  const toggleError = useCallback(() => setShowError(prev => !prev), []);
  const toggleUpload = useCallback(
    () => setUploadProgress(prev => (prev === null ? MOCK_UPLOAD_PROGRESS : null)),
    [],
  );

  return { file, onPick, onRemove, showError, toggleError, uploadProgress, toggleUpload };
};
