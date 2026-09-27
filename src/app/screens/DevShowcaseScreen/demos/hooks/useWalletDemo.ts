import { useCallback, useEffect, useRef, useState } from 'react';

const MOCK_LATENCY_MS = 1200;

/** Money actions are mocked; the loading state is the part worth reviewing. */
export const useWalletDemo = () => {
  const [withdrawing, setWithdrawing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onWithdraw = useCallback(() => {
    setWithdrawing(true);
    timer.current = setTimeout(() => setWithdrawing(false), MOCK_LATENCY_MS);
  }, []);
  const onDeposit = useCallback(() => {}, []);

  return { withdrawing, onWithdraw, onDeposit };
};
