import { useCallback, useState } from 'react';
import { useDisclosure } from '../../hooks/useDisclosure';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RANGE_DAYS = 7;

export const useDateRangeDemo = () => {
  const picker = useDisclosure();
  const [range, setRange] = useState(() => {
    const start = new Date();
    return {
      start,
      end: new Date(start.getTime() + DEFAULT_RANGE_DAYS * DAY_MS),
    };
  });

  const onConfirm = useCallback(
    (start: Date, end: Date) => setRange({ start, end }),
    [],
  );

  return { picker, range, onConfirm };
};
