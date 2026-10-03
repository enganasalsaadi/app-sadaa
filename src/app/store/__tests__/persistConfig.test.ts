import type { PersistedState } from 'redux-persist';
import { authPersistConfig } from '../persistConfig';

describe('authPersistConfig', () => {
  it('never persists the token: it lives only in encrypted authStorage', () => {
    expect(authPersistConfig.whitelist).not.toContain('token');
  });

  it('drops the token from state persisted by v1', async () => {
    const v1 = { user: null, token: 'token', isSuspended: false, _persist: { version: 1, rehydrated: true } };
    const migrated = await authPersistConfig.migrate?.(v1 as PersistedState, 2);

    expect(migrated).not.toHaveProperty('token');
    expect(migrated).toMatchObject({ user: null, isSuspended: false });
  });
});
