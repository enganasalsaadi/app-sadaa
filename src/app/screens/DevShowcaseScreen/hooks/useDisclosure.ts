import { useCallback, useState } from 'react';

/** Open/close state for a demo overlay or toggle. */
export const useDisclosure = (initial = false) => {
  const [visible, setVisible] = useState(initial);
  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  const toggle = useCallback(() => setVisible(prev => !prev), []);
  return { visible, open, close, toggle };
};
