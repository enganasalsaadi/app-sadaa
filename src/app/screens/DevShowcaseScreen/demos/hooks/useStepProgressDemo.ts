import { useCallback, useState } from 'react';

export const STEP_DEMO_TOTAL = 4;

export const useStepProgressDemo = () => {
  const [current, setCurrent] = useState(1);
  const next = useCallback(
    () => setCurrent(prev => Math.min(prev + 1, STEP_DEMO_TOTAL)),
    [],
  );
  const prev = useCallback(() => setCurrent(p => Math.max(p - 1, 1)), []);
  return { current, next, prev };
};
