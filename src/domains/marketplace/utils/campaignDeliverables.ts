import type { CatalogService, RateCardCatalog } from '@/core/api';
import { CAMPAIGN_DELIVERABLE_LIMITS } from '../constants/campaignRequirements';
import type { CampaignDraftDeliverable } from '../types/campaignDraft';

const { units: MAX_UNITS, countMin, countMax, revisionsMin, revisionsMax } = CAMPAIGN_DELIVERABLE_LIMITS;

/** An add-on as a chip: its type and the catalog's own name for it. */
export interface CatalogAddonChoice {
  value: string;
  label: string;
}

/** One service a campaign can ask for, with the add-ons the catalog offers on it. */
export interface CatalogServiceChoice {
  key: string;
  label: string;
  addons: CatalogAddonChoice[];
}

export interface CatalogPlatformChoice {
  key: string;
  label: string;
  services: CatalogServiceChoice[];
}

const serviceChoice = (service: CatalogService, labels: ReadonlyMap<string, string>): CatalogServiceChoice => ({
  key: service.key,
  label: service.label,
  addons: service.addons.map(type => ({ value: type, label: labels.get(type) ?? type })),
});

/**
 * What the catalog lets a campaign ask for: per platform, its services. Platform-free services
 * (an on-site visit) aren't offered: the server refuses them in a campaign.
 */
export const catalogChoices = (catalog: RateCardCatalog | undefined): CatalogPlatformChoice[] => {
  const labels = new Map((catalog?.addons ?? []).map(addon => [addon.type, addon.label]));
  return (catalog?.platforms ?? [])
    .filter(platform => platform.services.length > 0)
    .map(platform => ({
      key: platform.key,
      label: platform.label,
      services: platform.services.map(service => serviceChoice(service, labels)),
    }));
};

export const deliverableKey = (line: Pick<CampaignDraftDeliverable, 'platform' | 'service'>): string =>
  `${line.platform}:${line.service}`;

export const hasDeliverable = (lines: readonly CampaignDraftDeliverable[], platform: string, service: string): boolean =>
  lines.some(line => line.platform === platform && line.service === service);

/** The campaign's total units per creator (every line's count added up). */
export const deliverableUnits = (lines: readonly CampaignDraftDeliverable[]): number =>
  lines.reduce((sum, line) => sum + line.count, 0);

/** A new line fits while at least one unit is left. */
export const canAddDeliverable = (lines: readonly CampaignDraftDeliverable[]): boolean =>
  deliverableUnits(lines) < MAX_UNITS;

/** Most a line's count may reach now: its own cap and what's left of the 20 units. */
export const maxDeliverableCount = (lines: readonly CampaignDraftDeliverable[], line: CampaignDraftDeliverable): number =>
  Math.min(countMax, MAX_UNITS - (deliverableUnits(lines) - line.count));

/** Adds a platform + service line (one unit, one revision's worth of nothing); unchanged when it's there or full. */
export const addDeliverable = (
  lines: readonly CampaignDraftDeliverable[],
  platform: string,
  service: string,
): CampaignDraftDeliverable[] => {
  if (hasDeliverable(lines, platform, service) || !canAddDeliverable(lines)) return [...lines];
  return [...lines, { platform, service, count: countMin, revisions: revisionsMin, addons: [] }];
};

export const removeDeliverable = (lines: readonly CampaignDraftDeliverable[], key: string): CampaignDraftDeliverable[] =>
  lines.filter(line => deliverableKey(line) !== key);

const patchDeliverable = (
  lines: readonly CampaignDraftDeliverable[],
  key: string,
  patch: (line: CampaignDraftDeliverable) => CampaignDraftDeliverable,
): CampaignDraftDeliverable[] => lines.map(line => (deliverableKey(line) === key ? patch(line) : line));

export const setDeliverableCount = (
  lines: readonly CampaignDraftDeliverable[],
  key: string,
  count: number,
): CampaignDraftDeliverable[] =>
  patchDeliverable(lines, key, line => ({
    ...line,
    count: Math.min(Math.max(count, countMin), maxDeliverableCount(lines, line)),
  }));

export const setDeliverableRevisions = (
  lines: readonly CampaignDraftDeliverable[],
  key: string,
  revisions: number,
): CampaignDraftDeliverable[] =>
  patchDeliverable(lines, key, line => ({
    ...line,
    revisions: Math.min(Math.max(revisions, revisionsMin), revisionsMax),
  }));

export const setDeliverableAddons = (
  lines: readonly CampaignDraftDeliverable[],
  key: string,
  addons: readonly string[],
): CampaignDraftDeliverable[] => patchDeliverable(lines, key, line => ({ ...line, addons: [...addons] }));

/** The platform and service names for a line, from the catalog; the raw keys when it doesn't know them. */
export const deliverableLabels = (
  choices: readonly CatalogPlatformChoice[],
  line: Pick<CampaignDraftDeliverable, 'platform' | 'service'>,
): { platform: string; service: string } => {
  const platform = choices.find(choice => choice.key === line.platform);
  return {
    platform: platform?.label ?? line.platform,
    service: platform?.services.find(entry => entry.key === line.service)?.label ?? line.service,
  };
};

/** The add-ons the catalog offers on this line's service, in its order; none when the catalog doesn't know it. */
export const serviceAddons = (
  choices: readonly CatalogPlatformChoice[],
  platform: string,
  service: string,
): CatalogAddonChoice[] =>
  choices.find(choice => choice.key === platform)?.services.find(entry => entry.key === service)?.addons ?? [];
