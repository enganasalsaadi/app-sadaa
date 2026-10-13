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
- ✅ **P0.5 (S)** (2026-10-13) الملاحة: مسارات `Deals*` في `core/navigation/types.ts` + navigator لكل دور + deep links `sada://deals/{id}`, `sada://strikes` + `deal_*` في `notificationRoute`. (`DealsStackParamList` بأسماء مشتركة للدورين `Deals` / `DealDetail {id}` / `Strikes` (المؤثر فقط) — شاشات P3 تُسجَّل بنفس الأسماء؛ `BrandDealsNavigator`/`CreatorDealsNavigator` في `DealsTab` بشاشة `DealsComingSoonScreen` مؤقتة لكل مسار؛ `PushTarget` `deal`/`strikes` (الرابط وحده يكفي، `type` يبقى `null` لأن `deal_<kind>` مفتوح — الـ refetch حسب النوع في P11.1)؛ push/inbox → `DealsTab` مع القائمة تحتها (`initial: false`)، strikes للبراند → الصندوق.)

## P1 — M1 إضافات الـ Rate Card v2 (المؤثر)

- ✅ **P1.1 (S)** (2026-10-13) `AddonType` = الست الجديدة، إزالة `percent`، تجاهل الأنواع المجهولة، ترتيب حسب الكتالوج.
- ✅ **P1.2 (M)** (2026-10-13) محرر الإضافات يُرسم من الكتالوج (options/duration، `exclusivity` نص ثابت). عرضها في المديا كيت. (`utils/rateCardAddonForm.ts`: `addonDefinitions` من الكتالوج (الخيارات المرئية فقط، حدود السعر `fixed`)، صف لكل إضافة في `RateCardFormValues.addons` (options كنصوص ← النوع الأصلي عند الإرسال)، قيد `delivery_hours` < أيام التسليم عام لأي خيار بهذا المفتاح، خيار بقيمة واحدة = نص ثابت؛ الـ PATCH يرسل `addons` فقط عند تغيّر رسم/خيار ويعيد غير المُدارة كما هي؛ أخطاء `422 addons.{i}.*` تُربط بالصف المرسل (`addonServerFields`)؛ المديا كيت: `RateRowAddon.detail` (ساعات/أيام) + `ADDON_ICONS`.)

## P2 — M2 بناء العرض (البراند) — قلب الميزة

- ✅ **إصلاح** (2026-10-13) `DealDto.brief`: كان `string | null` والسيرفر يرسل كائناً → `DealBriefDto` / `DealBrief` (`hashtags, mentions, talkingPoints, donts, promoCode, trackingLink`) + `mapBrief` + اختبار.
- **P2.0 (M)** تصميم: معاينة HTML للمعالج (**3 خطوات ثابتة**) فاتح + داكن → موافقة (`design-previews/offer-wizard.html`). يشمل: شاشة المنع قبل المعالج، شاشة نجاح الإرسال، ورقة `deal_price_changed`، **هيدر «تذكرة»** كحلي (حلقة المؤثر + «عرض مباشر إلى» + خطوات مرقّمة تنكمش عند التمرير)، **«رحلة الصفقة»** (انظر P2.4) و**دليل الصفقة** (P2.5).
- **P2.1 (S)** نقطة الدخول: زر «اطلب خدمة مباشرة» في `MediaKitPublic` + `CreatorCard` (يخفى لغير البراند). **فحص مسبق** ✅ باك إند (2026-10-13): `GET /brand/deals/preflight?influencer_profile_id=` أو `creator_slug=` (بلا KYC؛ بلا أي منهما → 422، مؤثر مجهول → 404) → `{can_offer, blockers[{code,label,deal_id?}], resume_draft_id, open_offers{used,limit}, drafts{used,limit}}`. `blockers` كلها مرتبة: `kyc_required` → `deal_creator_unavailable` → `deal_offer_exists` (+`deal_id` لأحدث عرض مفتوح) → `deal_offer_limit` → `deal_draft_limit` (لا يمنع إن وُجدت مسودة لهذا المؤثر؛ عندها `resume_draft_id`). شاشة المنع الهادئة تعرض **أول** مانع بنص وCTA من التطبيق لكل code (`kyc_required` → توثيق، `deal_offer_exists` → فتح `deal_id`، `deal_offer_limit` / `deal_draft_limit` → عدّاد من `open_offers` / `drafts` + فتح «صفقاتي»، `deal_creator_unavailable` → القائمة المختصرة) + بقية الموانع كقائمة «وأيضاً» بـ `label` السيرفر؛ code مجهول → `label` السيرفر بشاشة عامة. `resume_draft_id` → ورقة «أكمل مسودتك». فشل الفحص (شبكة/5xx) → ندخل المعالج ونعتمد على أخطاء الإرسال.
- **P2.2 (M)** الخطوة 1 «الخدمات»: مكوّن `DealLinesPicker` (بطاقات من الـ rate card بشارات حقيقية: مدة التسليم، جولات التعديل، مدة البقاء — لا «الأكثر طلباً» ولا شارات بلا بيانات) + كمية ≤10/سطر و≤20 مُخرَج + الإضافات تنكشف فور اختيار الخدمة كرقائق بسعرها (لا أكورديون) + `useDealQuote` (debounce؛ `blockers` في الـ quote تُعاد مع كل تسعير → مانع جديد أثناء المعالج يظهر كشريط هادئ فوق التذكرة مع CTA نفسه، ولا يحتوي `kyc_required` لأن الـ quote يرجع `403 kyc_required` كما هو). **سؤال «منتج مادي؟»** داخل الخطوة: رقمي (افتراضي) / منتج → تنكشف بطاقتا «هدية» / «عينة مستردة» + ملاحظة «يبدأ مؤقت التنفيذ بعد استلام المؤثر للشحنة»؛ آخر اختيار يُتذكر في `appStorage` (تفضيل غير معرِّف). **«متى تحتاجه؟»** (`requested_delivery_days`): افتراضي = مدة المؤثر (`min_delivery_days`)، تمديد حتى 90 يوماً؛ المستعجل → اقتراح إضافة `rush_delivery` إن كانت متاحة. شريط سفلي ثابت: المجموع من `/quote` + «التنفيذ خلال X أيام» (مدة، **لا تاريخ تقويمي**) + متابعة. **يُعاد استخدامه في الـ Upsell**.
- **P2.3 (M)** الخطوة 2 «البريف»: قوالب بلمسة (تملأ نقاط الحديث والممنوعات، نصوص i18n) + وسوم `#` ومنشن `@` كـ Tags + نقاط الحديث + الممنوعات + كود الخصم (≤50) + رابط التتبع (http/https) + مرفقات ≤5 صور/PDF ≤20MB عبر P0.4 (معاينة مصغّرة، تقدم، حذف). حدود الواجهة = السيرفر (10 عناصر/قائمة × 300 حرف). لا حقل «نبرة» في الـ API → تُدمج النبرة كنقطة حديث جاهزة. **حفظ مسودة سيرفر تلقائي** بعد الخطوة 1 (POST ثم PUT — المرفقات تحتاج id المسودة) + استئناف المسودة.
- **P2.4 (M)** الخطوة 3 «المراجعة والتوقيع»: بطاقة «Deal Pass» (المؤثر، البنود، الإضافات، جولات التعديل، البقاء، الشحن، المجموع من السيرفر) + رابط معاينة العقد (`contract_terms`) + متوسط المشاهدات السابق فقط إن وُجد (لا «وصول متوقع»). **المحفظة**: «لن يُخصم شيء الآن · يُحجز $X عند قبول المؤثر»؛ أخضر عند الكفاية، كهرماني عند النقص بمقدار `shortfall_usd` — تنبيه لا منع. **«رحلة الصفقة»** (مكوّن `DealJourney` مشترك مع P3.3) بعرض البطاقة كاملاً: خط محطات أفقي (التوقيع → رد المؤثر → الضمان → [الشحن] → التنفيذ → مراجعتك → النشر → الاكتمال) يُرسم حتى «الآن» + علم «الآن» + مذنّب يتحرك نحو المحطة التالية + المحطة التالية تتنفس؛ ضغط محطة أو سحب البطاقة (RTL: السحب يميناً = التالي) يبدّل بطاقة تفاصيل: الحالة (تم/الآن/التالي/لاحقاً)، من يتحرك (أنت/المؤثر/صدى)، متى (مدة من `windows` في الـ quote: `influencer_response_hours` 48، `payment_top_up_hours` 24، `brand_ship_hours` 120، `brand_review_hours` 48، `publish_window_hours` 48 — بلا تواريخ تقويمية؛ للمحطات المنجزة وقت حدوثها)، ماذا يحدث، «دورك»، و«إن لم يحدث في وقته» (انتهاء العرض / إلغاء بلا رسوم / إلغاء مجاني للمؤثر / استرداد 100% / اعتماد تلقائي). Haptic خفيف عند التبديل؛ تقليل الحركة → بلا مذنّب ولا رسم. تحتها زر **«اعرف خطوات إنهاء الباقة»** → دليل الصفقة (P2.5). **التوقيع: اضغط مطوّلاً** (ثانية + حلقة تمتلئ + haptic خفيف) → `send {device_id}`. **شاشة نجاح الإرسال**: «رحلة الصفقة» على محطة «رد المؤثر» وبطاقتها تحمل عداد الرد الدائري من `due_at` + عند النقص زر «اشحن $Y الآن» → TopUp بالمبلغ جاهزاً (السيرفر يموّل الصفقة تلقائياً). الأخطاء: `deal_price_changed` → ورقة فرق السعر (قديم/جديد) + إعادة التوقيع؛ `deal_offer_exists` → رابط العرض؛ `deal_offer_limit` / `deal_draft_limit` / `deal_creator_unavailable` / `kyc_required` → شاشة المنع نفسها.
- **P2.5 (S)** **دليل الصفقة** «كيف تكتمل الصفقة؟»: صفحة مستقلة بنسختين منفصلتين (علامة / مؤثر)، محتوى ثابت i18n بلا API. هيرو كحلي + خريطة محطات (ضغط → قفز للفصل) + 3 حقائق ثقة؛ فصل لكل محطة (رقم كبير مفرّغ، الفاعل بلون، المدة، الشرح، نقاط، «إن لم يحدث في وقته»)؛ شريط علوي يظهر بعد الهيرو: «المحطة n من N» + تقدّم القراءة؛ **محطة الشحن سياقية**: من داخل صفقة بلا منتج تُخفى تماماً (7 محطات)، وتظهر بوسم «عند وجود منتج مادي» في الدليل العام (البروفايل/الأسئلة الشائعة) أو من صفقة فيها شحن؛ أسئلة شائعة قابلة للطي. مداخلها: زر رحلة الصفقة (P2.4 + P3.3)، وبروفايل العلامة والمؤثر (قسم المساعدة)، ولاحقاً FAQ عام. المدد في النص تُقرأ من `windows` حين تتوفر وإلا القيم الافتراضية.

## P3 — M3 القوائم والتفاصيل (الدوران)

- **P3.0 (M)** تصميم: قائمة + تفاصيل (هيرو الحالة + العداد + «الخطوة التالية») → موافقة.
- **P3.1 (M)** `BrandDeals` + `CreatorDeals` (SuperList، تبويبات مجموعات الحالة، مسودات للبراند فقط).
- **P3.2 (M)** `BrandDealDetail` + `CreatorDealDetail`: هيكل بفتحات أقسام (Hero / Items / Shipping / Upsells / Dispute / Rating). الأقسام تُملأ في المراحل التالية.
- **P3.3 (S)** `Timeline` بارز داخل التفاصيل: `DealJourney` من P2.4 يُغذّى من حالة الصفقة (المحطة الحالية + `due_at`) ومن `getTimeline` (وقت كل محطة منجزة، الفاعل، الملاحظة/السبب؛ صفوف الملاحظات `from==to` كأحداث داخل بطاقة محطتها) — شفافية = ثقة. + زر دليل الصفقة + شاشة `Contract`.

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
5. **معالج العرض (2026-10-13):** 3 خطوات ثابتة (الشحن داخل الخطوة 1) · مدة التنفيذ + خط زمني بلا تواريخ تقويمية · الرصيد تنبيه لا منع، والشحن عند النقص من شاشة نجاح الإرسال (TopUp يدوي بمراجعة، لا يصلح داخل المعالج) · توقيع بالضغط المطوّل لا البصمة · شارات من بيانات حقيقية فقط · `requested_delivery_days` في الخطوة 1 · `blockers` + `windows` ✅ نفّذها الباك إند (preflight + quote، إضافات فقط) مع fallback لأخطاء الإرسال · «رحلة الصفقة» بعرض كامل بدل قائمة جانبية + دليل الصفقة صفحة مستقلة لكل دور.
