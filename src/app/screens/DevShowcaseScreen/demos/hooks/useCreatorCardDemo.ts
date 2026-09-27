import { useCallback, useState } from 'react';

type CreatorId = 'lina' | 'omar';

/** Pressing a card toggles it in the comparison set, like brand matching. */
export const useCreatorCardDemo = () => {
  const [selected, setSelected] = useState<ReadonlySet<CreatorId>>(new Set(['lina']));
  const toggle = useCallback((id: CreatorId) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const toggleLina = useCallback(() => toggle('lina'), [toggle]);
  const toggleOmar = useCallback(() => toggle('omar'), [toggle]);

  return { linaSelected: selected.has('lina'), omarSelected: selected.has('omar'), toggleLina, toggleOmar };
};
