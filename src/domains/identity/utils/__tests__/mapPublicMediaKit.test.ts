import type { WithMeta } from '@/core/api';
import type { PublicMediaKit } from '../../types/mediaKit';
import { mapPublicMediaKit } from '../mapPublicMediaKit';

const kit: PublicMediaKit = {
  slug: 'anas',
  display_name: 'Anas Style',
  avatar_url: null,
  tier: null,
  tier_label: null,
  is_verified: false,
  niches: [],
  platforms: [],
  rate_cards: [],
  contract_terms: null,
  price_from_usd: null,
  bio: null,
  top_portfolio_items: [],
  offers_from_profile: null,
};

const response = (meta: WithMeta<PublicMediaKit>['meta']): WithMeta<PublicMediaKit> => ({
  data: kit,
  meta,
});

describe('mapPublicMediaKit', () => {
  it('reports the canonical slug when an old slug was opened', () => {
    const result = mapPublicMediaKit(response({ locale: 'en', canonical_slug: 'anas' }), 'old.anas');
    expect(result.canonicalSlug).toBe('anas');
    expect(result.kit).toBe(kit);
  });

  it('returns null when the requested slug is already canonical', () => {
    expect(
      mapPublicMediaKit(response({ locale: 'en', canonical_slug: 'anas' }), 'anas').canonicalSlug,
    ).toBeNull();
  });

  it('returns null when meta has no canonical slug', () => {
    expect(mapPublicMediaKit(response({ locale: 'en' }), 'anas').canonicalSlug).toBeNull();
  });
});
