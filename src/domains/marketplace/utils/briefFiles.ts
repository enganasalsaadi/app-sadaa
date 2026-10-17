import { errorCodes, isErrorWithCode, pick, types } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import type { UploadEntry, UploadSource } from '@/core/upload';

/** Where a brief file comes from: the photo library, or the document picker (PDF / images). */
export type BriefFileSource = 'photos' | 'files';

/** A file already in a brief, as the tiles need it (a deal's and a campaign's both fit). */
export interface BriefFileInfo {
  id: string;
  name: string;
  mime: string;
  url: string | null;
}

/** One tile of the files block: a file already in the brief, or one still on its way. */
export type BriefFileRow =
  | { kind: 'attached'; key: string; file: BriefFileInfo }
  | { kind: 'upload'; key: string; entry: UploadEntry };

/** What the files block reads from either brief's attachments hook. */
export interface BriefFilesView {
  rows: readonly BriefFileRow[];
  count: number;
  canAdd: boolean;
  removeFile: (fileId: string) => void;
  removeUpload: (key: string) => void;
  retry: (key: string) => void;
}

/**
 * Opens the system picker for `source` and returns what was chosen, `[]` when the user backs
 * out. Original quality: reference images are never recompressed (rule 07). Anything else
 * (permission, native failure) rejects.
 */
export const pickBriefSources = async (source: BriefFileSource, limit: number): Promise<UploadSource[]> => {
  try {
    if (source === 'photos') {
      const response = await launchImageLibrary({ mediaType: 'photo', quality: 1, selectionLimit: limit });
      if (response.didCancel) return [];
      if (response.errorCode) throw new Error(response.errorCode);
      return (response.assets ?? []).flatMap(asset =>
        asset.uri
          ? [{ uri: asset.uri, name: asset.fileName ?? asset.uri, mime: asset.type ?? null, size: asset.fileSize ?? null }]
          : [],
      );
    }
    const files = await pick({ type: [types.pdf, types.images], allowMultiSelection: true });
    return files.map(file => ({ uri: file.uri, name: file.name ?? file.uri, mime: file.type, size: file.size }));
  } catch (err) {
    if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return [];
    throw err;
  }
};
