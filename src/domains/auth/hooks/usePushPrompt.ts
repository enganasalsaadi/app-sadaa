import { useCallback, useRef, useState } from 'react';
import {
  notificationManager,
  recordPushPromptDismissed,
  recordPushPromptShown,
  shouldAutoPrompt,
} from '@/core/notification';
import type { PushPermission } from '@/core/notification';

const UNAVAILABLE: PushPermission = 'unavailable';

/**
 * Soft push prompt before the OS dialog, for automatic triggers (welcome CTA).
 * Shown only while the OS can still ask, at most 3 times, 48h after a
 * "Not now". Whatever the answer, `onDone` runs once the sheet closes.
 */
export const usePushPrompt = () => {
  const [visible, setVisible] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const onDoneRef = useRef<(() => void) | null>(null);
  const enablingRef = useRef(false);

  const finish = useCallback(() => {
    setVisible(false);
    const done = onDoneRef.current;
    onDoneRef.current = null;
    done?.();
  }, []);

  const promptThen = useCallback(
    async (onDone: () => void) => {
      // A second tap while the permission is being read.
      if (onDoneRef.current) return;
      onDoneRef.current = onDone;
      const permission = await notificationManager.getPushPermission().catch(() => UNAVAILABLE);
      if (!shouldAutoPrompt(permission, Date.now())) {
        finish();
        return;
      }
      recordPushPromptShown();
      setVisible(true);
    },
    [finish],
  );

  const onEnable = useCallback(async () => {
    enablingRef.current = true;
    setIsEnabling(true);
    const permission = await notificationManager
      .requestPushPermission()
      .catch(() => UNAVAILABLE);
    enablingRef.current = false;
    setIsEnabling(false);
    // Declined in the OS dialog: same cooldown as "Not now".
    if (permission !== 'enabled') recordPushPromptDismissed(Date.now());
    finish();
  }, [finish]);

  const onNotNow = useCallback(() => {
    // The OS dialog is up; its answer closes the sheet.
    if (enablingRef.current) return;
    recordPushPromptDismissed(Date.now());
    finish();
  }, [finish]);

  return { promptThen, sheet: { visible, isEnabling, onEnable, onNotNow } };
};

export type PushPromptSheetState = ReturnType<typeof usePushPrompt>['sheet'];
