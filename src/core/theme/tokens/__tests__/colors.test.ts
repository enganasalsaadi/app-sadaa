import { darkColors, lightColors, STATUS_TONES } from '../colors';
import type { ThemeColors } from '../colors';

// WCAG 2.x relative luminance / contrast ratio.
const luminance = (hex: string): number => {
  const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map(c =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
};

const TEXT_MIN = 4.5;

const textPairs = (c: ThemeColors): [string, string, string][] => {
  const surfaces = [c.surface.main, c.layout.base];
  const texts: [string, string][] = [
    ['text.primary', c.text.primary],
    ['text.secondary', c.text.secondary],
    ['text.link', c.text.link],
    ['brand.text', c.brand.text],
    ['interactive.text', c.interactive.text],
    ['money.text', c.money.text],
    ['premium.text', c.premium.text],
    ...STATUS_TONES.map(
      tone => [`status.${tone}.text`, c.status[tone].text] as [string, string],
    ),
  ];
  const onSurfaces = texts.flatMap(([name, fg]) =>
    surfaces.map(bg => [name, fg, bg] as [string, string, string]),
  );
  const onSoft = STATUS_TONES.map(
    tone =>
      [`status.${tone}.text on soft`, c.status[tone].text, c.status[tone].soft] as [
        string,
        string,
        string,
      ],
  );
  const buttons = (['primary', 'secondary', 'danger', 'onBrand'] as const).map(
    v =>
      [`button.${v}`, c.button[v].text, c.button[v].bg] as [
        string,
        string,
        string,
      ],
  );
  return [
    ...onSurfaces,
    ...onSoft,
    ...buttons,
    ['text.onAccent', c.text.onAccent, c.interactive.main],
    ['text.onBrand', c.text.onBrand, c.brand.main],
    ...c.gradients.onboarding.slice(0, -1).map(
      stop =>
        ['text.onBrandMuted on onboarding', c.text.onBrandMuted, stop] as [
          string,
          string,
          string,
        ],
    ),
    ['money.text on soft', c.money.text, c.money.soft],
    ['premium.text on soft', c.premium.text, c.premium.soft],
  ];
};

describe.each([
  ['light', lightColors],
  ['dark', darkColors],
])('%s palette meets WCAG AA for text', (_mode, colors) => {
  it.each(textPairs(colors))('%s (%s on %s)', (_name, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(TEXT_MIN);
  });
});
