import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/core/toast';

const HOUR = 60 * 60 * 1000;

export const useDealCardDemo = () => {
  const { t } = useTranslation();
  const { info } = useToast();
  const [dueAt] = useState(() => ({
    draft: Date.now() + 52 * HOUR,
    review: Date.now() + 6 * HOUR,
  }));
  const onPress = useCallback(() => info(t('devShowcase.dealCard.pressed')), [info, t]);
  return { dueAt, onPress };
};
