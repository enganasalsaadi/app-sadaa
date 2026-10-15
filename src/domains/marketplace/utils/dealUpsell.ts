import type { TFunction } from 'i18next';
import type { Deal, DealItem, DealUpsell } from '../types/deal';
import type { OfferService } from './offerServices';

interface DealUpsellsView {
  /** The one addendum waiting on the creator (`upsell_window.pending_upsell_id`, else the first pending). */
  pending: DealUpsell | null;
  /** Everything already answered, newest first. */
  history: DealUpsell[];
}

const proposedAt = (upsell: DealUpsell) => upsell.proposedAt ?? 0;

export const dealUpsellsView = (deal: Pick<Deal, 'upsells' | 'upsellWindow'>): DealUpsellsView => {
  const pendings = deal.upsells.filter(upsell => upsell.status.key === 'pending');
  const pending =
    pendings.find(upsell => upsell.id === deal.upsellWindow.pendingUpsellId) ?? pendings[0] ?? null;
  const history = deal.upsells
    .filter(upsell => upsell.id !== pending?.id)
    .sort((a, b) => proposedAt(b) - proposedAt(a));
  return { pending, history };
};

/** The upsell's tone on its row: accepted green, declined red, the rest (withdrawn, lapsed, voided) quiet. */
type DealUpsellTone = 'success' | 'danger' | 'neutral' | 'info';

export const dealUpsellTone = (upsell: Pick<DealUpsell, 'status'>): DealUpsellTone => {
  switch (upsell.status.key) {
    case 'accepted':
      return 'success';
    case 'declined':
      return 'danger';
    case 'pending':
      return 'info';
    case 'withdrawn':
    case 'lapsed':
    case 'voided':
    case null:
      return 'neutral';
    default: {
      const _exhaustive: never = upsell.status.key;
      return _exhaustive;
    }
  }
};

/**
 * Add-ons the brand can still buy on a deliverable: the ones its rate card offers that the item
 * doesn't already carry. No service = the card is gone from the creator's kit.
 */
export const itemAddonChoices = (
  item: Pick<DealItem, 'addons'>,
  service: OfferService | undefined,
): OfferService['addons'] => {
  if (!service) return [];
  const owned = new Set(item.addons.map(addon => addon.type));
  return service.addons.filter(addon => !owned.has(addon.type));
};

/** One line for an addendum: «Reel × 2», «Rush delivery · Reel», or the server's title as is. */
export const formatUpsellLine = (
  t: TFunction,
  upsell: Pick<DealUpsell, 'kind' | 'title' | 'quantity' | 'addon'>,
): string => {
  const title = upsell.title ?? t('marketplace.deals.changes.upsells.fallbackTitle');
  if (upsell.kind.key === 'addon' && upsell.addon) {
    return t('marketplace.deals.changes.upsells.addonLine', { label: upsell.addon.label, title });
  }
  if (upsell.kind.key === 'deliverable' && upsell.quantity !== null && upsell.quantity > 1) {
    return t('marketplace.deals.changes.upsells.line', { title, count: upsell.quantity });
  }
  return title;
};
