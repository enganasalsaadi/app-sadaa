import { useState } from 'react';

export const useLayoutHeroSheetScreen = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  return { phone, setPhone, password, setPassword };
};
