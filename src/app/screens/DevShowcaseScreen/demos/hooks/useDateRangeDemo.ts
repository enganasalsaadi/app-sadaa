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

  // `range="past"`: a statement period, up to today.
  const pastPicker = useDisclosure();
  const [pastRange, setPastRange] = useState(() => {
    const end = new Date();
    return {
      start: new Date(end.getTime() - DEFAULT_RANGE_DAYS * DAY_MS),
      end,
    };
  });
  const onConfirmPast = useCallback(
    (start: Date, end: Date) => setPastRange({ start, end }),
    [],
  );

  return { picker, range, onConfirm, pastPicker, pastRange, onConfirmPast };
};
