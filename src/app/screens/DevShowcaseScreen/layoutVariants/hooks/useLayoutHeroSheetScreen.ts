import { useState } from 'react';
import type { CountryCode } from 'libphonenumber-js';
import { DEFAULT_PHONE_COUNTRY } from '@/core/config';

export const useLayoutHeroSheetScreen = () => {
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState<CountryCode>(DEFAULT_PHONE_COUNTRY);
  const [password, setPassword] = useState('');
  return { phone, setPhone, country, setCountry, password, setPassword };
};
