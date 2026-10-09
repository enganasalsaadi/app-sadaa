import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { appStorage, StorageKeys } from '@/core/storage';

const readHidden = (): boolean => appStorage.get(StorageKeys.WALLET_AMOUNTS_HIDDEN) === 'true';

/**
 * The wallet's eye, remembered per device and shared by the wallet tab and the statement:
 * re-read on focus, so hiding amounts on one screen holds when the user goes back.
 */
export const useAmountsHidden = () => {
  const [hidden, setHidden] = useState(readHidden);

  useFocusEffect(
    useCallback(() => {
      setHidden(readHidden());
    }, []),
  );

  const toggleHidden = useCallback(() => {
    const next = !hidden;
    setHidden(next);
    appStorage.set(StorageKeys.WALLET_AMOUNTS_HIDDEN, next ? 'true' : 'false');
  }, [hidden]);

  return { hidden, toggleHidden };
};
