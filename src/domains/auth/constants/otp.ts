/** OTP limits, mirroring the server config (contract H3). */
export const OTP_RESEND_SECONDS = 60;
/** Wrong codes before the server kills the code; every later try is the same 422. */
export const OTP_MAX_WRONG_ATTEMPTS = 5;
export const OTP_TTL_MS = 15 * 60 * 1000;
