import { useCallback, useRef } from 'react';
import { Vibration } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HAPTIC_TAP_MS } from '@/core/config';
import { toastService } from '@/core/toast';
import { useSetCampaignBookmarkedMutation } from '../api/creatorCampaignsApi';
import type { CreatorCampaign } from '../types/campaign';

/**
 * The save flag on a campaign card or page: the flip is optimistic in every loaded copy (see the
 * endpoint), a refusal restores it and says so. One request per campaign at a time, so a quick
 * double tap can't land the two calls out of order.
 */
export const useCampaignBookmark = () => {
  const { t } = useTranslation();
  const [setBookmarked] = useSetCampaignBookmarkedMutation();
  const inFlight = useRef(new Set<string>());

  return useCallback(
    async (campaign: CreatorCampaign) => {
      const { id } = campaign;
      if (inFlight.current.has(id)) return;
      inFlight.current.add(id);
      if (!campaign.bookmarked) Vibration.vibrate(HAPTIC_TAP_MS);
      try {
        await setBookmarked({ id, bookmarked: !campaign.bookmarked }).unwrap();
      } catch {
        toastService.error(t('marketplace.campaign.feed.card.saveFailed'));
      } finally {
        inFlight.current.delete(id);
      }
    },
    [setBookmarked, t],
  );
};
