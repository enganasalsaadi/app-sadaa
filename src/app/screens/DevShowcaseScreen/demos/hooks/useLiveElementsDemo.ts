import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/core/toast';

export const useLiveElementsDemo = () => {
  const { t } = useTranslation();
  const { info } = useToast();
  // Remounting the run-once parts (rolling numbers, stagger) is the only way to replay them.
  const [runId, setRunId] = useState(0);
  const replay = useCallback(() => setRunId(id => id + 1), []);
  const onIslandPress = useCallback(() => info(t('devShowcase.live.islandPressed')), [info, t]);
  return { runId, replay, onIslandPress };
};
