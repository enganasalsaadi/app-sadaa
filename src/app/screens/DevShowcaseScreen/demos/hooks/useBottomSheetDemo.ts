import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SelectionItem } from '@/shared/ui';
import { useDisclosure } from '../../hooks/useDisclosure';

export const useBottomSheetDemo = () => {
  const { t } = useTranslation();
  const sheet = useDisclosure();
  const selection = useDisclosure();
  const [selected, setSelected] = useState<string | number | null>(null);

  const items = useMemo<SelectionItem[]>(
    () => [
      {
        label: t('devShowcase.modalsToasts.selectionOption1'),
        value: 'option1',
      },
      {
        label: t('devShowcase.modalsToasts.selectionOption2'),
        value: 'option2',
      },
      {
        label: t('devShowcase.modalsToasts.selectionOption3'),
        value: 'option3',
      },
    ],
    [t],
  );

  return { sheet, selection, selected, setSelected, items };
};
