// In-memory MMKV so storage-dependent modules load without the native (Nitro) module.
jest.mock('react-native-mmkv', () => {
  const createMMKV = () => {
    const store = new Map<string, string | number | boolean>();
    return {
      getString: (k: string) => store.get(k) as string | undefined,
      getNumber: (k: string) => store.get(k) as number | undefined,
      getBoolean: (k: string) => store.get(k) as boolean | undefined,
      set: (k: string, v: string | number | boolean) => {
        store.set(k, v);
      },
      remove: (k: string) => store.delete(k),
      contains: (k: string) => store.has(k),
      getAllKeys: () => [...store.keys()],
      clearAll: () => store.clear(),
    };
  };
  return { createMMKV };
});

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {},
}));
