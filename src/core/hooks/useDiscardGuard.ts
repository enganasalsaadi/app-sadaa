import { useCallback, useRef, useState } from 'react';
import { useNavigation, usePreventRemove } from '@react-navigation/native';

type LeaveAction = Parameters<Parameters<typeof usePreventRemove>[1]>[0]['data']['action'];

/**
 * Holds back/swipe while a form has unsaved edits and asks first.
 * Pass `false` once a save succeeded so its own `goBack` isn't caught.
 */
export const useDiscardGuard = (hasUnsavedChanges: boolean) => {
  const navigation = useNavigation();
  const pending = useRef<LeaveAction | null>(null);
  const [visible, setVisible] = useState(false);

  usePreventRemove(hasUnsavedChanges, ({ data }) => {
    pending.current = data.action;
    setVisible(true);
  });

  const stay = useCallback(() => {
    pending.current = null;
    setVisible(false);
  }, []);

  const discard = useCallback(() => {
    const action = pending.current;
    pending.current = null;
    setVisible(false);
    if (action) navigation.dispatch(action);
  }, [navigation]);

  return { visible, stay, discard };
};

export type DiscardGuard = ReturnType<typeof useDiscardGuard>;
