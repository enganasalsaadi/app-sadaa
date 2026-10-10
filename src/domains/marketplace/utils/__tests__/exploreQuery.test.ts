import { buildExploreQuery, parseExploreParams } from '../exploreQuery';

const decode = (query: string) => decodeURIComponent(query);

describe('buildExploreQuery', () => {
  it('sends only per_page for empty filters on the first page', () => {
    expect(buildExploreQuery({}, null, 20)).toBe('per_page=20');
  });

  it('repeats array params as key[] and adds the cursor', () => {
    expect(decode(buildExploreQuery({ governorate: ['damascus', 'aleppo'] }, 'abc', 20))).toBe(
      'governorate[]=damascus&governorate[]=aleppo&per_page=20&cursor=abc',
    );
  });

  it('maps every filter to its server key', () => {
    const query = decode(
      buildExploreQuery(
        {
          q: ' مطاعم ',
          platform: ['instagram'],
          niche: ['food'],
          tier: ['gold'],
          category: 'food_drink',
          minFollowers: 1000,
          maxFollowers: 50000,
          kycVerified: true,
          followersVerified: true,
          rush: true,
          onSite: true,
          maxDeliveryDays: 3,
          priceMin: 10,
          priceMax: 200,
          withinBudget: true,
          sort: 'followers_desc',
        },
        null,
        30,
      ),
    );
    expect(query.split('&')).toEqual([
      'q=مطاعم',
      'platform[]=instagram',
      'niche[]=food',
      'tier[]=gold',
      'category=food_drink',
      'min_followers=1000',
      'max_followers=50000',
      'max_delivery_days=3',
      'price_min=10',
      'price_max=200',
      'kyc_verified=1',
      'followers_verified=1',
      'rush=1',
      'on_site=1',
      'within_budget=1',
      'sort=followers_desc',
      'per_page=30',
    ]);
  });

  it('leaves out a one-letter search and false toggles', () => {
    expect(buildExploreQuery({ q: ' a ', rush: false, onSite: false }, null, 20)).toBe('per_page=20');
  });

  it('url-encodes values', () => {
    expect(buildExploreQuery({ q: 'a&b' }, 'x/y=', 20)).toBe('q=a%26b&per_page=20&cursor=x%2Fy%3D');
  });
});

describe('parseExploreParams', () => {
  it('reads server see_all params into app filters', () => {
    expect(
      parseExploreParams({
        'governorate[]': ['damascus'],
        platform: 'instagram',
        kyc_verified: true,
        rush: '1',
        on_site: false,
        max_delivery_days: '3',
        sort: 'newest',
      }),
    ).toEqual({
      governorate: ['damascus'],
      platform: ['instagram'],
      kycVerified: true,
      rush: true,
      maxDeliveryDays: 3,
      sort: 'newest',
    });
  });

  it('drops unknown keys and bad values', () => {
    expect(
      parseExploreParams({
        cursor: 'abc',
        per_page: 5,
        sort: 'cheapest',
        min_followers: 'many',
        niche: [{}, null],
        q: '  ',
      }),
    ).toEqual({});
  });

  it('round-trips through buildExploreQuery', () => {
    const filters = parseExploreParams({ niche: ['food', 'travel'], max_followers: 9000 });
    expect(decode(buildExploreQuery(filters, null, 20))).toBe(
      'niche[]=food&niche[]=travel&max_followers=9000&per_page=20',
    );
  });
});
