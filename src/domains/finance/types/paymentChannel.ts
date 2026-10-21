/** The sections of the channel pickers, in this order unless the server orders them. */
export const PAYMENT_CHANNEL_GROUPS = ['exchange_office', 'e_wallet', 'bank'] as const;
export type PaymentChannelGroup = (typeof PAYMENT_CHANNEL_GROUPS)[number];

/**
 * A channel's server code (`syriatel_cash`). The set belongs to the market (`GET /markets/{code}`),
 * so it is never an enum here: names, icons and groups come from `usePaymentChannels`.
 */
export type PaymentChannel = string;
