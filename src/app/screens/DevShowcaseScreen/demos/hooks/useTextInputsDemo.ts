import { useState } from 'react';

export const useTextInputsDemo = () => {
  const [defaultValue, setDefaultValue] = useState('');
  const [errorValue, setErrorValue] = useState('');
  const [hintValue, setHintValue] = useState('');
  const [bioValue, setBioValue] = useState('');
  const [secureValue, setSecureValue] = useState('');
  const [multilineValue, setMultilineValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');

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
  };
};
