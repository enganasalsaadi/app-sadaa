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
    /** A draft file «developing»: the veil easing to the next upload share. */
    develop: 400,
    /** The «handed in» seal turning once before it settles. */
    seal: 1600,
    /** A dispute's scales tipping once toward the side the ruling favoured. */
    tilt: 1400,
    /** A restriction's lock springing open once the waybill is in. */
    unlock: 260,
    /** The green «unlocked» banner stays this long before it folds away. */
    unlockedHold: 1400,
    /** A price tag swinging on its string once before it settles (Creator Home rates rail). */
    swing: 1600,
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
    /** Deal journey: one run of the comet from the current station to the next. */
    comet: 2600,
    /** Offer service card: one leg of the faint platform glyphs' drift (a picked card feels alive). */
    decorDrift: 8000,
    /** Deal decision bar: one breath of the ruler's tick for the hour running now. */
    rulerPulse: 1000,
    /** Dispute file: one leg of the scales' slow sway while the case is weighed. */
    scalesSway: 6000,
    /** Drop squad bar: one breath of a late creator's piece (their grace is running). */
    lateBlink: 1600,
    /** Return card: one ring breathing out of the parcel that still waits on the creator. */
    parcelPulse: 1800,
    /** Return card: one trip of the parcel along its route while it's on the way to the brand. */
    parcelTravel: 3200,
  },
  /** One heart floating up off a service card the moment it is picked. */
  pickBurst: 900,
  spring: {
    damping: 18,
    stiffness: 180,
    mass: 1,
  },
  /** The wax seal pressed onto a sealed rating: lands heavy, settles with one small give. */
  stampSpring: {
    damping: 11,
    stiffness: 170,
    mass: 1,
  },
  /** Tab rail, leading edge: darts to the pressed tab, barely any overshoot. */
  railLeadSpring: {
    damping: 26,
    stiffness: 420,
    mass: 1,
  },
  /** Tab rail, trailing edge: follows late with a rubbery give (the inchworm). */
  railTrailSpring: {
    damping: 13,
    stiffness: 150,
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
  /** The question cards still to come, peeking behind the one in front: nearest, then furthest. */
  deckNear: 0.75,
  deckFar: 0.45,
} as const;

/** Lucide `strokeWidth` steps; icons never pick their own. */
export const iconStroke = {
  thin: 1.5,
  regular: 2,
  bold: 2.5,
} as const;

export type MotionDurationToken = keyof typeof motion.duration;
