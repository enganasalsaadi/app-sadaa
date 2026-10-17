import type { RateCardCatalog } from '@/core/api';
import type { CampaignDraftDeliverable } from '../../types/campaignDraft';
import {
  addDeliverable,
  canAddDeliverable,
  catalogChoices,
  deliverableUnits,
  hasDeliverable,
  maxDeliverableCount,
  removeDeliverable,
  serviceAddons,
  setDeliverableCount,
  setDeliverableRevisions,
  setDeliverableAddons,
  deliverableLabels,
} from '../campaignDeliverables';
import { pickGenders, toggleFollowerFloor } from '../campaignTargeting';

const line = (over: Partial<CampaignDraftDeliverable> = {}): CampaignDraftDeliverable => ({
  platform: 'instagram',
  service: 'reel',
  count: 1,
  revisions: 0,
  addons: [],
  ...over,
});

const catalog = {
  platforms: [
    {
      key: 'instagram',
      label: 'إنستغرام',
      services: [
        { key: 'reel', label: 'ريل', addons: ['link_in_bio', 'pin'] },
        { key: 'story', label: 'ستوري', addons: [] },
      ],
    },
    { key: 'empty', label: 'فارغة', services: [] },
  ],
  addons: [
    { type: 'link_in_bio', label: 'رابط في البايو' },
    { type: 'pin', label: 'تثبيت' },
  ],
  platform_agnostic_services: [{ key: 'on_site_visit', label: 'زيارة', addons: [] }],
} as unknown as RateCardCatalog;

describe('catalogChoices', () => {
  it('lists platforms with services and leaves platform-free services out', () => {
    const choices = catalogChoices(catalog);
    expect(choices.map(choice => choice.key)).toEqual(['instagram']);
    expect(choices[0]?.services.map(service => service.key)).toEqual(['reel', 'story']);
    expect(catalogChoices(undefined)).toEqual([]);
  });

  it('reads the add-ons a service offers', () => {
    const choices = catalogChoices(catalog);
    expect(serviceAddons(choices, 'instagram', 'reel')).toEqual([
      { value: 'link_in_bio', label: 'رابط في البايو' },
      { value: 'pin', label: 'تثبيت' },
    ]);
    expect(serviceAddons(choices, 'instagram', 'gone')).toEqual([]);
  });
});

describe('deliverable lines', () => {
  it('adds a line once and starts it at one unit, no revisions', () => {
    const once = addDeliverable([], 'instagram', 'reel');
    expect(once).toEqual([line()]);
    expect(addDeliverable(once, 'instagram', 'reel')).toEqual(once);
    expect(hasDeliverable(once, 'instagram', 'reel')).toBe(true);
    expect(hasDeliverable(once, 'tiktok', 'reel')).toBe(false);
  });

  it('stops adding at 20 units', () => {
    const full = [line({ count: 10 }), line({ service: 'story', count: 10 })];
    expect(deliverableUnits(full)).toBe(20);
    expect(canAddDeliverable(full)).toBe(false);
    expect(addDeliverable(full, 'tiktok', 'video')).toEqual(full);
  });

  it('keeps a count within 1–10 and within the units left', () => {
    const lines = [line({ count: 2 }), line({ service: 'story', count: 10 })];
    expect(maxDeliverableCount(lines, lines[0]!)).toBe(10);
    const tight = [line({ count: 2 }), line({ service: 'story', count: 10 }), line({ platform: 'tiktok', service: 'video', count: 6 })];
    expect(maxDeliverableCount(tight, tight[0]!)).toBe(4);
    expect(setDeliverableCount(tight, 'instagram:reel', 9)[0]?.count).toBe(4);
    expect(setDeliverableCount(tight, 'instagram:reel', 0)[0]?.count).toBe(1);
  });

  it('keeps revisions within 0–3', () => {
    const lines = [line()];
    expect(setDeliverableRevisions(lines, 'instagram:reel', 5)[0]?.revisions).toBe(3);
    expect(setDeliverableRevisions(lines, 'instagram:reel', -1)[0]?.revisions).toBe(0);
  });

  it('sets the add-ons of one line only and removes a line by its key', () => {
    const lines = [line(), line({ service: 'story' })];
    const on = setDeliverableAddons(lines, 'instagram:reel', ['pin']);
    expect(on[0]?.addons).toEqual(['pin']);
    expect(on[1]?.addons).toEqual([]);
    expect(removeDeliverable(lines, 'instagram:story')).toEqual([line()]);
  });

  it('names a line from the catalog, or by its keys when the catalog lacks it', () => {
    const choices = catalogChoices(catalog);
    expect(deliverableLabels(choices, line())).toEqual({ platform: 'إنستغرام', service: 'ريل' });
    expect(deliverableLabels(choices, line({ platform: 'tiktok', service: 'video' }))).toEqual({
      platform: 'tiktok',
      service: 'video',
    });
  });
});

describe('targeting picks', () => {
  it('keeps only known genders, in order', () => {
    expect(pickGenders(['female', 'male'])).toEqual(['male', 'female']);
    expect(pickGenders(['other'])).toEqual([]);
  });

  it('clears the follower floor when the chosen one is tapped again', () => {
    expect(toggleFollowerFloor(null, 5000)).toBe(5000);
    expect(toggleFollowerFloor(5000, 5000)).toBeNull();
    expect(toggleFollowerFloor(5000, 10000)).toBe(10000);
  });
});
