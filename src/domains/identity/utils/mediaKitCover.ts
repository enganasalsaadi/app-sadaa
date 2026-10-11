import type { Asset } from 'react-native-image-picker';

/** Contract §17.11: the server center-crops every cover to 1500×600. */
export const COVER_ASPECT_RATIO = 5 / 2;

/** Contract §17.11: jpeg/png/webp, ≤ 5 MB (and ≤ 6000 px, which the picker resize below keeps us under). */
const COVER_TYPES: readonly string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const COVER_MAX_BYTES = 5 * 1024 * 1024;

/** Downscaled on pick: a 5:2 strip never needs more, and it keeps the upload small on weak networks. */
export const COVER_PICK_EDGE = 3000;
export const COVER_PICK_QUALITY = 0.8;

/** Client mirror of the upload limits, for instant feedback; the server re-validates. */
export const isValidCoverAsset = (asset: Pick<Asset, 'type' | 'fileSize'>): boolean =>
  asset.type !== undefined &&
  COVER_TYPES.includes(asset.type) &&
  (asset.fileSize ?? 0) <= COVER_MAX_BYTES;

export const toCoverFormData = (asset: Asset & { uri: string }): FormData => {
  const formData = new FormData();
  const file: FormDataValue = {
    uri: asset.uri,
    name: asset.fileName ?? 'cover.jpg',
    type: asset.type ?? 'image/jpeg',
  };
  formData.append('cover', file);
  return formData;
};
