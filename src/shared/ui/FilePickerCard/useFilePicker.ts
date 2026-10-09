import { useCallback, useState } from 'react';
import { errorCodes, isErrorWithCode, pick, types } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { formatFileSize } from '@/shared/utils';
import type { PickedFile } from './FilePickerCard';

export type FilePickError = 'size' | 'type' | 'failed';

/** `photos`: the photo library (receipt screenshots live there on iOS) · `files`: documents incl. PDF. */
export type FilePickSource = 'photos' | 'files';

export interface FilePickerConfig {
  allowedMimeTypes: readonly string[];
  maxBytes: number;
  /** Shown when the picker returns no file name. */
  fallbackName: string;
}

interface RawPick {
  uri: string;
  name: string | null | undefined;
  type: string | null | undefined;
  size: number | null | undefined;
}

/**
 * One upload slot (KYC document, top-up receipt): pick from files or photos, validate
 * MIME + size client-side (rule 07), remove. Photos keep their original quality: review
 * evidence is never recompressed. Neither picker needs a runtime permission.
 */
export const useFilePicker = ({ allowedMimeTypes, maxBytes, fallbackName }: FilePickerConfig) => {
  const [file, setFile] = useState<PickedFile | null>(null);
  const [pickError, setPickError] = useState<FilePickError | null>(null);

  const accept = useCallback(
    ({ uri, name, type, size }: RawPick) => {
      if (!type || !allowedMimeTypes.includes(type)) {
        setPickError('type');
        return;
      }
      if ((size ?? 0) > maxBytes) {
        setPickError('size');
        return;
      }
      setFile({
        uri,
        name: name || fallbackName,
        type,
        sizeLabel: size ? formatFileSize(size) : undefined,
      });
    },
    [allowedMimeTypes, maxBytes, fallbackName],
  );

  const onPick = useCallback(async () => {
    setPickError(null);
    try {
      const [result] = await pick({ type: [types.pdf, types.images] });
      if (!result) return;
      accept({ uri: result.uri, name: result.name, type: result.type, size: result.size });
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return;
      setPickError('failed');
    }
  }, [accept]);

  const onPickPhoto = useCallback(async () => {
    setPickError(null);
    try {
      const response = await launchImageLibrary({ mediaType: 'photo', quality: 1, selectionLimit: 1 });
      if (response.didCancel) return;
      const asset = response.assets?.[0];
      if (response.errorCode || !asset?.uri) {
        setPickError('failed');
        return;
      }
      accept({ uri: asset.uri, name: asset.fileName, type: asset.type, size: asset.fileSize });
    } catch {
      setPickError('failed');
    }
  }, [accept]);

  const pickFrom = useCallback(
    (source: FilePickSource) => (source === 'photos' ? onPickPhoto() : onPick()),
    [onPick, onPickPhoto],
  );

  const onRemove = useCallback(() => {
    setFile(null);
    setPickError(null);
  }, []);

  return { file, pickError, onPick, onPickPhoto, pickFrom, onRemove };
};
