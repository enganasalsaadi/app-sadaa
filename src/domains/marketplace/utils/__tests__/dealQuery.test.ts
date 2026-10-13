import { buildDealUrl, buildDealsListUrl } from '../dealQuery';

describe('buildDealUrl', () => {
  it('routes each role to its own prefix', () => {
    expect(buildDealUrl({ role: 'brand', id: '01J' })).toBe('/brand/deals/01J');
    expect(buildDealUrl({ role: 'creator', id: '01J' })).toBe('/influencer/deals/01J');
  });

  it('appends an encoded sub path', () => {
    expect(buildDealUrl({ role: 'creator', id: '01J' }, 'items/i 1/publish')).toBe(
      '/influencer/deals/01J/items/i%201/publish',
    );
  });
});

describe('buildDealsListUrl', () => {
  it('sends statuses as repeated status[] keys', () => {
    expect(
      buildDealsListUrl({ role: 'brand', statuses: ['pending_influencer', 'in_progress'] }, 2),
    ).toBe('/brand/deals?status%5B%5D=pending_influencer&status%5B%5D=in_progress&page=2');
  });

  it('leaves the filter out for every status', () => {
    expect(buildDealsListUrl({ role: 'creator' }, 1)).toBe('/influencer/deals?page=1');
  });
});
