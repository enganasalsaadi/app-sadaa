import { useState } from 'react';
import type { CountryCode } from 'libphonenumber-js';
import { DEFAULT_PHONE_COUNTRY } from '@/core/config';

export const useTextInputsDemo = () => {
  const [defaultValue, setDefaultValue] = useState('');
  const [errorValue, setErrorValue] = useState('');
  const [hintValue, setHintValue] = useState('');
  const [bioValue, setBioValue] = useState('');
  const [secureValue, setSecureValue] = useState('');
  const [multilineValue, setMultilineValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>(
    DEFAULT_PHONE_COUNTRY,
  );

  return {
    defaultValue,
    setDefaultValue,
    errorValue,
    setErrorValue,
    hintValue,
    setHintValue,
    bioValue,
    setBioValue,
    secureValue,
    setSecureValue,
    multilineValue,
    setMultilineValue,
    phoneValue,
    setPhoneValue,
    phoneCountry,
    setPhoneCountry,
  };
};
