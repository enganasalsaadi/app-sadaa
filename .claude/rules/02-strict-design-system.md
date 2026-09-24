# 02 — Strict Design System

Enforced by ESLint: raw RN UI imports banned in `src/domains/**` and `src/app/screens/**`; `react-native/no-color-literals`, `react-native/no-inline-styles` everywhere.

## UI kit only (`@/shared/ui`)

Domain screens and components NEVER import `View`, `Text`, `Image`, `Pressable`, `TouchableOpacity`, `TouchableHighlight`, `TouchableWithoutFeedback` from `react-native`.

| Use | Instead of | Key props |
|---|---|---|
| `Box` | `View` | `p px py pt pb ps pe m mx my mt mb ms me gap` (SpacingToken), `bg`, `borderRadius` (RadiiToken), `shadow`, `row`, `flex`, `align`, `justify`, `zIndex` |
| `Text` | `Text` | `variant` (TypographyVariant), `color`, `align`, margin tokens. Auto RTL + `maxFontSizeMultiplier` |
| `Pressable` | Touchable*/Pressable | Box props + `scaleOnPress`, `activeOpacity` |
| `Card` | surface View | Box props + `onPress`, `selected`, `shadow='md'` |
| `Image` | Image | fast-image backed |
| `CustomButton`, `CustomInput`, `PhoneInput` | hand-rolled controls | variants/sizes from theme |
| `Layout` | SafeAreaView/ScrollView wrappers | `withScroll`, `edges`, `ctaButton` |
| `ScreenHeader`, `BottomSheet`, `SelectionModal`, `SuperList`, `InlineError` | ad-hoc versions | see component docs |

Missing a primitive? Build it in `src/shared/ui/<Name>/` first, then use it. Never inline a one-off in a domain.

`Animated.View` is allowed only as a transform wrapper — put `Box` inside it.

## Tokens only — zero hardcoding

All visual values come from the theme (`useTheme()` / `useStyles()`), light + dark resolved at runtime.

| Banned | Use |
|---|---|
| `'#FFF'`, `'red'`, `'rgba(...)'` in components | `colors.text.primary`, `colors.layout.base`, `colors.brand`… |
| `margin: 10`, `padding: 16`, `gap: 8` | `spacing.md`, `<Box p="lg" gap="sm">` |
| `fontSize: 14`, `fontFamily: '...'` | `<Text variant="body">`, `typography.*` |
| `borderRadius: 12` | `radii.*` / `borderRadius="md"` |
| `zIndex: 999` | `zIndices.modal` |
| `style={{...}}` inline | `useStyles(factory)` or primitive props |

- Raw colors/numbers live ONLY in `src/core/theme/tokens/**`.
- Which color/radius/font to pick for what → rule 08 (brand identity). Color roles are strict: mint = money only, mustard = premium only (never text on light), teal = interaction, navy = identity.
- Never branch on `isDark` to pick colors in components — the token resolves per mode.
- Token missing → add it to the token file (both light & dark), then use it.
- One-off sizes with no token (icon 72px): `moderateScale(n)` / `fontScale(n)` from `@/core/theme`. Design reference 375×812.
- Color token shape (rule 08): hue groups `{ main, text, soft }` — `colors.brand`, `colors.interactive`, `colors.money`, `colors.premium`, `colors.status.success|warning|danger|info|neutral`. Text in a hue → `.text`; fills/icons/dots → `.main`; tinted backgrounds → `.soft`. Text on a filled accent → `colors.text.onAccent`.
- No alpha string hacks (`colors.x + '15'`) — use the `soft` token. Placeholder → `colors.form.input.placeholder`; skeleton → `colors.surface.elevated`.

## Hooks

| Hook | Use |
|---|---|
| `useTheme()` | `colors, spacing, typography, radii, sizes, zIndices, shadows, isDark` |
| `useStyles(factory, deps?)` | memoised `StyleSheet` built from theme |
| `useResponsiveValue({small, medium, large})` | breakpoint values |

## Component convention

```
src/shared/ui/ComponentName/
  ComponentName.tsx
  index.ts        ← export { ComponentName } from './ComponentName'
  styles.ts       ← optional (useStyles factory)
  types.ts        ← optional
```

- Props interface exported as `<ComponentName>Props`.
- Every shared component is exported from `src/shared/ui/index.ts`.
- Variants via typed union props (`variant: 'primary' | 'secondary'`), never boolean soup.
- Accessibility: every pressable has `accessibilityRole` + `accessibilityLabel` (via `t()`); touch target ≥ 44pt (`sizes` tokens).
