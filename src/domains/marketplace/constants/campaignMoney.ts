/** Server caps for pricing and seats (contract §3.2); shown as hints, checked by the server. */
export const CAMPAIGN_MONEY_LIMITS = {
  /** Dollars per seat (fixed price). */
  seatPriceMin: 5,
  seatPriceMax: 50_000,
  seatsMin: 1,
  seatsMax: 20,
} as const;

const HOUR_MS = 3_600_000;

/** Dates and gaps of the schedule (contract §3.2). */
export const CAMPAIGN_SCHEDULE = {
  /** The application deadline lies at most this far ahead. */
  deadlineMaxDays: 30,
  /** Kept off the 30-day edge: the server's clock reads a little later than the phone's. */
  deadlineEdgeMarginMs: HOUR_MS,
  deliveryDaysMin: 1,
  deliveryDaysMax: 90,
  /** Least time between the deadline and the drop: content only, or a product to ship first. */
  dropGapDigitalHours: 120,
  dropGapShippedHours: 240,
  /** Hours (Damascus) a drop can be set to; evenings are when audiences are online. */
  dropHours: [12, 15, 18, 20, 21, 22],
  dropHourDefault: 20,
  /** Syria keeps UTC+3 all year (no daylight saving since 2022); campaign dates read in Damascus time. */
  utcOffsetMs: 3 * HOUR_MS,
} as const;

/** Delivery windows offered as one tap; a duplicated draft with another value keeps it as an extra chip. */
export const CAMPAIGN_DELIVERY_DAY_PRESETS = [3, 5, 7, 10, 14, 21, 30, 60, 90] as const;
