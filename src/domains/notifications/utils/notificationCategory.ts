import type { ParseKeys } from 'i18next';

/** Client-side inbox filter: the server has no per-category switches, the `data.type` prefix is the category (contract §7). */
export const NOTIFICATION_CATEGORIES = ['all', 'campaigns', 'deals'] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const NOTIFICATION_CATEGORY_LABEL = {
  all: 'notifications.inbox.categories.all',
  campaigns: 'notifications.inbox.categories.campaigns',
  deals: 'notifications.inbox.categories.deals',
} as const satisfies Record<NotificationCategory, ParseKeys>;

export const isNotificationCategory = (value: string): value is NotificationCategory =>
  (NOTIFICATION_CATEGORIES as readonly string[]).includes(value);

const CATEGORY_PREFIX = {
  campaigns: 'campaign_',
  deals: 'deal_',
} as const satisfies Record<Exclude<NotificationCategory, 'all'>, string>;

export const inNotificationCategory = (type: string, category: NotificationCategory): boolean =>
  category === 'all' || type.startsWith(CATEGORY_PREFIX[category]);
