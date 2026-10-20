import type { ParseKeys } from 'i18next';

/** The two ways a brand can work with creators; the switch on Home explains the difference. */
export const TWO_WAYS = ['direct', 'campaign'] as const;
export type TwoWay = (typeof TWO_WAYS)[number];

export const TWO_WAYS_LABEL = {
  direct: 'marketplace.brandHome.twoWays.way.direct',
  campaign: 'marketplace.brandHome.twoWays.way.campaign',
} as const satisfies Record<TwoWay, ParseKeys>;

export const TWO_WAYS_CAPTION = {
  direct: 'marketplace.brandHome.twoWays.scene.directCaption',
  campaign: 'marketplace.brandHome.twoWays.scene.campaignCaption',
} as const satisfies Record<TwoWay, ParseKeys>;

export const TWO_WAYS_CTA = {
  direct: 'marketplace.brandHome.twoWays.cta.direct',
  campaign: 'marketplace.brandHome.twoWays.cta.campaign',
} as const satisfies Record<TwoWay, ParseKeys>;

interface TwoWaysRow {
  id: string;
  label: ParseKeys;
  copy: Record<TwoWay, ParseKeys>;
}

/** The comparison under the picture: who picks, what it costs, what it suits. */
export const TWO_WAYS_ROWS = [
  {
    id: 'who',
    label: 'marketplace.brandHome.twoWays.rows.who.label',
    copy: {
      direct: 'marketplace.brandHome.twoWays.rows.who.direct',
      campaign: 'marketplace.brandHome.twoWays.rows.who.campaign',
    },
  },
  {
    id: 'price',
    label: 'marketplace.brandHome.twoWays.rows.price.label',
    copy: {
      direct: 'marketplace.brandHome.twoWays.rows.price.direct',
      campaign: 'marketplace.brandHome.twoWays.rows.price.campaign',
    },
  },
  {
    id: 'fit',
    label: 'marketplace.brandHome.twoWays.rows.fit.label',
    copy: {
      direct: 'marketplace.brandHome.twoWays.rows.fit.direct',
      campaign: 'marketplace.brandHome.twoWays.rows.fit.campaign',
    },
  },
] as const satisfies readonly TwoWaysRow[];
