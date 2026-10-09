/** How money moves between Sada and a user, both ways: top-ups (handoff §6) and payouts (§7). */
export const PAYMENT_CHANNELS = ['haram', 'fouad', 'syriatel_cash', 'mtn_cash', 'sham_cash', 'bank'] as const;
export type PaymentChannel = (typeof PAYMENT_CHANNELS)[number];

/** The channel pickers' sections, in this order unless the server orders them. */
export const PAYMENT_CHANNEL_GROUPS = ['exchange_office', 'e_wallet', 'bank'] as const;
export type PaymentChannelGroup = (typeof PAYMENT_CHANNEL_GROUPS)[number];
