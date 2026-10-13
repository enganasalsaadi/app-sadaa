# خطة الموبايل — الحملات المباشرة (Direct Deals)

المراجع: `description.md` (المنتج) · `direct-deals.md` (عقد الـ API، M1–M11) · `rate-card-addons.md` (M1).
طريقة العمل: كل خطوة = جلسة مستقلة. ابدأ الجلسة بـ: «نفّذ الخطوة Px.y من docs/direct-deals/mobile-plan.md». الحجم: S صغير · M متوسط.
كل شاشة UI تمر بـ `/sada-screen` (معاينة HTML محلية → موافقة → بناء). كل خطوة تنتهي بـ `tsc + lint + test` + تحديث `docs/mobile-architecture.md`.

---

## 0. قرارات ثابتة (من الوثيقة + الباك إند)

- السعر ثابت من الـ Rate Card. لا تفاوض على السعر. التفاوض الوحيد: تمديد مهلة التسليم (مرة واحدة، حد +14 يوم).
- الإضافات (Add-ons) بسعر ثابت تُختار وقت بناء العرض. المجموع من السيرفر (`/quote`)، التطبيق لا يحسب أي رقم.
- العملة USD نصوص (`"150.00"`) → نحولها في `transformResponse` إلى `Money` بوحدات صغرى (cents) — قاعدة 06.
- أي `409 deal_*` → رسالة السيرفر + إعادة جلب الصفقة. لا إعادة محاولة عمياء.
- العدادات من `due_at` فقط. `null` = «متوقف مؤقتاً».
- شاشات البراند والمؤثر منفصلة، تتشارك الـ parts فقط.
- الحالات المعروضة: `status.label` و`stage.label` من السيرفر كما هي؛ خرائطنا للـ tone/icon/actions فقط.

## 1. خريطة الانتقالات (Screen map)

```
البراند                                          المؤثر
───────                                          ──────
MediaKitPublic / CreatorCard                     Push / Inbox / تبويب الصفقات
   │ «اطلب خدمة مباشرة»                              │
   ▼                                                 ▼
OfferBuilder (Wizard 4 خطوات)                    CreatorDeals (قائمة: عروض جديدة/جارية/منتهية)
 1 الخدمات + الكميات + الإضافات (quote حي)           │
 2 الشحن (بدون / هدية / عينة مستردة)                 ▼
 3 الـ Brief + مرفقات (≤5)                       CreatorDealDetail ──► Contract
 4 المراجعة + العقد + المحفظة → «إرسال»              ├ عرض جديد: قبول(توقيع) / اعتذار(سبب) / طلب تمديد
   │                                                ├ شحن: تأكيد استلام / إبلاغ مشكلة (صور) / إلغاء مجاني
   ▼                                                ├ بند: رفع مسودة (ملفات+كابشن) ──► DraftUpload
BrandDeals (قائمة: تحتاج إجراء/جارية/مسودات/منتهية) ├ بند: نشر (رابط + لقطات) ──► PublishProof
   │                                                ├ Upsell وارد: قبول(توقيع) / رفض
   ▼                                                ├ انسحاب (Strike) · نزاع · استعادة منشور
BrandDealDetail ──► Contract / Timeline             └ تقييم
 ├ تمديد وارد: موافقة(+تمويل) / رفض                Strikes (sada://strikes)
 ├ بانتظار الدفع: تمويل / شحن المحفظة (TopUp)
 ├ شحن: إدخال/تعديل الشحنة · إعادة شحن · إلغاء
 ├ بند: مراجعة المسودة ──► DraftReview (اعتماد / تعديل + pins بالثانية)
 ├ بند: تحقق من المنشور (verify / fix)
 ├ خدمة إضافية (Upsell) ──► UpsellBuilder
 ├ إلغاء (يقرأ cancellation أولاً: مجاني/Kill fee/نزاع فقط)
 ├ نزاع · بلاغ بقاء المنشور
 └ تقييم

مشترك: Contract · Timeline · Dispute (عرض + أدلة + الحكم)
```

## 2. خريطة إعادة الاستخدام (لا نبني من جديد)

| الحاجة | الموجود | الإجراء |
|---|---|---|
| Wizard العرض | `WizardShell`, `StepProgress`, `FormSection` | استخدام مباشر |
| كميات / مبالغ | `NumberStepper`, `MoneyText`, `AnimatedNumber`, `MoneyFlow` | مباشر |
| عدادات | `Countdown`, `LiveDot` | مباشر |
| سجل الأحداث | `Timeline` | مباشر + mapper للصفوف |
| أوراق القرار | `BottomSheet`, `ConfirmSheet`, `Radio`, `ChipGroup` | مباشر |
| مرفقات/صور | `FilePickerCard`, `MediaTile`, `GalleryModal` | مباشر |
| تقييم | `RatingStars` | مباشر |
| قوائم | `SuperList` + نمط `usePaginatedList` | مباشر |
| حالة الصفقة | `DealStatusPill`, `DealCard`, `DealProgress`, `DraftReviewCard` | **تحديث** للحالات الجديدة |
| Rate cards + كتالوج | `rateCardCatalogApi/Cache/Types`, `rateRows` | **توسيع** للإضافات v2 |
| شحن المحفظة | شاشات `TopUp*` | ربط CTA فقط |
| Escrow في المحفظة | `EscrowTickets`, `useWalletEscrows` | إضافة `stage` |
| Idempotency | `createIdempotentAction` | للتمويل/الإلغاء/الـ upsell |
| device_id | `core/notification` | تمرير للتوقيع |
| مسار الإشعارات | `notificationRoute.ts`, `usePushNavigation` | إضافة `deal_*` + strikes |
| **ناقص** | رفع ملفات بـ signed URL (3 خطوات) | جديد في `core/upload` — يخدم 5 تدفقات |

---

## P0 — الأساس (بدون UI) — شرط لكل ما بعده

- ✅ **P0.1 (M)** (2026-10-13) الأنواع: استبدال `DEAL_STATUS` القديم بـ 22 حالة الباك إند + `DEAL_ITEM_STATUS` + `DealActionKey` + `CancelOutcome` + أنواع `Deal`, `DealItem`, `Shipping`, `Upsell`, `Dispute`, `Retention`, `Rating`, `TimelineRow`. خرائط `Record<…>` (tone/icon/allowed actions). fallback للحالة المجهولة. تحديث `DealStatusPill/DealCard/DealProgress` + demos. تحديث نص القاعدة 06/16 و`CLAUDE.md` (سطر Deal). اختبارات.
- ✅ **P0.2 (S)** (2026-10-13) المال (+ DTO types لكل resource — مراجعها في `api/app/Domains/Marketplace/Deals/Http/Resources/*`): `parseUsd("150.00") → Money` في `core/money` + mappers DTO→domain لكل الصفقة. اختبارات. (`types/dealDto.ts` + `utils/dealMappers.ts`؛ `DealItem.retentionDays` → `retention: DealRetentionTerm` لأن الباك إند يرسل enum.)
- ✅ **P0.3 (M)** (2026-10-13) `dealsApi` (brand + influencer): list/detail/timeline/contract، tags `Deal`/`DealList`، `ApiErrorCode` لكل `deal_*`، hook موحد `useDealAction` (409 → toast + refetch، replace cache من `data`). (+ tag `DealHistory` للـ timeline/contract؛ mutation عامة `runDealAction` بمسارات typed `DealActionPath` لكل action يرجع الصفقة كاملة — rating/retention/فتح نزاع/أدلة/`shipment/issue` (multipart) تأخذ mutations خاصة في خطواتها؛ `403 deal_*` يمر للشاشة مثل 409؛ detail البراند يحمل `funding` من `meta` أثناء `awaiting_payment`.)
- ✅ **P0.4 (M)** (2026-10-13) `core/upload`: slot → PUT مع progress → `file_id`، فحص MIME/حجم قبل الطلب، إلغاء عند unmount. اختبارات. (`uploadFile` + hook `useFileUploads` (عدة ملفات، remove/retry/clear، `limit`)؛ الـ PUT عبر `react-native-blob-util` يبث من القرص (300 MB بدون ذاكرة JS)؛ `core` بلا قواعد عمل: يأخذ `UploadPolicy` + `requestSlot` من الدومين — `DEAL_UPLOAD_POLICY`/`DEAL_UPLOAD_LIMIT` لكل purpose في `marketplace/constants/dealUploads.ts` (evidence فيديو mp4/mov فقط)؛ `mapUploadSlot` للـ `transformResponse` — mutations الـ slot نفسها تُضاف في خطوة كل تدفق.)
- **P0.5 (S)** الملاحة: مسارات `Deals*` في `core/navigation/types.ts` + navigator لكل دور + deep links `sada://deals/{id}`, `sada://strikes` + `deal_*` في `notificationRoute`.

## P1 — M1 إضافات الـ Rate Card v2 (المؤثر)

- **P1.1 (S)** `AddonType` = الست الجديدة، إزالة `percent`، تجاهل الأنواع المجهولة، ترتيب حسب الكتالوج.
- **P1.2 (M)** محرر الإضافات يُرسم من الكتالوج (options/duration، `exclusivity` نص ثابت). عرضها في المديا كيت.

## P2 — M2 بناء العرض (البراند) — قلب الميزة

- **P2.0 (M)** تصميم: معاينة HTML للـ Wizard كامل (4 خطوات) → موافقة.
- **P2.1 (S)** نقطة الدخول: زر «اطلب خدمة مباشرة» في `MediaKitPublic` + `CreatorCard` (يخفى لغير البراند، `kyc_required` → CTA توثيق).
- **P2.2 (M)** الخطوة 1: مكوّن `DealLinesPicker` (بطاقات + كمية ≤10 + إضافات) + `useDealQuote` (debounce). **يُعاد استخدامه في الـ Upsell**.
- **P2.3 (M)** الخطوتان 2–3: الشحن + الـ Brief (وسوم، منشن، نقاط، ممنوعات، مرفقات عبر P0.4). حفظ مسودة سيرفر (POST ثم PUT).
- **P2.4 (M)** الخطوة 4: الملخص + معاينة العقد + تحذير رصيد المحفظة (تنبيه لا منع) + توقيع وإرسال. معالجة `deal_price_changed`, `deal_offer_exists`, `deal_offer_limit`, `deal_creator_unavailable`.

## P3 — M3 القوائم والتفاصيل (الدوران)

- **P3.0 (M)** تصميم: قائمة + تفاصيل (هيرو الحالة + العداد + «الخطوة التالية») → موافقة.
- **P3.1 (M)** `BrandDeals` + `CreatorDeals` (SuperList، تبويبات مجموعات الحالة، مسودات للبراند فقط).
- **P3.2 (M)** `BrandDealDetail` + `CreatorDealDetail`: هيكل بفتحات أقسام (Hero / Items / Shipping / Upsells / Dispute / Rating). الأقسام تُملأ في المراحل التالية.
- **P3.3 (S)** `Timeline` (صفوف الملاحظات `from==to` كأحداث) + شاشة `Contract`.

## P4 — M4 الرد والدفع

- **P4.1 (M)** المؤثر: قبول (ورقة توقيع «أوافق وألتزم») / اعتذار (4 أسباب، `other` يتطلب نص) / طلب تمديد.
- **P4.2 (M)** البراند: رد على التمديد، تمويل يدوي، عجز → شاشات TopUp، سحب العرض. `deal_deadline_passed` → «انتهى العرض» + refetch.

## P6 — M6 المسودات والمراجعة
- **P6.1 (M)** المؤثر `DraftUpload` لكل بند: ملفات 1–10 + كابشن ≤2200 + تقدم الرفع.
- **P6.2 (M)** البراند `DraftReview`: عارض وسائط + pins بالثانية + اعتماد / طلب تعديل / «اعتماد كما هو». `deal_revisions_exhausted` → عرض Upsell جولة إضافية.

## P7 — M7 النشر والتحقق
- **P7.1 (S)** المؤثر `PublishProof`: رابط + 1–3 لقطات، تفسير `deal_live_url_invalid` حسب `meta.reason`.
- **P7.2 (S)** البراند: تحقق / طلب تصحيح (حد 2)، شارة «الحساب غير مُتحقق» عند `handle_checked=false`.

## P10 — M10 التقييم
- **P10.1 (S)** ورقة تقييم لكل دور (3 معايير) + تخطي + إخفاء حتى الكشف.

> **نهاية الشريحة A**: صفقة رقمية كاملة تعمل من العرض حتى الإكمال والتقييم.

## P11 — التكاملات (M11 + B13)
- **P11.1 (S)** إشعارات `deal_*` → تفاصيل الصفقة + refetch.
- **P11.2 (M)** Brand Home: شريط `active_deals` + جزيرة `fund_deals`.
- **P11.3 (S)** المحفظة: `stage` في تذاكر الـ escrow + `clawback` + CTA `kyc_required` عند السحب.
- **P11.4 (S)** المديا كيت: `highlights.completed_campaigns` + `worked_with`.

## الشريحة B — الحالات الخاصة

- **P5 — M5 الشحن (M)**: البراند إدخال/تعديل/إعادة شحن/إلغاء · المؤثر استلام / مشكلة (صور 1–5) / إلغاء مجاني. قسم في التفاصيل.
- **P8.1 — M8 الإلغاء (M)**: البراند ورقة إلغاء تقرأ `cancellation.brand` (مجاني / Kill fee 40% / نزاع فقط) + `expected_outcome`؛ المؤثر انسحاب مع تحذير Strike + شاشة `Strikes`.
- **P8.2 — M8 Upsells (M)**: `UpsellBuilder` يعيد استخدام `DealLinesPicker` + quote؛ المؤثر قبول/رفض؛ عجز الرصيد → TopUp.
- **P9.1 — M9 النزاع (M)**: فتح نزاع + أدلة (ملفات/روابط/صور الشحن) + عرض الحكم.
- **P9.2 — M9 بقاء المنشور (S)**: بلاغ البراند / استعادة أو اعتراض المؤثر.

---

## الترتيب المقترح

`P0 → P1 → P2 → P3 → P4 → P6 → P7 → P10 → P11` (شريحة A، قابلة للتجربة على الجهاز) ثم `P5 → P8 → P9`.

## قرارات معتمدة (2026-10-13)

1. **تبويب «صفقاتي»** في الشريط السفلي للدورين + Badge بـ `needs_action_count`. Brand Home يبقي `active_deals` معاينة سريعة، «عرض الكل» → تبويب صفقاتي.
2. **USD فقط** كما يرجعه السيرفر. لا تحويل ولا معادل SYP (العقود بالدولار).
3. **`Idempotency-Key` (uuid v4)** لكل الأفعال المالية والحساسة: `fund`, `cancel`, `upsells`, `accept` (+ `withdraw`, `extension` approve) عبر `createIdempotentAction`.
4. **التصميم:** المكونات الموجودة تُعاد استخدامها كمنطق فقط؛ الشكل يُحدَّث ليطابق مستوى الصفحات المعاد تصميمها (Home, Wallet, Profile, Media Kit). ستارت أب فخم، جريء، حي.
