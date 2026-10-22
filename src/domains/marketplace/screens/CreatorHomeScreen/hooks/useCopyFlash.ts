import { useCallback, useEffect, useRef, useState } from 'react';

/** How long the copy key stays mint after a tap. */
const FLASH_MS = 1400;

/**
 * Runs `onCopy` and turns the key into a «copied» check for a moment, so the tap is answered
 * right where the finger is (the toast says it again for everyone else).
 */
export const useCopyFlash = (onCopy: () => void) => {
  const [flashing, setFlashing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(() => {
    onCopy();
    setFlashing(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlashing(false), FLASH_MS);
  }, [onCopy]);

  return { flashing, copy };
};
