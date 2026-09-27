import { useState } from 'react';

export const useFormSectionDemo = () => {
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  return { name, setName, website, setWebsite };
};
