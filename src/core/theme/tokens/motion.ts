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
    /** Escrow ticket: one rise of the chevron toward the wallet (money arriving soon). */
    moneyRise: 1600,
    /** Creator Home pass: one sweep of light across the card, then a rest. */
    passSheen: 5200,
    /** Creator Home sign: one full sway of the sign hanging under the pass (a blocker waiting). */
    signSwing: 3400,
    /** Deal journey: one run of the comet from the current station to the next. */
    comet: 2600,
    /** Offer service card: one leg of the faint platform glyphs' drift (a picked card feels alive). */
    decorDrift: 8000,
    /** Deal decision bar: one breath of the ruler's tick for the hour running now. */
    rulerPulse: 1000,
  },
  /** One heart floating up off a service card the moment it is picked. */
  pickBurst: 900,
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
  /** Background glyphs behind content: felt, never read. `decorActive` on a selected surface. */
  decor: 0.09,
  decorActive: 0.14,
  /** How much of a deadline has gone, behind a deal's status line; its stripes while paused. */
  windowFill: 0.18,
  windowStripe: 0.16,
} as const;

/** Lucide `strokeWidth` steps; icons never pick their own. */
export const iconStroke = {
  thin: 1.5,
  regular: 2,
  bold: 2.5,
} as const;

export type MotionDurationToken = keyof typeof motion.duration;
