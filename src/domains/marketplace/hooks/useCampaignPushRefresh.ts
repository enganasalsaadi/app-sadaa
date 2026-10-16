import { useEffect } from 'react';
import { baseApi } from '@/core/api';
import { notificationManager } from '@/core/notification';
import { useAppDispatch } from '@/core/store';
import { campaignPushTags } from '../utils/campaignPush';

/** Receiving or tapping a campaign push refetches the campaign and its lists (CM11: navigate, then refetch). */
export const useCampaignPushRefresh = (isAuthenticated: boolean) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    return notificationManager.registerPushListener(push => {
      const tags = campaignPushTags(push.target);
      if (tags.length > 0) dispatch(baseApi.util.invalidateTags([...tags]));
    });
  }, [dispatch, isAuthenticated]);
};
