import { useEffect, useRef } from 'react';
import { notificationManager } from '@/core/notification';
import { navigate } from '@/core/navigation';
import { useAppSelector } from '@/core/store';
import { selectUser } from '@/domains/auth';
import { resolveNotificationRoute, toTabParams } from '../utils/notificationRoute';

/**
 * Routes a tapped push to its screen (contract §11.2). Enable it only once the
 * signed-in tabs are mounted: a launch tap waits in the manager until then.
 */
export const usePushNavigation = (enabled: boolean) => {
  const userType = useAppSelector(selectUser)?.user_type ?? null;
  const userTypeRef = useRef(userType);
  userTypeRef.current = userType;

  useEffect(() => {
    if (!enabled) return undefined;
    let frame: number | undefined;
    const unsubscribe = notificationManager.registerOpenHandler(push => {
      const route = resolveNotificationRoute(push.target, userTypeRef.current);
      if (!route) return;
      // Next frame: on a launch tap the tab navigator mounts in the same commit.
      frame = requestAnimationFrame(() => navigate('Main', toTabParams(route)));
    });
    return () => {
      unsubscribe();
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [enabled]);
};
