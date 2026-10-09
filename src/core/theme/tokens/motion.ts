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
    /** One-time reveals: a stage track drawing, a number rolling to its value. */
    draw: 1200,
    roll: 1100,
    /** Stagger rise of one section. */
    rise: 600,
  },
  /** Delay between siblings of a stagger rise. */
  stagger: 60,
  /**
   * The only loops in the app (rule 09 §3.1), each one meaning "live now".
   * Slow on purpose: they should be felt, not watched. Stopped under reduced motion.
   */
  loop: {
    /** One leg of a hero light's drift (it then eases back). */
    heroDrift: 18000,
    /** Status pulse: live island dot, current stage node, smart-border sheen step. */
    statusPulse: 2200,
    /** Money flow: one dot spacing travelled. */
    moneyFlow: 900,
    /** Smart border: one full turn of the sheen. */
    sheen: 8000,
  },
  spring: {
    damping: 18,
    stiffness: 180,
    mass: 1,
  },
  /** Bouncier spring for the tab-bar lens: liquid, a small overshoot. */
  lensSpring: {
    damping: 14,
    stiffness: 160,
    mass: 1,
  },
  pressScale: 0.96,
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
