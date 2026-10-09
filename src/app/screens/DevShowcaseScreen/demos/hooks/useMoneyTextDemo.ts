import { useState } from 'react';

export const useMoneyTextDemo = () => {
  const [hidden, setHidden] = useState(false);
  return { hidden, setHidden };
};
