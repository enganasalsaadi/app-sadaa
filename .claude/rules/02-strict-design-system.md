---
paths:
  - "src/**/*.tsx"
  - "src/shared/ui/**"
  - "src/core/theme/**"
---

# 02 — Strict Design System

**Scope:** this rule is code hygiene (where values live, which primitives to import), not a style limit. Design freedom: rule 09 §0.

Lint: raw RN UI imports banned in `src/domains/**` and `src/app/screens/**`; `react-native/no-color-literals`, `react-native/no-inline-styles` everywhere.

## UI kit only (`@/shared/ui`)

Never import `View Text Image Pressable TouchableOpacity TouchableHighlight TouchableWithoutFeedback` from `react-native` in domains/screens.

| Use | Instead of | Key props |
|---|---|---|
| `Box` | `View` | `p px py pt pb ps pe m mx my mt mb ms me gap` (SpacingToken), `bg`, `borderRadius` (RadiiToken), `shadow`, `row`, `flex`, `align`, `justify`, `zIndex` |
| `Text` | `Text` | `variant`, `color`, `align`, margins. Auto RTL + `maxFontSizeMultiplier` |
| `Pressable` | Touchable*/Pressable | Box props + `scaleOnPress`, `activeOpacity` |
| `Card` | surface View | Box props + `onPress` (press spring), `selected`; borderless + `shadow='card'` |
| `Image` | Image | fast-image backed |
| `CustomButton` `CustomInput` `PhoneInput` | hand-rolled controls | theme variants/sizes |
| `Layout` | SafeAreaView/ScrollView wrappers | `mode surface padding header footer` |
| `ScreenHeader BottomSheet SelectionModal SuperList InlineError` | ad-hoc versions | — |

Missing piece → screen-specific visuals go in `screens/<Name>Screen/components/` or `domains/<x>/components/`; promote to `src/shared/ui/` (+ showcase, rule 10) once a second screen needs it. Reanimated (`Animated.View`, layout/shared transitions, scroll handlers), `react-native-gesture-handler`, Skia, `react-native-svg`, Lottie are all fair game for creative visuals; style them via `useStyles` + tokens.

## Tokens only

| Banned | Use |
|---|---|
| `'#FFF'`, `'red'`, `'rgba(...)'` | `colors.text.primary`, `colors.layout.base`… |
| `margin: 10`, `gap: 8` | `spacing.md`, `<Box p="lg" gap="sm">` |
| `fontSize`, `fontFamily` | `<Text variant>`, `typography.*` |
| `borderRadius: 12` | `radii.*` or a new radii token |
| `zIndex: 999` | `zIndices.modal` |
| inline `style={{}}` | `useStyles(factory)` or primitive props |

- Raw colors/numbers ONLY in `src/core/theme/tokens/**`. Which color for what → rule 08. Adding tokens (radii, shadows, gradients/alphas of palette hues, motion curves, sizes) is encouraged when the design needs them.
- Never branch on `isDark` for colors. Token missing → add to token file (light + dark).
- One-off sizes: `moderateScale(n)` / `fontScale(n)` (`@/core/theme`). Design ref 375×812.
- Hue groups `{ main, text, soft }`: text → `.text`; fills/icons/dots → `.main`; tinted bg → `.soft`. Text on filled accent → `colors.text.onAccent`.
- No alpha hacks (`colors.x + '15'`) → `soft` or a new alpha token. Placeholder `colors.form.input.placeholder`; skeleton `colors.surface.elevated`.

## Hooks

`useTheme()` (`colors spacing typography radii sizes zIndices shadows isDark`) · `useStyles(factory, deps?)` · `useResponsiveValue({small, medium, large})`.

## Component convention

`src/shared/ui/<Name>/{<Name>.tsx, index.ts, styles.ts?, types.ts?}`. Props exported as `<Name>Props`. Exported from `src/shared/ui/index.ts`. Named exports, barrel per folder. Variants via typed unions, never boolean soup. Every pressable: `accessibilityRole` + `accessibilityLabel` (via `t()`), touch target ≥ 44pt (`sizes`).
