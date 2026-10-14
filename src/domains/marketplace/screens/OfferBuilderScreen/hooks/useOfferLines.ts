import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import type { AddonType } from '@/core/api';
import { toastService } from '@/core/toast';
import { DEAL_OFFER_LIMITS } from '../../../constants/dealOffer';
import { countDeliverables, hasRush, type OfferFormValues, type OfferLineValue } from '../../../utils/offerForm';
import { rushPlanFor, type OfferService } from '../../../utils/offerServices';

/**
 * Editing the offer's lines: pick / unpick a service, its quantity (≤ 10 per line, ≤ 20
 * deliverables per offer, the server's caps) and its add-ons; rush delivery on every line at
 * once. Pick order is kept; every change re-prices through the quote.
 */
export const useOfferLines = (
  form: UseFormReturn<OfferFormValues>,
  lines: OfferLineValue[],
  services: readonly OfferService[],
) => {
  const { t } = useTranslation();
  const { setValue } = form;
  const total = countDeliverables(lines);

  const commit = useCallback(
    (next: OfferLineValue[]) => setValue('lines', next, { shouldValidate: next.length > 0 || lines.length > 0 }),
    [lines.length, setValue],
  );

  const toggleService = useCallback(
    (rateCardId: string) => {
      if (lines.some(line => line.rateCardId === rateCardId)) {
        commit(lines.filter(line => line.rateCardId !== rateCardId));
        return;
      }
      if (total >= DEAL_OFFER_LIMITS.maxItemsPerDeal) {
        toastService.info(t('marketplace.offer.services.dealCapToast', { max: DEAL_OFFER_LIMITS.maxItemsPerDeal }));
        return;
      }
      // A new line joins the offer's pace: rushed offers rush it too when the card can.
      const rush = hasRush(lines) && services.some(
        service => service.rateCardId === rateCardId && service.addons.some(addon => addon.type === 'rush_delivery'),
      );
      commit([...lines, { rateCardId, quantity: 1, addons: rush ? ['rush_delivery'] : [] }]);
    },
    [commit, lines, services, t, total],
  );

  const setQuantity = useCallback(
    (rateCardId: string, quantity: number) => {
      const line = lines.find(entry => entry.rateCardId === rateCardId);
      if (!line) return;
      const room = DEAL_OFFER_LIMITS.maxItemsPerDeal - (total - line.quantity);
      if (quantity > room) {
        toastService.info(t('marketplace.offer.services.dealCapToast', { max: DEAL_OFFER_LIMITS.maxItemsPerDeal }));
        return;
      }
      const next = Math.min(Math.max(quantity, 1), DEAL_OFFER_LIMITS.maxQuantityPerLine);
      commit(lines.map(entry => (entry.rateCardId === rateCardId ? { ...entry, quantity: next } : entry)));
    },
    [commit, lines, t, total],
  );

  /** Most a line may hold right now (its own cap, and what's left of the offer's). */
  const maxQuantity = useCallback(
    (line: OfferLineValue) =>
      Math.min(DEAL_OFFER_LIMITS.maxQuantityPerLine, DEAL_OFFER_LIMITS.maxItemsPerDeal - (total - line.quantity)),
    [total],
  );

  const toggleAddon = useCallback(
    (rateCardId: string, type: AddonType) => {
      commit(
        lines.map(line => {
          if (line.rateCardId !== rateCardId) return line;
          const on = line.addons.includes(type);
          return { ...line, addons: on ? line.addons.filter(addon => addon !== type) : [...line.addons, type] };
        }),
      );
    },
    [commit, lines],
  );

  const rushPlan = useMemo(
    () => rushPlanFor(services, lines.map(line => line.rateCardId)),
    [lines, services],
  );
  const rushOn = hasRush(lines);

  const setRush = useCallback(
    (on: boolean) => {
      commit(
        lines.map(line => {
          const withoutRush = line.addons.filter(addon => addon !== 'rush_delivery');
          const canRush = services.some(
            service => service.rateCardId === line.rateCardId && service.addons.some(a => a.type === 'rush_delivery'),
          );
          return { ...line, addons: on && canRush ? [...withoutRush, 'rush_delivery'] : withoutRush };
        }),
      );
      // Rush sets the pace: a requested deadline would contradict it.
      if (on) setValue('requestedDeliveryDays', null);
    },
    [commit, lines, services, setValue],
  );

  return { toggleService, setQuantity, maxQuantity, toggleAddon, rushPlan, rushOn, setRush, deliverables: total };
};

export type OfferLinesModel = ReturnType<typeof useOfferLines>;
