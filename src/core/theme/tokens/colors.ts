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

export const BUTTON_COLOR_VARIANTS = [
  'primary',
  'secondary',
  'outline',
  'ghost',
  'danger',
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

  layout: { base: string; divider: string };
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
  };
  border: { default: string; strong: string };
  icon: { primary: string; secondary: string; disabled: string };

  button: Record<ButtonColorVariant, ButtonColors>;

  navigation: {
    tabBar: { active: string; inactive: string; background: string };
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
    /** Soft wash at the top of screens (Layout withGradient). */
    screenWash: { colors: string[]; locations: number[] };
  };
  overlay: string;
  /** Full-screen photo/video viewer backdrop — black in both modes. */
  mediaBackdrop: string;
}

const NAVY = '#1C3349';
const NAVY_DEEP = '#0B1622';
const WHITE = '#FFFFFF';
const ON_TEAL_DARK = '#06121C';

const lightText = {
  primary: '#0F1D2B',
  secondary: '#475869',
  tertiary: '#8394A5',
};
const darkText = {
  primary: '#EAF0F5',
  secondary: '#A5B5C4',
  tertiary: '#6C8093',
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

  layout: { base: '#F5F7F9', divider: '#DCE3EA' },
  surface: { main: WHITE, elevated: '#EDF1F4' },
  text: {
    ...lightText,
    link: lightInteractive.text,
    onAccent: WHITE,
    onBrand: WHITE,
  },
  border: { default: '#DCE3EA', strong: '#C3CDD7' },
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
  },

  navigation: {
    tabBar: {
      active: lightInteractive.main,
      inactive: lightText.tertiary,
      background: WHITE,
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
    screenWash: {
      colors: ['#E6ECF2', 'rgba(230, 236, 242, 0)'],
      locations: [0, 0.3],
    },
  },
  overlay: 'rgba(11, 22, 34, 0.5)',
  mediaBackdrop: '#000000',
};

export const darkColors: ThemeColors = {
  brand: { main: NAVY, text: darkText.primary, soft: '#16303A' },
  interactive: darkInteractive,
  money: { main: '#3DDBA5', text: '#3DDBA5', soft: '#0F2E2A' },
  premium: { main: '#E6C47E', text: '#E6C47E', soft: '#2E2716' },
  status: darkStatus,

  layout: { base: NAVY_DEEP, divider: '#22384C' },
  surface: { main: '#122131', elevated: '#182B3D' },
  text: {
    ...darkText,
    link: darkInteractive.text,
    onAccent: ON_TEAL_DARK,
    onBrand: '#F5F7F9',
  },
  border: { default: '#22384C', strong: '#30495F' },
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
  },

  navigation: {
    tabBar: {
      active: darkInteractive.main,
      inactive: darkText.tertiary,
      background: '#122131',
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
    screenWash: {
      colors: ['#16303A', 'rgba(22, 48, 58, 0)'],
      locations: [0, 0.3],
    },
  },
  overlay: 'rgba(0, 0, 0, 0.7)',
  mediaBackdrop: '#000000',
};

export const createColors = (isDark: boolean): ThemeColors =>
  isDark ? darkColors : lightColors;
