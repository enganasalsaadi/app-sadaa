import { needsDeviceSync, parseDeviceSyncState } from '../deviceSync';

const synced = { token: 'tok-1', language: 'ar', appVersion: '1.0.0' };

describe('parseDeviceSyncState', () => {
  it('reads a stored state', () => {
    expect(parseDeviceSyncState(JSON.stringify(synced))).toEqual(synced);
  });

  it('treats missing, corrupt or partial values as never synced', () => {
    expect(parseDeviceSyncState(undefined)).toBeNull();
    expect(parseDeviceSyncState('{not json')).toBeNull();
    expect(parseDeviceSyncState(JSON.stringify({ token: 'tok-1' }))).toBeNull();
    expect(parseDeviceSyncState('null')).toBeNull();
  });
});

describe('needsDeviceSync', () => {
  it('syncs when nothing was sent yet', () => {
    expect(needsDeviceSync(synced, null)).toBe(true);
  });

  it('skips an unchanged state', () => {
    expect(needsDeviceSync({ ...synced }, synced)).toBe(false);
  });

  it.each([
    ['token', { token: 'tok-2' }],
    ['language', { language: 'en' }],
    ['app version', { appVersion: '1.1.0' }],
  ])('syncs when the %s changes', (_, change) => {
    expect(needsDeviceSync({ ...synced, ...change }, synced)).toBe(true);
  });
});
