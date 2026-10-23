import { Linking, Platform, Share } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import i18n from '@/core/i18n';
import { permissionManager } from '@/core/permissions';
import { DownloadError } from './fileCache';
import type { RemoteFile, SaveTarget } from './downloadTypes';

// MediaStore writes without a storage permission only from Android 10 (API 29). The permission
// stays removed (store review), so Android 7–9 hands every file to another app instead.
const MEDIA_STORE_MIN_API = 29;
const ANDROID_FOLDER = 'Sada';
// Opens the Photos app on iOS; a fixed system scheme, never user input.
const IOS_PHOTOS_URL = 'photos-redirect://';

const isMedia = (file: RemoteFile): boolean => file.kind === 'image' || file.kind === 'video';

const hasMediaStore = (): boolean =>
  Platform.OS === 'android' && typeof Platform.Version === 'number' && Platform.Version >= MEDIA_STORE_MIN_API;

/** Can this file land in Photos / Downloads without a system sheet? Batches save only those. */
export const savesSilently = (file: RemoteFile): boolean =>
  Platform.OS === 'ios' ? isMedia(file) : hasMediaStore();

/**
 * Where a tap on «save» puts this file, for the button's words: Photos, Downloads (Android 10+),
 * Files (iOS share sheet) or another app (Android 7–9 «open with»).
 */
export type SaveDestination = 'photos' | 'downloads' | 'files' | 'sheet';

export const saveDestination = (file: RemoteFile): SaveDestination => {
  if (Platform.OS === 'ios') return isMedia(file) ? 'photos' : 'files';
  if (!hasMediaStore()) return 'sheet';
  return isMedia(file) ? 'photos' : 'downloads';
};

/** «Download all» is offered only where at least media saves silently (not on Android 7–9). */
export const canBatchSave = (): boolean => Platform.OS === 'ios' || hasMediaStore();

/** iOS add-only Photos access, asked once per save run (rule 07: at the point of use). */
export const ensureSaveAccess = async (files: readonly RemoteFile[]): Promise<boolean> => {
  if (Platform.OS !== 'ios' || !files.some(isMedia)) return true;
  const state = await permissionManager.requestPermissionWithExplanation('photosSave');
  return state.isGranted;
};

const saveToMediaStore = async (file: RemoteFile, path: string): Promise<SaveTarget> => {
  const collection = file.kind === 'image' ? 'Image' : file.kind === 'video' ? 'Video' : 'Download';
  await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
    { name: path.slice(path.lastIndexOf('/') + 1), parentFolder: ANDROID_FOLDER, mimeType: file.mime },
    collection,
    path,
  );
  return isMedia(file) ? 'photos' : 'downloads';
};

/** Photos (iOS media) or MediaStore (Android 10+). Throws `DownloadError('storage' | 'permission')`. */
export const saveSilently = async (file: RemoteFile, path: string): Promise<SaveTarget> => {
  try {
    if (Platform.OS === 'android') return await saveToMediaStore(file, path);
    await CameraRoll.saveAsset(`file://${path}`, { type: file.kind === 'video' ? 'video' : 'photo' });
    return 'photos';
  } catch {
    // CameraRoll rejects without access even after the prompt (user tapped «Don't Allow»).
    throw new DownloadError(Platform.OS === 'ios' ? 'permission' : 'storage');
  }
};

/**
 * The system sheet: iOS share sheet («Save to Files», other apps), Android «open with». Resolves
 * whether the user finished it (iOS); Android can't tell, a shown chooser counts.
 */
export const presentFileSheet = async (file: RemoteFile, path: string): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const result = await Share.share({ url: `file://${path}` });
    return result.action === Share.sharedAction;
  }
  await ReactNativeBlobUtil.android.actionViewIntent(path, file.mime, i18n.t('files.openWith'));
  return true;
};

/** «Open» on the saved toast: the Photos app (iOS) or the file in its viewer app (Android). */
export const openSavedFile = async (file: RemoteFile, path: string): Promise<void> => {
  if (Platform.OS === 'ios') {
    if (isMedia(file)) await Linking.openURL(IOS_PHOTOS_URL);
    return;
  }
  await ReactNativeBlobUtil.android.actionViewIntent(path, file.mime);
};
