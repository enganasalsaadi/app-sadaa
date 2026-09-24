import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppDispatch } from '@/core/store';
import {
  showNetworkError,
  hideNetworkError,
} from '@/core/store';

export const useNetworkMonitor = (): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check connectivity immediately on mount
    NetInfo.fetch().then(state => {
      if (state.isConnected === false) {
        dispatch(showNetworkError({}));
      }
    });

    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected === false) {
        dispatch(showNetworkError({}));
      } else if (state.isConnected === true) {
        // hideNetworkError triggers the slide-out + any RTK Query refetchOnReconnect
        dispatch(hideNetworkError());
      }
      // isConnected === null means unknown — leave current state unchanged
    });

    return () => unsubscribe();
  }, [dispatch]);
};
