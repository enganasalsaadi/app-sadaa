---
name: sada-screen
description: Step-by-step procedure for designing and building (or redesigning) any Sada app screen or multi-step flow so it matches the Navy Trust design and the project's reusable code structure. Use whenever a task creates, redesigns, or restructures a screen, form, wizard, list, detail or celebration page in this React Native app.
argument-hint: "[screen or flow to build]"
---

# /sada-screen — build a screen the Sada way

Mandatory companions: rule 09 (screen playbook), rule 08 (brand), rule 02 (design system), rule 01 (structure). Read rule 09 first. Follow the phases in order. **Do not write code before Phase 3's approval.**

## Phase 1 — Understand (read, don't guess)

1. Restate the screen's job in one sentence: who is the user, what do they finish here.
2. Find the owning domain (rule 01) and the API endpoints (`domains/<x>/api`). Missing backend behaviour → list it as a question, don't invent it.
3. Open the reference implementation for the closest archetype (rule 09 §2) and skim its `.tsx` + `hooks/`. Copy its structure, not just its look.
4. Inventory reusable parts before planning anything new:
   `src/shared/ui/index.ts` (UI kit), `src/core/hooks/index.ts`, `src/shared/utils`, the domain's `components/`, `hooks/`, `schemas/`, `constants/`.

## Phase 2 — Design (produce, then stop)

Present to the user, in this order:

1. **Archetype** from rule 09 §2 and why.
2. **ASCII mockup**, RTL (Arabic) orientation, showing hero vs sheet, every field, the one primary CTA, secondary actions. Example:
   ```
   ┌──────────────────────┐
   │ ░ NAVY ░  ((•)) صدى  │   hero: logo + tagline (entry screens only)
   │╭────────────────────╮│
   │ أهلاً بعودتك          │   h2 + body subtitle
   │ [🇸🇾 +963 | الجوال ] │
   │ [كلمة المرور     👁 ] │
   │      نسيت كلمة المرور؟│   teal link, end-aligned
   │ [████ تسجيل الدخول ██]│   the only primary
   │ ───────── أو ──────── │
   │ [   إنشاء حساب جديد  ]│   secondary
   ╰──────────────────────╯
   ```
3. **Visual preview — OPT-IN ONLY.** Skip this step entirely (no Artifact tool, no quickstart, no canvas) unless the user explicitly asks for a visual preview in this request. Default = ASCII only. When asked, ASCII fixes structure, this fixes the *look*:
   - Artifact `quickstart` (intent `design`) → one Design canvas per feature, one artboard per screen (`390×844`, `radius` 44), `is_interactive` only where a toggle really works.
   - Each artboard's `<helmet>`: Tajawal from Google Fonts + the full contents of `preview-kit.css` (this folder). Root `<div class="sd {{themeClass}}">` with a `dark` boolean tweak; `lang="ar" dir="rtl"`.
   - Use only kit vars and classes (`hero` + `lights`, `glass`, `glassbtn`, `sheet`, `card`, `row`, `badge`, `pill`, `btn`, `link`, `tabbar` + `lens`, `live`, `track`, `num`). Sizes from rule 08/02 tokens: typography px, spacing 4–80, radius 4/10/15/22/28, 44pt targets. No colors outside the kit, no logo outside entry screens (rule 08).
   - Real Arabic copy, realistic data (amounts as `formatMoney` prints them), real tab bar for tab roots, every status the screen can show at least once.
   - One artboard per role variant (memory: brand vs creator screens differ). A kit part with new props → add a spec board (props table + rendered examples).
   - Write and publish one file at a time; give the user the canvas link. The approved canvas is the visual target for Phase 3 and the Phase 4 self-review.
4. **States**: loading / empty / error / submitting / 422 / keyboard (rule 09 §4) — one line each.
5. **Motion**: what animates and why, only from the rule 09 §3.1 table (loops: hero lights, status pulse, money flow; everything else once).
6. **Parts list**: existing components reused; any *new* shared component (name, props, why it belongs in `shared/ui` vs the domain).
7. **Files** to create/change/delete.
8. **Open questions** (backend behaviour, copy, edge cases).

Then STOP and wait for an explicit OK or changes. Use AskUserQuestion for real decisions (with ASCII previews for visual options).

## Phase 3 — Build (after approval only)

Order matters — lower layers first so screens only compose:

1. **Tokens** missing? add to `src/core/theme/tokens/**` (light + dark). Never raw values in components.
2. **Shared UI** missing? `src/shared/ui/<Name>/{<Name>.tsx,index.ts}`, export from `shared/ui/index.ts`, relative imports inside `shared/ui`.
3. **Types / API**: DTOs in `types/` or `store/authTypes.ts`-style files; endpoints via `injectEndpoints({ overrideExisting: true })`; new tags in `baseApi.tagTypes`.
4. **Schema**: `schemas/<x>Schema.ts` → `createXSchema(t)`; compose existing field builders; add cases to `schemas/__tests__`.
5. **Constants**: flow steps / status maps as `as const satisfies Record<Key, …>`.
6. **Screen hook** `screens/<Name>Screen/hooks/use<Name>Screen.ts` — use this skeleton:
   ```ts
   export const useXScreen = () => {
     const { t } = useTranslation();
     const navigation = useNavigation<XStackScreenProps<'X'>['navigation']>();
     const schema = useMemo(() => createXSchema(t), [t]);
     const [apiError, setApiError] = useState<AppApiError | null>(null);
     const [mutate, { isLoading }] = useXMutation();
     const { control, handleSubmit, setError, setFocus } = useForm<XFormValues>({
       mode: 'onTouched',
       resolver: yupResolver(schema),
       defaultValues: DEFAULT_VALUES,
     });

     const onSubmit = useCallback(() => {
       handleSubmit(async values => {
         if (isLoading) return;
         setApiError(null);
         try {
           await mutate(toRequest(values)).unwrap();
           // navigate / toast only here, after success
         } catch (err) {
           if (!applyServerFieldErrors(err, SERVER_FIELD_MAP, setError)) {
             setApiError(normalizeApiError(err));
           }
         }
       })();
     }, [handleSubmit, isLoading, mutate, setError]);

     return { control, setFocus, onSubmit, isSubmitting: isLoading, apiError };
   };
   ```
7. **Screen** `<Name>Screen.tsx`: render only. Chrome from the archetype (`HeroSheet` / `WizardShell` + `useWizardHeader` / `Layout`). Fields via `Controller` with `ref`, `fieldState.error`, return-key chaining. Extract memo sub-components for anything that watches a single field or the keyboard.
8. **i18n**: keys in both `ar` and `en`, same order, nested by domain → screen → element (`auth.login.title`). Arabic copy first; keep it short and warm; tagline verbatim.
9. **Navigation**: param types in `core/navigation/types.ts`; register in the domain navigator; wizards = `WizardShell` wrapping a native-stack.
10. **Delete** whatever the new screen replaces (old screen, hooks, endpoints, i18n keys, unused shared components). Grep before deleting.

## Phase 4 — Verify

1. `npx tsc --noEmit && npm run lint && npm test` — all green, no disabled lint rules.
2. Self-review each item, fix before reporting:
   - [ ] matches the approved visual preview (spacing, hierarchy, colors, copy)
   - [ ] one primary CTA; others secondary/ghost/link
   - [ ] only tokens (no hex, no raw numbers except `moderateScale` constants), RTL-safe props, directional icons flip
   - [ ] every pressable: role + i18n label, ≥ 44pt
   - [ ] all states from rule 09 §4 present
   - [ ] hero ≤ ~25% of screen (≤ ~40% on dashboard/money tab roots), compact via `useHeroCompact()` with keyboard open / short screens; hero shows only real data
   - [ ] cards borderless (`Card` defaults); live elements only where rule 09 §3.1 allows; no extra loops
   - [ ] submit never disabled for invalidity; double-submit guarded; toasts truthful
   - [ ] `.tsx` has no logic; hook callbacks memoised; no inline styles
   - [ ] reused shared parts instead of re-implementing (OTP, countdown, phone, password strength, confirm sheet…)
   - [ ] no dead code left behind; barrels export only what's used
3. Report to the user: what changed (grouped), bugs fixed, and **what was not verified** (device run, RTL, dark mode, small screens, reduced motion). Suggest the next check.
