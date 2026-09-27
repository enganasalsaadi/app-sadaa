// Shared motion rhythm: every animation in the app picks from these instead of
// ad-hoc numbers, so screens feel like one product (150–350ms, springs for
// anything spatial). Mode-independent, so it lives outside the Theme object.
export const motion = {
  duration: {
    fast: 150,
    base: 250,
    slow: 350,
    /** Skeleton pulse half-cycle. */
    pulse: 900,
  },
  spring: {
    damping: 18,
    stiffness: 180,
    mass: 1,
  },
  pressScale: 0.97,
} as const;

/** Mode-independent opacity steps for disabled / pressed feedback. */
export const opacity = {
  disabled: 0.5,
  pressed: 0.7,
  pressedSubtle: 0.85,
} as const;

/** Lucide `strokeWidth` steps; icons never pick their own. */
export const iconStroke = {
  thin: 1.5,
  regular: 2,
  bold: 2.5,
} as const;

export type MotionDurationToken = keyof typeof motion.duration;
