import { useCallback, useState } from 'react';
import { errorCodes, isErrorWithCode, pick, types } from '@react-native-documents/picker';
import type { PickedFile } from '@/shared/ui';
import { formatFileSize } from '@/shared/utils';

export type KycPickError = 'size' | 'type' | 'failed';

interface KycFilePickerConfig {
  allowedMimeTypes: readonly string[];
  maxBytes: number;
  /** Shown when the picker returns no file name. */
  fallbackName: string;
}

/** One KYC document slot: pick, validate MIME + size client-side (rule 07), remove. */
export const useKycFilePicker = ({
  allowedMimeTypes,
  maxBytes,
  fallbackName,
}: KycFilePickerConfig) => {
  const [file, setFile] = useState<PickedFile | null>(null);
  const [pickError, setPickError] = useState<KycPickError | null>(null);

  const onPick = useCallback(async () => {
    setPickError(null);
    try {
      const [result] = await pick({ type: [types.pdf, types.images] });
      if (!result) return;
      const mime = result.type;
      if (!mime || !allowedMimeTypes.includes(mime)) {
        setPickError('type');
        return;
      }
      if ((result.size ?? 0) > maxBytes) {
        setPickError('size');
        return;
      }
      setFile({
        uri: result.uri,
        name: result.name ?? fallbackName,
        type: mime,
        sizeLabel: result.size ? formatFileSize(result.size) : undefined,
      });
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return;
      setPickError('failed');
    }
  }, [allowedMimeTypes, maxBytes, fallbackName]);

  const onRemove = useCallback(() => {
    setFile(null);
    setPickError(null);
  }, []);

  return { file, pickError, onPick, onRemove };
};

