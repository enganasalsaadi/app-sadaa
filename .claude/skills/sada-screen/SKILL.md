---
name: sada-screen
description: Step-by-step procedure for designing and building (or redesigning) any Sada app screen or multi-step flow — modern, interactive, premium, in Navy Trust colors and Tajawal — on the project's reusable code structure. Use whenever a task creates, redesigns, or restructures a screen, form, wizard, list, detail or celebration page in this React Native app.
argument-hint: "[screen or flow to build]"
---

# /sada-screen — build a screen the Sada way

Mandatory companions: rule 09 (screen playbook — read §0 design freedom first), rule 08 (colors + type), rule 02 (code hygiene), rule 01 (structure). **Only colors and font are locked; layout, shape, depth, motion, interaction are yours to invent.** **Blank page (rule 09 §0): never base the look on an existing screen, kit default, past approved design or earlier preview.** Follow the phases in order. **Do not write code before Phase 3's approval.**

## Phase 1 — Understand (read, don't guess)

1. Restate the screen's job in one sentence: who is the user, what do they finish here.
2. Find the owning domain (rule 01) and the API endpoints (`domains/<x>/api`). Missing backend behaviour → list it as a question, don't invent it.
3. If a reference pattern fits (rule 09 §2), skim its `hooks/` for **plumbing only** (states, forms, nav, data). Don't study its `.tsx` look before the concept exists.
4. Know the data: what the API returns (that bounds what the screen may show). Reusable *logic* (`src/core/hooks`, `src/shared/utils`, domain `hooks/` `schemas/` `constants/`) noted now; visual kit parts are matched in Phase 2 step 6, after the concept.

## Phase 2 — Design (produce, then stop)

Present to the user, in this order:

0. **Creative concept** (short): the feeling (trust vs social/alive), 1–2 real-world references from top apps (Revolut, Airbnb, Instagram, Apple Wallet, Linear, Spotify…), the **signature moment**, depth/material, key interactions (press, swipe, drag, pull, long-press, haptics, transitions). New screen / redesign with a real choice → **two directions**, one clearly bolder.
1. **Structure**: chrome/plumbing reused (rule 09 §2) or new, and why.
2. **HTML preview (default)** — a static local page that shows the real *look*, so the user judges beauty before any RN code. ASCII only for small tweaks to an existing screen.
   - One file per feature: `design-previews/<feature>.html` (gitignored, never committed, **never published** — no Artifact tool / canvas / `quickstart` unless the user explicitly asks in that message). Open it for the user with `open design-previews/<feature>.html` and give the path.
   - `<html lang="ar" dir="rtl">`; Tajawal from Google Fonts; `<link rel="stylesheet" href="../.claude/skills/sada-screen/preview-kit.css">`. Phone frames `390×844` (radius 44) side by side; each root `<div class="sd">` / `<div class="sd dark">` — show light and dark.
   - Colors and font from the kit vars only. Kit classes (`hero`, `lights`, `glass`, `sheet`, `card`, `tabbar`, …) mirror today's look — don't default to them; write fresh CSS for layout, shape, depth, tab bar included. CSS transitions/`:active` for the signature motion where cheap; otherwise a one-line caption under the frame. 44pt targets.
   - Real Arabic copy, realistic data (amounts as `formatMoney` prints them), real tab bar for tab roots, every status the screen can show at least once.
   - Two directions → two frames (labelled A / B). One frame per role variant (memory: brand vs creator screens differ). Key states (loading skeleton, empty) as small extra frames when designed.
   - Keep it static and cheap: no JS frameworks, no build step. Iterate on this file until approved; the approved preview is the visual target for Phase 3 and the Phase 4 self-review.
3. **Structure notes**: every field, the primary action, secondary actions — short list next to the preview.
4. **States**: loading / empty / error / submitting / 422 / keyboard (rule 09 §4) — one line each.
5. **Motion & interaction**: choreography (enter, state change, feedback, transitions between screens), gestures, haptics. Toolbox in rule 09 §3.1; invent new parts when needed. Reduced-motion fallback + pause off-screen loops.
6. **Parts list**: existing components reused; any *new* shared component (name, props, why it belongs in `shared/ui` vs the domain).
7. **Files** to create/change/delete.
8. **Open questions** (backend behaviour, copy, edge cases).

Then STOP and wait for an explicit OK or changes. Use AskUserQuestion for real decisions (point to the preview frames for visual options).

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
7. **Screen** `<Name>Screen.tsx`: render only, built to the approved preview — new parts where the preview needs them, kit plumbing only where it fits without changing the look. Fields via `Controller` with `ref`, `fieldState.error`, return-key chaining. Extract memo sub-components for anything that watches a single field or the keyboard.
8. **i18n**: keys in both `ar` and `en`, same order, nested by domain → screen → element (`auth.login.title`). Arabic copy first; keep it short and warm; tagline verbatim.
9. **Navigation**: param types in `core/navigation/types.ts`; register in the domain navigator; wizards = `WizardShell` wrapping a native-stack.
10. **Delete** whatever the new screen replaces (old screen, hooks, endpoints, i18n keys, unused shared components). Grep before deleting.

## Phase 4 — Verify

1. `npx tsc --noEmit && npm run lint && npm test` — all green, no disabled lint rules.
2. Self-review each item, fix before reporting:
   - [ ] matches the approved concept + HTML preview (signature moment, interactions, motion actually built — not dropped for a safe stack of cards)
   - [ ] rule 09 §3.3: stands next to a top-tier modern app; reacts to touch; clear focal point; content leads on people screens
   - [ ] colors only from rule 08 roles; font only via `<Text variant>`
   - [ ] tokens only (new tokens added where needed), RTL-safe props, directional icons flip
   - [ ] accessibility (rule 09 §3.2): ≥ 44pt, role + i18n label, contrast, reduced motion handled
   - [ ] all states from rule 09 §4 present and designed (empty/error not bare text)
   - [ ] only real data shown; small screens + keyboard open still work
   - [ ] animations smooth (UI thread, loops paused off-screen)
   - [ ] submit never disabled for invalidity; double-submit guarded; toasts truthful
   - [ ] `.tsx` has no logic; hook callbacks memoised; no inline styles
   - [ ] reused shared *logic* parts instead of re-implementing (OTP, countdown, phone, password strength, confirm sheet…)
   - [ ] no dead code left behind; barrels export only what's used
3. Report to the user: what changed (grouped), bugs fixed, and **what was not verified** (device run, RTL, dark mode, small screens, reduced motion, animation smoothness). Suggest the next check.
