/** `m:ss` for countdowns (OTP resend, lookup throttle). */
export const formatClock = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
