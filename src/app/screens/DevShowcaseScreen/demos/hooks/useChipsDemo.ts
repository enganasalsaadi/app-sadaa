import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ParseKeys } from 'i18next';
import type { ChipGroupItem } from '@/shared/ui';

const CHIP_VALUES = ['fashion', 'food', 'tech', 'travel', 'beauty'] as const;
type ChipValue = (typeof CHIP_VALUES)[number];

const LABEL_KEY = {
  fashion: 'devShowcase.chips.fashion',
  food: 'devShowcase.chips.food',
  tech: 'devShowcase.chips.tech',
  travel: 'devShowcase.chips.travel',
  beauty: 'devShowcase.chips.beauty',
} as const satisfies Record<ChipValue, ParseKeys>;

export const useChipsDemo = () => {
  const { t } = useTranslation();
  const [multi, setMulti] = useState<ReadonlySet<string>>(
    () => new Set(['food']),
  );
  const [single, setSingle] = useState<string | null>(null);
  const [groupMulti, setGroupMulti] = useState<string[]>(['tech']);
  const [loading, setLoading] = useState(false);
  const [dateSet, setDateSet] = useState(false);

  const items = useMemo<ChipGroupItem[]>(
    () => CHIP_VALUES.map(value => ({ value, label: t(LABEL_KEY[value]) })),
    [t],
  );

  const toggleMulti = useCallback((value: string) => {
    setMulti(prev => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }, []);

  const toggleLoading = useCallback(() => setLoading(prev => !prev), []);
  const pickDate = useCallback(() => setDateSet(true), []);
  const clearDate = useCallback(() => setDateSet(false), []);

  return {
    items,
    multi,
    toggleMulti,
    single,
    setSingle,
    groupMulti,
    setGroupMulti,
    loading,
    toggleLoading,
    dateSet,
    pickDate,
    clearDate,
  };
};
