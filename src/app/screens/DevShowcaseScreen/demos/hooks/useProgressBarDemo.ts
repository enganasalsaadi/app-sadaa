import { useCallback, useState } from 'react';

const STEP = 0.2;

export const useProgressBarDemo = () => {
  const [value, setValue] = useState(0.4);
  // Wraps past 100% so one button walks through every fill level.
  const advance = useCallback(
    () => setValue(prev => (prev >= 1 ? 0 : Math.min(1, prev + STEP))),
    [],
  );
  return { value, advance };
};
