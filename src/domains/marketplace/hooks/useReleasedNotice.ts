import { useEffect, useRef, useState } from 'react';
import { motion } from '@/core/theme';
import type { RestrictionNotice } from '../utils/restrictions';

/**
 * The moment a waybill lifts the lock (PC9.0): the owed-waybill notice just went away, so hand it
 * back for a beat and the banner shows its green «unlocked» face before folding. A ban that runs
 * out, or any other notice going away, is silent.
 */
export const useReleasedNotice = (notice: RestrictionNotice | null): RestrictionNotice | null => {
  const last = useRef<RestrictionNotice | null>(null);
  const [released, setReleased] = useState<RestrictionNotice | null>(null);

  useEffect(() => {
    if (notice) {
      last.current = notice;
      setReleased(null);
      return undefined;
    }
    const gone = last.current;
    last.current = null;
    if (gone?.kind !== 'return_pending') return undefined;
    setReleased(gone);
    const id = setTimeout(() => setReleased(null), motion.duration.unlockedHold);
    return () => clearTimeout(id);
  }, [notice]);

  return released;
};
