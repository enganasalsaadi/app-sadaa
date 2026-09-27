import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useBadgesDemo = () => {
  const { t } = useTranslation();
  const initialTags = useMemo(
    () => [
      t('devShowcase.chips.fashion'),
      t('devShowcase.chips.food'),
      t('devShowcase.chips.travel'),
    ],
    [t],
  );
  const [tags, setTags] = useState<readonly string[]>(initialTags);

  const removeTag = useCallback(
    (label: string) => setTags(prev => prev.filter(tag => tag !== label)),
    [],
  );
  const resetTags = useCallback(() => setTags(initialTags), [initialTags]);

  return { tags, removeTag, resetTags };
};
