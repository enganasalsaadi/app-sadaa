/** What the last successful `POST /user/devices` told the server (contract §11.1). */
export interface DeviceSyncState {
  token: string;
  /** Sent as `Accept-Language`: the server's push language for this device. */
  language: string;
  appVersion: string;
}

const isDeviceSyncState = (value: unknown): value is DeviceSyncState => {
  if (typeof value !== 'object' || value === null) return false;
  const state = value as Record<string, unknown>;
  return (
    typeof state.token === 'string' &&
    typeof state.language === 'string' &&
    typeof state.appVersion === 'string'
  );
};

/** Stored JSON → state; anything unreadable counts as never synced. */
export const parseDeviceSyncState = (raw: string | undefined): DeviceSyncState | null => {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isDeviceSyncState(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const needsDeviceSync = (
  current: DeviceSyncState,
  last: DeviceSyncState | null,
): boolean =>
  last === null ||
  last.token !== current.token ||
  last.language !== current.language ||
  last.appVersion !== current.appVersion;
