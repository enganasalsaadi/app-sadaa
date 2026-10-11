import type { ServiceGroup, ShowcaseService } from './mediaKitShowcase';

/** Tickets shown per platform before "All prices" takes over. */
export const MAX_SERVICES_PER_PLATFORM = 4;

/** What the button under the tickets does: open every price, go back to the filter, or nothing. */
export type RatesMoreAction = 'all' | 'byPlatform' | null;

export interface RatesView {
  services: ShowcaseService[];
  more: RatesMoreAction;
  /** Every service on the kit, for "All prices (N)". */
  totalCount: number;
}

/**
 * The tickets on screen. By platform: up to `MAX_SERVICES_PER_PLATFORM` of the active group,
 * with "All prices" when other platforms or more services exist. All: every service, in the
 * groups' order, with a way back only when there is a filter to go back to.
 */
export const buildRatesView = (
  groups: readonly ServiceGroup[],
  activeKey: string | null,
  showAll: boolean,
): RatesView => {
  const all = groups.flatMap(group => group.services);
  if (showAll) {
    return { services: all, more: groups.length > 1 ? 'byPlatform' : null, totalCount: all.length };
  }
  const active = groups.find(group => group.key === activeKey) ?? groups[0];
  if (!active) return { services: [], more: null, totalCount: 0 };
  const hasMore = groups.length > 1 || active.services.length > MAX_SERVICES_PER_PLATFORM;
  return {
    services: active.services.slice(0, MAX_SERVICES_PER_PLATFORM),
    more: hasMore ? 'all' : null,
    totalCount: all.length,
  };
};

/**
 * Delivery days that earn the "Fastest" badge: only when exactly one service is strictly the
 * quickest across the whole kit, so a lone ticket or a tie never claims it.
 */
export const uniqueFastestDays = (groups: readonly ServiceGroup[]): number | null => {
  const days = groups.flatMap(group => group.services.map(service => service.deliveryDays));
  if (days.length < 2) return null;
  const min = Math.min(...days);
  return days.filter(value => value === min).length === 1 ? min : null;
};
