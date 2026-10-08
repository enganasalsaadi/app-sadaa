import { useState } from 'react';

/** Dev-only: one bounded count (1–14, like delivery days) plus one parked at its floor. */
export const useNumberStepperDemo = () => {
  const [days, setDays] = useState(5);
  const [copies, setCopies] = useState(1);

  return { days, setDays, copies, setCopies };
};
