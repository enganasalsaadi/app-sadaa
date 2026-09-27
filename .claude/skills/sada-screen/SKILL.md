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
   │ ░ NAVY ░  ((•)) صدى  │   hero: logo + tagline
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
3. **States**: loading / empty / error / submitting / 422 / keyboard (rule 09 §4) — one line each.
4. **Motion**: what animates and why (max 1–2 elements; celebration screens excepted).
5. **Parts list**: existing components reused; any *new* shared component (name, props, why it belongs in `shared/ui` vs the domain).
6. **Files** to create/change/delete.
7. **Open questions** (backend behaviour, copy, edge cases).

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
   - [ ] one primary CTA; others secondary/ghost/link
   - [ ] only tokens (no hex, no raw numbers except `moderateScale` constants), RTL-safe props, directional icons flip
   - [ ] every pressable: role + i18n label, ≥ 44pt
   - [ ] all states from rule 09 §4 present
   - [ ] hero ≤ ~25% of screen, compact via `useHeroCompact()` with keyboard open / short screens
   - [ ] submit never disabled for invalidity; double-submit guarded; toasts truthful
   - [ ] `.tsx` has no logic; hook callbacks memoised; no inline styles
   - [ ] reused shared parts instead of re-implementing (OTP, countdown, phone, password strength, confirm sheet…)
   - [ ] no dead code left behind; barrels export only what's used
3. Report to the user: what changed (grouped), bugs fixed, and **what was not verified** (device run, RTL, dark mode, small screens, reduced motion). Suggest the next check.
