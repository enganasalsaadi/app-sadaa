// Navy Trust palette — every hex is specified in .claude/rules/08-brand-identity.md.
// Raw colors live only in this file; components consume the semantic tree below.

/** `main` = fill / icon / border · `text` = text shade (≥ 4.5:1 on surface) · `soft` = tinted background. */
export interface HueColors {
  main: string;
  text: string;
  soft: string;
}

export const STATUS_TONES = [
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
] as const;
export type StatusTone = (typeof STATUS_TONES)[number];

/** Every hue group a tone-driven component (pill, notice, progress) can take. */
export const HUE_TONES = [
  ...STATUS_TONES,
  'brand',
  'interactive',
  'money',
  'premium',
] as const;
export type HueTone = (typeof HUE_TONES)[number];

export const BUTTON_COLOR_VARIANTS = [
  'primary',
  'secondary',
  'outline',
  'ghost',
  'danger',
  /** Primary CTA on navy brand surfaces (hero, onboarding) — navy primary vanishes there. */
  'onBrand',
  /** Secondary action on navy (wallet hero action row): glass fill + hairline, never on neutral bg. */
  'glass',
] as const;
export type ButtonColorVariant = (typeof BUTTON_COLOR_VARIANTS)[number];

export interface ButtonColors {
  bg: string;
  text: string;
  border: string;
}

export interface ThemeColors {
  brand: HueColors;
  interactive: HueColors;
  money: HueColors;
  premium: HueColors;
  status: Record<StatusTone, HueColors>;

  /** `transparent`: screen bg when a backdrop (HeroBackdrop) paints behind Layout. */
  layout: { base: string; divider: string; transparent: string };
  surface: { main: string; elevated: string };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    link: string;
    /** On teal / danger fills. */
    onAccent: string;
    /** On navy brand surfaces (hero, header) — light in both modes. */
    onBrand: string;
    /** Secondary text on navy brand surfaces and glass cards over them. */
    onBrandMuted: string;
  };
  /** `card`: hairline that stands in for the card shadow where a shadow can't read (dark). */
  border: { default: string; strong: string; card: string };
  icon: { primary: string; secondary: string; disabled: string };

  button: Record<ButtonColorVariant, ButtonColors>;

  /** Frosted-glass surfaces — only over the navy gradient, never on neutral bg. */
  glass: {
    fill: string;
    border: string;
    /** Icon badge inside a glass card. */
    badge: string;
    progressTrack: string;
    progressFill: string;
    /** Ambient backdrop glows (teal family) behind the glass cards. */
    glowPrimary: string;
    glowSecondary: string;
    /** Faint third hero light (v4): near-white in light mode, pale teal in dark. */
    glowHighlight: string;
    /** Icons on glass: interaction (teal) / money (mint) roles, tinted to read on navy. */
    iconInteractive: string;
    iconMoney: string;
    /** Ink on an `iconInteractive` fill (done step nodes on the offer rail). */
    onIconInteractive: string;
    /** Straight bottom edge of a navy bar where it meets the page. */
    hairline: string;
    /** Status dots on navy (live island): the dark-mode status shades, readable on the hero. */
    iconWarning: string;
    iconDanger: string;
  };

  navigation: {
    tabBar: {
      /** Docked bar surface (approved 2026-10-16); also the navigator's card colour. */
      background: string;
      /** Teal: the active icon (≥ 3:1 on `activeFill`) and the elastic rail on the top edge. */
      active: string;
      /** Active label (≥ 4.5:1 on `background`). */
      activeLabel: string;
      /** Squircle behind the active icon. */
      activeFill: string;
      /** Idle icon (≥ 3:1) and idle label (≥ 4.5:1) on `background`. */
      inactive: string;
      inactiveLabel: string;
      /** Soft glow under the rail. */
      railGlow: string;
      /** Upward shadow + 1px top rim that lift the bar off the page. */
      shadow: string;
      rim: string;
      /** Count on a tab (deals waiting on the user): amber, dark digits, ringed in `background`. */
      badge: string;
      onBadge: string;
    };
    bottomSheet: { background: string; handle: string };
  };
  form: {
    input: {
      background: string;
      placeholder: string;
      label: string;
      error: string;
      borderError: string;
    };
    switch: { trackOn: string; trackOff: string; thumb: string };
  };
  calendar: {
    edgeBg: string;
    edgeText: string;
    midBg: string;
    midText: string;
    todayBg: string;
    todayText: string;
    dayText: string;
    disabledText: string;
    monthText: string;
    sectionTitle: string;
  };
  gradients: {
    hero: string[];
    /** Dashboard hero under the drifting lights (v4): ends darker, the lights add the teal. */
    heroLive: string[];
    /** Soft wash at the top of screens (Layout backdrop="wash"). */
    screenWash: { colors: string[]; locations: number[] };
    /** Full-screen onboarding backdrop. */
    onboarding: string[];
    /** Soft mustard wash for verified / premium highlight cards (rule 08: never text-bearing mustard). */
    premium: string[];
    /** Bottom-up navy scrim over a photo, so white text reads on any image. */
    mediaScrim: { colors: string[]; locations: number[] };
    /** Short top shade over a photo for story bars and corner controls. */
    mediaTopShade: { colors: string[]; locations: number[] };
    /** Ring around a creator's round photo (new / recently viewed). */
    storyRing: string[];
  };
  /** Controls and text laid over photos (both modes: photos are never themed). */
  media: {
    /** Frosted dark chip / button fill over a photo. */
    glass: string;
    glassBorder: string;
    divider: string;
    /** Story progress bars. */
    bar: string;
    barActive: string;
    /** Darkens cards stacked behind the top one. */
    dim: string;
  };
  overlay: string;
  /** Full-screen photo/video viewer backdrop — black in both modes. */
  mediaBackdrop: string;
  /**
   * Logo drawn in code (Skia) on navy — the fixed 5-color logo palette
   * (rule 08), identical in both modes: start arcs BG, end arcs teal, mint dot.
   */
  logoOnBrand: { arcsStart: string; arcsEnd: string; dot: string };
  /**
   * Each social platform's own brand color(s), for marks drawn in code (follower share bar).
   * Fixed artwork like the logos themselves: identical in both modes. One stop = solid.
   */
  social: Record<'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'telegram' | 'website', string[]>;
  /** Media kit stage hero (approved 2026-10-11): vectors and lights over `gradients.heroLive`. */
  stage: {
    /** Dot grid in the top of the stage. */
    dot: string;
    /** Faint teal sound-wave lines. */
    line: string;
    /** Mustard sparkle crosses and the warm light. */
    spark: string;
    glowCool: string;
    glowWarm: string;
    /** Echo rings leaving the photo. */
    ring: string;
    /** The turning ring around the photo: teal → mustard → light teal. */
    ringSweep: string[];
    /** Initials disc when there is no photo. */
    monogram: string[];
    /** Glass pills on the stage (chips, platform tiles). */
    chip: string;
    /** Cover photo under the stage: how much of the navy covers its top (it fades to full navy lower down). */
    coverScrim: number;
  };
  /** Escrow card on navy: brand → Sada escrow → creator, three synced steps. */
  escrow: {
    node: string;
    vaultFill: string;
    vaultBorder: string;
    rail: string;
    railDot: string;
    coinHalo: string;
    stepIdle: string;
    stepIdleText: string;
    stepIdleBorder: string;
    stepSubtle: string;
    track: string;
    /** "Published" pill: white with a mint-green label in both modes. */
    doneBg: string;
    doneText: string;
  };
  /** Wallet tab (approved 2026-10-11): the balance dial on navy and the receipt slot of the activity tape. */
  wallet: {
    /** Empty ring under the arcs and the dotted bezel inside it. */
    dialTrack: string;
    dialBezel: string;
    /** Halo under the available arc. */
    dialGlow: string;
    /**
     * Resting strength of the escrow arc (faded mint) and the waiting arc (muted), and of every
     * arc the user didn't pick; a picked arc goes to full strength.
     */
    dialEscrowOpacity: number;
    dialWaitingOpacity: number;
    dialDimOpacity: number;
    /** Legend tile of the picked arc. */
    legendActive: string;
    /** The slot the activity tape comes out of, its inner shade and its lit lower lip. */
    slot: string;
    slotShade: string;
    slotRim: string;
    /** Shade the slot casts on the top of the tape. */
    tapeShade: string[];
    /** Peak opacity of the area under the earnings line. */
    chartFill: number;
  };
  /**
   * Profile hero (approved 2026-10-13): the completion orbit on navy, one ring at a time.
   * Steps are arcs (done / missing / KYC under review / KYC rejected); a complete, verified
   * profile collapses them into one mustard ring. Missing steps also sit on it as satellites.
   */
  profile: {
    orbitTrack: string;
    orbitDone: string;
    orbitPending: string;
    orbitRejected: string;
    orbitVerified: string;
    satellite: string;
    satelliteBorder: string;
    /** Rim around the photo in the orbit's centre. */
    faceRim: string;
    /** Percentage pill sitting on the bottom of the ring. */
    percentFill: string;
    percentText: string;
    /** Big platform mark behind a platform card's numbers. */
    watermarkOpacity: number;
    /** Brand visibility spotlight: the beam and the empty seats beside the brand. */
    spotlightBeam: string;
    spotlightSeat: string;
  };
  /**
   * Creator Home "storefront" (approved 2026-10-13): the tilted pass card on navy, the sign
   * hanging from it, the audience bar and the price tags in the body.
   */
  storefront: {
    /** Pass card face, top-start → bottom-end. */
    pass: string[];
    /** Hairline that catches the light along the pass edge. */
    passRim: string;
    /** Light sweeping across the pass: clear → teal → mustard → clear. */
    sheen: string[];
    /** Strings the sign hangs on. */
    string: string;
    /** Audience bar and swatches, one shade per platform in display order. */
    audience: string[];
    /** Soft shadow drawn under a price tag. */
    tagShadow: string;
  };
  /**
   * Deals (approved 2026-10-14): the journey orbit on the navy detail hero and the navy
   * «your turn» passes stacked behind the front one in the list.
   */
  deal: {
    /** Full journey ring and the arc drawn from the first station up to now. */
    orbitTrack: string;
    orbitArc: string;
    /** Inner ring: how much of the current station's window has gone. */
    windowTrack: string;
    windowFill: string;
    /** Stations not reached yet, and every ring of a stopped deal. */
    stationIdle: string;
    stopped: string;
    /** The comet heading for the next station. */
    comet: string;
    /** The two passes peeking behind the front «your turn» pass, nearest first. */
    passBehind: string[][];
  };
  /**
   * Draft rounds (P6): the creator's film contact sheet (sprocket holes, the navy veil a file
   * «develops» from while it uploads, the teal scan line at its edge) and the brand's review
   * stage (ticks under the video, played share, playhead, the amber note pins).
   */
  draft: {
    film: string;
    filmHole: string;
    filmBorder: string;
    veil: string;
    scan: string;
    addFill: string;
    tick: string;
    tickPlayed: string;
    playhead: string;
    pin: string;
    onPin: string;
  };
  /**
   * Going live (P7) over the navy hero: the «ON AIR» lamp dark and lit, the broadcast rings around
   * a handed-in post, the link well on glass, and the account badges (amber = not checked, teal =
   * matches the contract). Same in both modes: the hero is navy in both.
   */
  live: {
    lampOff: string;
    lampOffFill: string;
    lampOffBorder: string;
    lampOn: string;
    lampOnFill: string;
    ring: string;
    /** Faint broadcast circles behind the lamp. */
    wave: string;
    well: string;
    warnFill: string;
    warnBorder: string;
    warnText: string;
    okFill: string;
    okBorder: string;
    okText: string;
  };
  /**
   * Mutual rating (P10): your sealed envelope (navy, two faint flap folds), the wax seal pressed on
   * it (teal-light core to navy rim, a dashed inner ring), and the score pads' lifted shadow. Navy
   * in both modes, like the hero.
   */
  rating: {
    envelope: [string, string];
    fold: string;
    wax: [string, string, string];
    waxRim: string;
    padGlow: string;
    /** Questions already answered on the progress dashes. */
    dashDone: string;
  };
}

const NAVY = '#1C3349';
const NAVY_DEEP = '#0B1622';
const WHITE = '#FFFFFF';
const ON_TEAL_DARK = '#06121C';
const BG = '#F5F7F9';
const ON_BRAND_MUTED = '#C9D6E0';
const LOGO_ON_BRAND = { arcsStart: BG, arcsEnd: '#397D8C', dot: '#12B886' };
const SOCIAL = {
  instagram: ['#285AEB', '#D6249F', '#FD5949', '#FDF497'],
  facebook: ['#0866FF'],
  tiktok: ['#25F4EE', '#FE2C55'],
  youtube: ['#FF0000'],
  telegram: ['#26A5E4'],
  website: ['#6FC0CF'],
};
const STAGE = {
  dot: 'rgba(255, 255, 255, 0.12)',
  line: 'rgba(159, 211, 220, 0.14)',
  spark: 'rgba(217, 180, 106, 0.35)',
  glowCool: '#6FC0CF',
  glowWarm: '#D9B46A',
  ring: '#6FC0CF',
  ringSweep: ['#6FC0CF', '#D9B46A', '#9FD3DC', '#6FC0CF'],
  monogram: ['#27506A', NAVY],
  chip: 'rgba(255, 255, 255, 0.10)',
  coverScrim: 0.78,
};
const ESCROW = {
  node: 'rgba(255, 255, 255, 0.08)',
  vaultFill: 'rgba(61, 219, 165, 0.16)',
  vaultBorder: 'rgba(61, 219, 165, 0.5)',
  rail: 'rgba(255, 255, 255, 0.12)',
  railDot: 'rgba(255, 255, 255, 0.35)',
  coinHalo: 'rgba(61, 219, 165, 0.22)',
  stepIdle: '#1E3A50',
  stepIdleText: '#9FD3DC',
  stepIdleBorder: 'rgba(255, 255, 255, 0.18)',
  stepSubtle: 'rgba(201, 214, 224, 0.7)',
  track: 'rgba(255, 255, 255, 0.08)',
  doneBg: WHITE,
  doneText: '#087F5B',
};
/** The dial sits on the navy hero in both modes. */
const WALLET_DIAL = {
  dialTrack: 'rgba(255, 255, 255, 0.09)',
  dialBezel: 'rgba(255, 255, 255, 0.18)',
  dialGlow: 'rgba(61, 219, 165, 0.3)',
  dialEscrowOpacity: 0.42,
  dialWaitingOpacity: 0.7,
  dialDimOpacity: 0.15,
  legendActive: 'rgba(255, 255, 255, 0.2)',
};

/** The orbit sits on the navy hero in both modes. */
const PROFILE_ORBIT = {
  orbitTrack: 'rgba(255, 255, 255, 0.22)',
  orbitDone: '#6FC0CF',
  orbitPending: '#6CA6FF',
  orbitRejected: '#F97066',
  orbitVerified: '#E6C47E',
  satellite: 'rgba(255, 255, 255, 0.16)',
  satelliteBorder: 'rgba(255, 255, 255, 0.42)',
  faceRim: 'rgba(255, 255, 255, 0.9)',
  percentFill: '#F5F7F9',
  percentText: '#1C3349',
  watermarkOpacity: 0.07,
  spotlightBeam: 'rgba(246, 227, 180, 0.3)',
  spotlightSeat: 'rgba(255, 255, 255, 0.1)',
};

const DEAL_ORBIT = {
  orbitTrack: 'rgba(255, 255, 255, 0.14)',
  orbitArc: '#6FC0CF',
  windowTrack: 'rgba(255, 255, 255, 0.08)',
  windowFill: '#9FD3DC',
  stationIdle: 'rgba(255, 255, 255, 0.4)',
  stopped: 'rgba(255, 255, 255, 0.3)',
  comet: WHITE,
};
const DRAFT = {
  filmHole: 'rgba(255, 255, 255, 0.14)',
  filmBorder: 'rgba(255, 255, 255, 0.35)',
  veil: 'rgba(19, 38, 58, 0.72)',
  scan: '#6FC0CF',
  addFill: 'rgba(111, 192, 207, 0.18)',
  tick: 'rgba(255, 255, 255, 0.22)',
  tickPlayed: '#6FC0CF',
  playhead: WHITE,
  pin: '#FDB022',
  onPin: NAVY_DEEP,
};
const LIVE = {
  lampOff: 'rgba(255, 255, 255, 0.4)',
  lampOffFill: 'rgba(0, 0, 0, 0.12)',
  lampOffBorder: 'rgba(255, 255, 255, 0.22)',
  lampOn: '#6FC0CF',
  lampOnFill: 'rgba(111, 192, 207, 0.18)',
  ring: '#6FC0CF',
  wave: 'rgba(111, 192, 207, 0.18)',
  well: 'rgba(0, 0, 0, 0.18)',
  warnFill: 'rgba(253, 176, 34, 0.16)',
  warnBorder: 'rgba(253, 176, 34, 0.45)',
  warnText: '#FFD58A',
  okFill: 'rgba(111, 192, 207, 0.14)',
  okBorder: 'rgba(111, 192, 207, 0.35)',
  okText: '#BDE6EE',
};
const RATING = {
  envelope: ['#27506A', NAVY] as [string, string],
  fold: 'rgba(255, 255, 255, 0.12)',
  wax: ['#6FC0CF', '#27506A', NAVY] as [string, string, string],
  waxRim: 'rgba(255, 255, 255, 0.4)',
};
const STOREFRONT_SHEEN = [
  'rgba(159, 211, 220, 0)',
  'rgba(159, 211, 220, 0.5)',
  'rgba(217, 180, 106, 0.3)',
  'rgba(217, 180, 106, 0)',
];

const lightText = {
  primary: '#0F1D2B',
  secondary: '#475869',
  tertiary: '#667085',
};
const darkText = {
  primary: '#EAF0F5',
  secondary: '#A5B5C4',
  tertiary: '#8394A5',
};

const lightInteractive: HueColors = {
  main: '#397D8C',
  text: '#347482',
  soft: '#E3F0F2',
};
const darkInteractive: HueColors = {
  main: '#6FC0CF',
  text: '#6FC0CF',
  soft: '#16303A',
};

const lightStatus: Record<StatusTone, HueColors> = {
  success: { main: '#12A150', text: '#067647', soft: '#E7F6EC' },
  warning: { main: '#DC6803', text: '#B54708', soft: '#FEF0E6' },
  danger: { main: '#D92D20', text: '#B42318', soft: '#FDECEA' },
  info: { main: '#1570EF', text: '#175CD3', soft: '#E8F1FE' },
  neutral: { main: '#667085', text: '#667085', soft: '#F2F4F7' },
};
const darkStatus: Record<StatusTone, HueColors> = {
  success: { main: '#47CD89', text: '#47CD89', soft: '#0F2A1D' },
  warning: { main: '#FDB022', text: '#FDB022', soft: '#2E2210' },
  danger: { main: '#F97066', text: '#F97066', soft: '#2E1719' },
  info: { main: '#6CA6FF', text: '#6CA6FF', soft: '#12233D' },
  neutral: { main: '#98A2B3', text: '#98A2B3', soft: '#1E2A36' },
};

export const lightColors: ThemeColors = {
  brand: { main: NAVY, text: NAVY, soft: '#E6ECF2' },
  interactive: lightInteractive,
  money: { main: '#12B886', text: '#087F5B', soft: '#E3F8F0' },
  premium: { main: '#D9B46A', text: '#8A6A24', soft: '#FBF3E2' },
  status: lightStatus,

  layout: { base: '#F5F7F9', divider: '#DCE3EA', transparent: 'transparent' },
  surface: { main: WHITE, elevated: '#EDF1F4' },
  text: {
    ...lightText,
    link: lightInteractive.text,
    onAccent: WHITE,
    onBrand: WHITE,
    onBrandMuted: ON_BRAND_MUTED,
  },
  border: { default: '#DCE3EA', strong: '#C3CDD7', card: 'transparent' },
  icon: {
    primary: lightText.primary,
    secondary: lightText.secondary,
    disabled: lightText.tertiary,
  },

  button: {
    primary: { bg: NAVY, text: WHITE, border: NAVY },
    secondary: {
      bg: lightInteractive.soft,
      text: lightInteractive.text,
      border: lightInteractive.soft,
    },
    outline: {
      bg: 'transparent',
      text: lightInteractive.text,
      border: lightInteractive.main,
    },
    ghost: {
      bg: 'transparent',
      text: lightInteractive.text,
      border: 'transparent',
    },
    danger: {
      bg: lightStatus.danger.main,
      text: WHITE,
      border: lightStatus.danger.main,
    },
    onBrand: { bg: BG, text: NAVY, border: BG },
    glass: { bg: 'rgba(255, 255, 255, 0.15)', text: WHITE, border: 'rgba(255, 255, 255, 0.28)' },
  },

  glass: {
    fill: 'rgba(255, 255, 255, 0.15)',
    border: 'rgba(255, 255, 255, 0.28)',
    badge: 'rgba(255, 255, 255, 0.18)',
    progressTrack: 'rgba(255, 255, 255, 0.22)',
    progressFill: BG,
    glowPrimary: '#397D8C',
    glowSecondary: '#6FC0CF',
    glowHighlight: BG,
    iconInteractive: darkInteractive.main,
    iconMoney: '#3DDBA5',
    onIconInteractive: ON_TEAL_DARK,
    hairline: '#1E293B',
    iconWarning: darkStatus.warning.main,
    iconDanger: darkStatus.danger.main,
  },

  navigation: {
    tabBar: {
      background: WHITE,
      active: lightInteractive.main,
      activeLabel: lightInteractive.text,
      activeFill: lightInteractive.soft,
      inactive: lightText.tertiary,
      inactiveLabel: lightText.secondary,
      railGlow: 'rgba(57, 125, 140, 0.45)',
      shadow: 'rgba(15, 29, 43, 0.08)',
      rim: 'rgba(15, 29, 43, 0.05)',
      badge: darkStatus.warning.main,
      onBadge: ON_TEAL_DARK,
    },
    bottomSheet: { background: WHITE, handle: '#C3CDD7' },
  },
  form: {
    input: {
      background: WHITE,
      placeholder: lightText.tertiary,
      label: lightText.primary,
      error: lightStatus.danger.text,
      borderError: lightStatus.danger.main,
    },
    switch: {
      trackOn: lightInteractive.main,
      trackOff: '#C3CDD7',
      thumb: WHITE,
    },
  },
  calendar: {
    edgeBg: lightInteractive.main,
    edgeText: WHITE,
    midBg: lightInteractive.soft,
    midText: lightInteractive.text,
    todayBg: '#E6ECF2',
    todayText: NAVY,
    dayText: lightText.primary,
    disabledText: lightText.tertiary,
    monthText: lightText.primary,
    sectionTitle: lightText.secondary,
  },
  gradients: {
    hero: [NAVY, '#27506A', '#397D8C'],
    heroLive: [NAVY, '#22425C', '#27506A', '#2F6577'],
    screenWash: {
      colors: ['#E6ECF2', 'rgba(230, 236, 242, 0)'],
      locations: [0, 0.3],
    },
    onboarding: [NAVY, '#27506A', '#397D8C'],
    premium: ['#FDF8EE', '#F6E6C3'],
    mediaScrim: {
      colors: ['rgba(11, 22, 34, 0)', 'rgba(11, 22, 34, 0.6)', 'rgba(11, 22, 34, 0.95)'],
      locations: [0.36, 0.64, 1],
    },
    mediaTopShade: {
      colors: ['rgba(11, 22, 34, 0.45)', 'rgba(11, 22, 34, 0)'],
      locations: [0, 0.24],
    },
    storyRing: ['#6FC0CF', '#397D8C', NAVY],
  },
  media: {
    glass: 'rgba(11, 22, 34, 0.38)',
    glassBorder: 'rgba(255, 255, 255, 0.22)',
    divider: 'rgba(255, 255, 255, 0.18)',
    bar: 'rgba(255, 255, 255, 0.32)',
    barActive: '#FFFFFF',
    dim: '#0B1622',
  },
  overlay: 'rgba(11, 22, 34, 0.5)',
  mediaBackdrop: '#000000',
  logoOnBrand: LOGO_ON_BRAND,
  social: SOCIAL,
  stage: STAGE,
  escrow: ESCROW,
  wallet: {
    ...WALLET_DIAL,
    slot: NAVY,
    slotShade: 'rgba(0, 0, 0, 0.55)',
    slotRim: 'rgba(255, 255, 255, 0.6)',
    tapeShade: ['rgba(15, 29, 43, 0.12)', 'rgba(15, 29, 43, 0)'],
    chartFill: 0.32,
  },
  profile: PROFILE_ORBIT,
  storefront: {
    pass: [WHITE, '#F2F7F9', '#E3F0F2'],
    passRim: 'rgba(255, 255, 255, 0.6)',
    sheen: STOREFRONT_SHEEN,
    string: 'rgba(201, 214, 224, 0.75)',
    audience: [NAVY, '#397D8C', '#6FC0CF', '#9FD3DC', '#2D6B78', '#C9D6E0'],
    tagShadow: 'rgba(28, 51, 73, 0.14)',
  },
  deal: {
    ...DEAL_ORBIT,
    passBehind: [
      ['#27506A', '#397D8C'],
      ['#397D8C', '#6FC0CF'],
    ],
  },
  draft: { ...DRAFT, film: '#13263A' },
  live: LIVE,
  rating: { ...RATING, padGlow: 'rgba(57, 125, 140, 0.45)', dashDone: '#9FD3DC' },
};

export const darkColors: ThemeColors = {
  brand: { main: NAVY, text: darkText.primary, soft: '#16303A' },
  interactive: darkInteractive,
  money: { main: '#3DDBA5', text: '#3DDBA5', soft: '#0F2E2A' },
  premium: { main: '#E6C47E', text: '#E6C47E', soft: '#2E2716' },
  status: darkStatus,

  layout: { base: NAVY_DEEP, divider: '#22384C', transparent: 'transparent' },
  surface: { main: '#122131', elevated: '#182B3D' },
  text: {
    ...darkText,
    link: darkInteractive.text,
    onAccent: ON_TEAL_DARK,
    onBrand: BG,
    onBrandMuted: ON_BRAND_MUTED,
  },
  border: { default: '#22384C', strong: '#30495F', card: '#1B2B3C' },
  icon: {
    primary: darkText.primary,
    secondary: darkText.secondary,
    disabled: darkText.tertiary,
  },

  button: {
    primary: { bg: '#5FAFBF', text: ON_TEAL_DARK, border: '#5FAFBF' },
    secondary: {
      bg: darkInteractive.soft,
      text: darkInteractive.text,
      border: darkInteractive.soft,
    },
    outline: {
      bg: 'transparent',
      text: darkInteractive.text,
      border: darkInteractive.main,
    },
    ghost: {
      bg: 'transparent',
      text: darkInteractive.text,
      border: 'transparent',
    },
    danger: {
      bg: darkStatus.danger.main,
      text: ON_TEAL_DARK,
      border: darkStatus.danger.main,
    },
    onBrand: { bg: '#5FAFBF', text: ON_TEAL_DARK, border: '#5FAFBF' },
    glass: { bg: 'rgba(255, 255, 255, 0.07)', text: BG, border: 'rgba(255, 255, 255, 0.18)' },
  },

  glass: {
    fill: 'rgba(255, 255, 255, 0.07)',
    border: 'rgba(255, 255, 255, 0.18)',
    badge: 'rgba(255, 255, 255, 0.10)',
    progressTrack: 'rgba(255, 255, 255, 0.14)',
    progressFill: darkInteractive.main,
    glowPrimary: '#2D6B78',
    glowSecondary: '#397D8C',
    glowHighlight: darkInteractive.main,
    iconInteractive: darkInteractive.main,
    iconMoney: '#3DDBA5',
    onIconInteractive: ON_TEAL_DARK,
    hairline: '#1E293B',
    iconWarning: darkStatus.warning.main,
    iconDanger: darkStatus.danger.main,
  },

  navigation: {
    tabBar: {
      background: '#122131',
      active: darkInteractive.main,
      activeLabel: darkInteractive.text,
      activeFill: darkInteractive.soft,
      inactive: darkText.tertiary,
      inactiveLabel: darkText.secondary,
      railGlow: 'rgba(111, 192, 207, 0.40)',
      shadow: 'rgba(0, 0, 0, 0.45)',
      rim: '#22384C',
      badge: darkStatus.warning.main,
      onBadge: ON_TEAL_DARK,
    },
    bottomSheet: { background: '#122131', handle: '#30495F' },
  },
  form: {
    input: {
      background: '#122131',
      placeholder: darkText.tertiary,
      label: darkText.primary,
      error: darkStatus.danger.text,
      borderError: darkStatus.danger.main,
    },
    switch: {
      trackOn: darkInteractive.main,
      trackOff: '#30495F',
      thumb: '#EAF0F5',
    },
  },
  calendar: {
    edgeBg: darkInteractive.main,
    edgeText: ON_TEAL_DARK,
    midBg: darkInteractive.soft,
    midText: darkInteractive.text,
    todayBg: '#16303A',
    todayText: darkText.primary,
    dayText: darkText.primary,
    disabledText: darkText.tertiary,
    monthText: darkText.primary,
    sectionTitle: darkText.secondary,
  },
  gradients: {
    hero: [NAVY, '#1F4A5C', '#2D6B78'],
    heroLive: [NAVY_DEEP, NAVY, '#1F4A5C', '#2D6B78'],
    screenWash: {
      colors: ['#16303A', 'rgba(22, 48, 58, 0)'],
      locations: [0, 0.3],
    },
    onboarding: [NAVY_DEEP, NAVY, '#1F4A5C', '#2D6B78'],
    premium: ['#2E2716', '#3B321C'],
    mediaScrim: {
      colors: ['rgba(11, 22, 34, 0)', 'rgba(11, 22, 34, 0.6)', 'rgba(11, 22, 34, 0.95)'],
      locations: [0.36, 0.64, 1],
    },
    mediaTopShade: {
      colors: ['rgba(11, 22, 34, 0.45)', 'rgba(11, 22, 34, 0)'],
      locations: [0, 0.24],
    },
    storyRing: ['#6FC0CF', '#397D8C', '#1F4A5C'],
  },
  media: {
    glass: 'rgba(11, 22, 34, 0.38)',
    glassBorder: 'rgba(255, 255, 255, 0.22)',
    divider: 'rgba(255, 255, 255, 0.18)',
    bar: 'rgba(255, 255, 255, 0.32)',
    barActive: '#FFFFFF',
    dim: '#0B1622',
  },
  overlay: 'rgba(0, 0, 0, 0.7)',
  mediaBackdrop: '#000000',
  logoOnBrand: LOGO_ON_BRAND,
  social: SOCIAL,
  stage: STAGE,
  escrow: ESCROW,
  wallet: {
    ...WALLET_DIAL,
    slot: '#050C14',
    slotShade: 'rgba(0, 0, 0, 0.8)',
    slotRim: 'rgba(255, 255, 255, 0.06)',
    tapeShade: ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0)'],
    chartFill: 0.28,
  },
  profile: PROFILE_ORBIT,
  storefront: {
    pass: ['#1B3046', '#152739', '#16303A'],
    passRim: 'rgba(255, 255, 255, 0.12)',
    sheen: STOREFRONT_SHEEN,
    string: 'rgba(201, 214, 224, 0.45)',
    audience: ['#6FC0CF', '#397D8C', '#2D6B78', '#9FD3DC', '#1F4E5A', '#C9D6E0'],
    tagShadow: 'rgba(0, 0, 0, 0.45)',
  },
  deal: {
    ...DEAL_ORBIT,
    passBehind: [
      [NAVY, '#1F4A5C'],
      ['#1F4A5C', '#2D6B78'],
    ],
  },
  draft: { ...DRAFT, film: '#081019' },
  live: LIVE,
  rating: { ...RATING, padGlow: 'rgba(0, 0, 0, 0.5)', dashDone: '#2D6B78' },
};

export const createColors = (isDark: boolean): ThemeColors =>
  isDark ? darkColors : lightColors;

export const resolveHue = (colors: ThemeColors, tone: HueTone): HueColors => {
  switch (tone) {
    case 'brand':
    case 'interactive':
    case 'money':
    case 'premium':
      return colors[tone];
    default:
      return colors.status[tone];
  }
};
