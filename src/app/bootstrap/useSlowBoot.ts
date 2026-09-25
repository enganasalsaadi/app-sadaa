import { useEffect, useState } from 'react';

/** After this, swap the static native splash for the JS BootScreen (adds a spinner). */
const SLOW_BOOT_MS = 1500;

/** true once boot has been running longer than SLOW_BOOT_MS without finishing. */
export const useSlowBoot = (isReady: boolean): boolean => {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    if (isReady) {
      return undefined;
    }
    const id = setTimeout(() => setIsSlow(true), SLOW_BOOT_MS);
    return () => clearTimeout(id);
  }, [isReady]);

  return isSlow && !isReady;
};
