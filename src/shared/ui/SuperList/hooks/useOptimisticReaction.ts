import { useState, useCallback } from 'react';

export interface UseOptimisticReactionOptions {
  initialActive: boolean;
  initialCount?: number;
  onToggle: (isActive: boolean) => Promise<void>;
}

export interface UseOptimisticReactionReturn {
  isActive: boolean;
  count: number;
  toggle: () => Promise<void>;
  isPending: boolean;
}

/**
 * Optimistically updates like/favorite state before the server responds,
 * then rolls back on failure.
 */
export const useOptimisticReaction = ({
  initialActive,
  initialCount = 0,
  onToggle,
}: UseOptimisticReactionOptions): UseOptimisticReactionReturn => {
  const [isActive, setIsActive] = useState(initialActive);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);

  const toggle = useCallback(async () => {
    if (isPending) return;

    const nextActive = !isActive;
    const nextCount = nextActive ? count + 1 : Math.max(0, count - 1);

    setIsActive(nextActive);
    setCount(nextCount);
    setIsPending(true);

    try {
      await onToggle(nextActive);
    } catch {
      // Roll back optimistic update on failure
      setIsActive(isActive);
      setCount(count);
    } finally {
      setIsPending(false);
    }
  }, [isActive, count, isPending, onToggle]);

  return { isActive, count, toggle, isPending };
};
