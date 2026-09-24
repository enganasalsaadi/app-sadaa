import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface BottomBarContextValue {
  visible: boolean;
  hide: () => void;
  show: () => void;
}

const BottomBarContext = createContext<BottomBarContextValue | null>(null);

export const BottomBarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Reference count: bar is visible only when no screen has requested hiding.
  // Multiple screens can simultaneously call hide(); the bar only reappears
  // when every caller has unmounted (show() called from each cleanup).
  const [hideCount, setHideCount] = useState(0);

  const hide = useCallback(() => setHideCount(n => n + 1), []);
  const show = useCallback(() => setHideCount(n => Math.max(0, n - 1)), []);

  const value = useMemo(
    () => ({ visible: hideCount === 0, hide, show }),
    [hideCount, hide, show],
  );

  return (
    <BottomBarContext.Provider value={value}>
      {children}
    </BottomBarContext.Provider>
  );
};

export const useBottomBar = (): BottomBarContextValue => {
  const ctx = useContext(BottomBarContext);
  if (!ctx) throw new Error('useBottomBar must be used within BottomBarProvider');
  return ctx;
};

/**
 * Call inside any screen that should hide the FloatingBottomBar.
 * Increments a hide counter on mount and decrements on unmount.
 * Multiple screens stacking up (e.g. SearchScreen → RoomScreen) each hold
 * their own count, so back-navigating from RoomScreen leaves SearchScreen's
 * hide request intact — the bar stays hidden.
 */
export const useHideBottomBar = () => {
  const { hide, show } = useBottomBar();
  useEffect(() => {
    hide();
    return show;
  }, [hide, show]);
};
