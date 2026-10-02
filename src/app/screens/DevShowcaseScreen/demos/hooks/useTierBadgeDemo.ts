import { useDisclosure } from '../../hooks/useDisclosure';

export const useTierBadgeDemo = () => {
  const sheet = useDisclosure();
  return { sheet };
};
