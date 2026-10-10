---
paths:
  - "src/**/*.tsx"
  - "src/shared/ui/**"
  - "src/core/theme/**"
---

# 02 — Strict Design System

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

Missing primitive → build in `src/shared/ui/<Name>/` first + showcase demo same change (rule 10). Never inline a one-off. `Animated.View` only as transform wrapper with `Box` inside.

## Tokens only

| Banned | Use |
|---|---|
| `'#FFF'`, `'red'`, `'rgba(...)'` | `colors.text.primary`, `colors.layout.base`… |
| `margin: 10`, `gap: 8` | `spacing.md`, `<Box p="lg" gap="sm">` |
| `fontSize`, `fontFamily` | `<Text variant>`, `typography.*` |
| `borderRadius: 12` | `radii.*` (`xs` 4 · `sm` 10 · `md` 15 · `lg` 22 · `xl` 28 · `full`) |
| `zIndex: 999` | `zIndices.modal` |
| inline `style={{}}` | `useStyles(factory)` or primitive props |

- Raw colors/numbers ONLY in `src/core/theme/tokens/**`. Which color for what → rule 08.
- Never branch on `isDark` for colors. Token missing → add to token file (light + dark).
- One-off sizes: `moderateScale(n)` / `fontScale(n)` (`@/core/theme`). Design ref 375×812.
- Hue groups `{ main, text, soft }`: text → `.text`; fills/icons/dots → `.main`; tinted bg → `.soft`. Text on filled accent → `colors.text.onAccent`.
- No alpha hacks (`colors.x + '15'`) → `soft`. Placeholder `colors.form.input.placeholder`; skeleton `colors.surface.elevated`.

## Hooks

`useTheme()` (`colors spacing typography radii sizes zIndices shadows isDark`) · `useStyles(factory, deps?)` · `useResponsiveValue({small, medium, large})`.

## Component convention

`src/shared/ui/<Name>/{<Name>.tsx, index.ts, styles.ts?, types.ts?}`. Props exported as `<Name>Props`. Exported from `src/shared/ui/index.ts`. Named exports, barrel per folder. Variants via typed unions, never boolean soup. Every pressable: `accessibilityRole` + `accessibilityLabel` (via `t()`), touch target ≥ 44pt (`sizes`).
