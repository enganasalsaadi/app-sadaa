import type { AppConfig } from '@/core/api';
import { AppStatus } from '../../types';
import { resolveBootGate } from '../resolveBootGate';

const config = (overrides: Partial<AppConfig> = {}, app?: Partial<NonNullable<AppConfig['app']>>): AppConfig => ({
  app: { min_version: '1.0.0', latest_version: '1.2.0', force_update: false, ...app },
  support: { email: null, phone: null, whatsapp: null },
  urls: { privacy: '', terms: '' },
  ...overrides,
});

describe('resolveBootGate', () => {
  it('fails open without config', () => {
    expect(resolveBootGate(null, false, '1.0.0')).toEqual({ blocked: null, softUpdateVersion: null });
  });

  it('blocks on maintenance from a fresh config', () => {
    expect(resolveBootGate(config({ maintenance_mode: true }), true, '1.2.0').blocked).toBe(AppStatus.MAINTENANCE);
  });

  it('ignores a cached maintenance flag', () => {
    expect(resolveBootGate(config({ maintenance_mode: true }), false, '1.2.0').blocked).toBeNull();
  });

  it('maintenance wins over update required', () => {
    expect(resolveBootGate(config({ maintenance_mode: true }), true, '0.9.0').blocked).toBe(AppStatus.MAINTENANCE);
  });

  it('requires update below min_version, even from cache', () => {
    expect(resolveBootGate(config(), true, '0.9.9').blocked).toBe(AppStatus.UPDATE_REQUIRED);
    expect(resolveBootGate(config(), false, '0.9.9').blocked).toBe(AppStatus.UPDATE_REQUIRED);
  });

  it('requires update behind latest when force_update is on', () => {
    expect(resolveBootGate(config({}, { force_update: true }), true, '1.1.0').blocked).toBe(AppStatus.UPDATE_REQUIRED);
  });

  it('force_update does nothing when already on latest', () => {
    expect(resolveBootGate(config({}, { force_update: true }), true, '1.2.0')).toEqual({ blocked: null, softUpdateVersion: null });
  });

  it('offers a soft update behind latest', () => {
    expect(resolveBootGate(config(), true, '1.1.0')).toEqual({ blocked: null, softUpdateVersion: '1.2.0' });
  });

  it('no gate when the backend omits app or sends empty versions', () => {
    expect(resolveBootGate(config({ app: undefined }), true, '0.0.1').blocked).toBeNull();
    expect(resolveBootGate(config({}, { min_version: '', latest_version: '' }), true, '0.0.1')).toEqual({ blocked: null, softUpdateVersion: null });
  });
});
