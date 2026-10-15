import { launchImageLibrary } from 'react-native-image-picker';
import type { UploadSource } from '@/core/upload';

/**
 * Screenshots from the photo library, at most `limit`, in original quality: they are evidence
 * and must stay readable (rule 07). `[]` when the user backs out; throws when the picker fails.
 */
export const pickScreenshots = async (
  limit: number,
): Promise<UploadSource[]> => {
  const response = await launchImageLibrary({
    mediaType: 'photo',
    quality: 1,
    assetRepresentationMode: 'current',
    selectionLimit: limit,
  });
  if (response.didCancel) return [];
  if (response.errorCode) throw new Error(response.errorCode);
  return (response.assets ?? []).flatMap<UploadSource>(asset =>
    asset.uri
      ? [
          {
            uri: asset.uri,
            name: asset.fileName ?? asset.uri,
            mime: asset.type ?? null,
            size: asset.fileSize ?? null,
          },
        ]
      : [],
  );
};
