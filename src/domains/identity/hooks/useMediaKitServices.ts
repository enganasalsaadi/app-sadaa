import { useCallback, useMemo, useState } from 'react';
import type { PublicMediaKit } from '../types/mediaKit';
import { buildServiceGroups, sumSelectedPrices } from '../utils/mediaKitShowcase';
import type { LockableRateRow } from '../utils/rateRows';

/**
 * The kit's services as platform tabs, plus the brand's picks and their estimated total.
 * Picks live only on this screen; a refetch that drops a card drops its pick too.
 */
export const useMediaKitServices = (
  kit: PublicMediaKit | undefined,
  rateRows: readonly LockableRateRow[],
) => {
  const groups = useMemo(
    () => (kit ? buildServiceGroups(rateRows, kit.rate_cards) : []),
    [kit, rateRows],
  );
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [picked, setPicked] = useState<ReadonlySet<string>>(() => new Set());

  const activeGroup = groups.find(group => group.key === activeKey) ?? groups[0] ?? null;

  const selected = useMemo<ReadonlySet<string>>(() => {
    const live = new Set(groups.flatMap(group => group.services.map(service => service.key)));
    return new Set([...picked].filter(key => live.has(key)));
  }, [groups, picked]);

  const toggleService = useCallback((key: string) => {
    setPicked(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const total = useMemo(() => sumSelectedPrices(groups, selected), [groups, selected]);

  return {
    groups,
    activeGroup,
    onGroupChange: setActiveKey,
    selected,
    toggleService,
    total,
  };
};

export type MediaKitServicesModel = ReturnType<typeof useMediaKitServices>;
