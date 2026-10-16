# خطة التنفيذ — الحملات العامة (Public Campaigns) — موبايل

المراجع: `public-campaigns.md` (عقد الـ API، **المرجع عند أي تعارض**) · `mobile-plan.md` (الشاشات وترتيب CM1–CM11) · `docs/direct-deals/mobile-plan.md` (ما بعد Select = شاشات الصفقة الموجودة).
طريقة العمل: كل خطوة = جلسة مستقلة (`/clear` بينها). ابدأ بـ: «نفّذ الخطوة PCx.y من docs/public campaigns/mobile-steps.md».
الحجم: S صغير · M متوسط. النموذج: **O** = Opus · **S5** = Sonnet · **H** = Haiku.
كل شاشة UI تمر بـ `/sada-screen` (معاينة HTML محلية في `design-previews/` → موافقة → بناء). خطوات `.0` = تصميم فقط، بلا كود.
البوابات: أثناء الخطوة targeted (قاعدة 05)؛ آخر خطوة في كل مرحلة: `tsc + lint + test` + `docs/mobile-architecture.md` (قاعدة 11).

## اختيار النموذج

| النموذج | متى | لماذا |
|---|---|---|
| **Opus** | خطوات التصميم `.0` · تدفقات المال/الحالة المعقدة (التسعير + التواريخ، الإرسال، Select، أوراق النظام، التقديم، خروج البريف، الشحن الجماعي) | قرارات إبداعية + قواعد 06 متشابكة؛ خطأ هنا = مال أو ثقة |
| **Sonnet** | الأنواع، الـ APIs، القوائم، التفاصيل، الربط على أنماط موجودة (الأغلبية) | النمط مكتوب أصلاً في Direct Deals؛ أرخص بكثير بنفس الجودة |
| **Haiku** | مزامنة مفاتيح i18n، صف Change Log، بحث `cavecrew-investigator` | ميكانيكي فقط — لا كود فيه قواعد عمل |

---

## 0. قرارات ثابتة (من العقد)

- **لا يوجد مفتاح bootstrap للعلم**: الحملات مفعّلة إذا `active_campaigns ≠ null` (`/brand/home`) أو `campaigns ≠ null` (`/influencer/deals/summary`)؛ أي `404 feature_disabled` → إخفاء كل المداخل. (`mobile-plan.md` يذكر `campaigns.enabled` — غير موجود.)
- المال USD نصوص `"150.00"` → `parseUsd` → `Money` في `transformResponse`. لا حساب على الجهاز؛ صافي المؤثر من `net_usd`. الاستثناء: معاينة صافي المزايدة من `fee_bps` بوسم «تقديري».
- أي `409 campaign_*` → رسالة السيرفر + refetch الحملة. لا إعادة محاولة.
- العدادات من `apply_deadline_at` / `expires_at` / `drop_at` / `due_at` فقط، بتوقيت `Asia/Damascus`.
- `label` من السيرفر كما هو؛ خرائطنا = tone/icon/actions (`Record<CampaignStatus, …>`، مجهول → `key: null`).
- روابط الإشعارات الموجودة فقط: `sada://campaigns/{id}`, `sada://deals/{id}`, `sada://strikes` (روابط `/applications` و`/drop` غير موجودة → التبويب يُختار من حالة الحملة).
- المقارنة: الـ API يقبل 2–4، الواجهة ≤ 3 (مثل الاستكشاف).
- فلاتر feed المؤثر على السيرفر: `activity_type` + `pricing_model` فقط. لا فلترة محلية على صفحات محمّلة جزئياً (تكذب مع الترقيم).

## قرارات مفتوحة (تُحسم في بداية الخطوة المذكورة)

1. **PC0.3** مكان الحملات في التبويبات (الخمسة ممتلئة): أ) البراند: تبويب «الحملات» الحالي = مقسّم «حملاتي | صفقاتي»؛ المؤثر: «فرص» يحل محل placeholder الرسائل. ب) كلاهما داخل تبويب الصفقات + شريط الرئيسية. **الاقتراح: أ**.
2. **PC3.4 / PC5.1** هل يقبل الباك إند `Idempotency-Key` على `select` و`apply`؟ (العقد لا يذكره؛ كلاهما ملزم). اسأل الباك إند قبل الخطوة.
3. **PC1.0** تجميع خطوات المعالج الثماني (المقترح 5: الفكرة · المطلوب · المال والمقاعد · الشحن والبريف · المراجعة) — يُحسم في التصميم.

## خريطة إعادة الاستخدام

| الحاجة | الموجود | الإجراء |
|---|---|---|
| رفع ملفات (غلاف/مرفقات) | `core/upload` (`uploadFile`, `useFileUploads`) | سياسة `CAMPAIGN_UPLOAD_POLICY` + slot mutation |
| البريف الخاص | `Brief*` في `OfferBuilderScreen/components` | **نقل** للـ `marketplace/components` ثم مشاركة |
| كتالوج الخدمات | `core/api/rateCardCatalogApi` | picker بوضع catalog (بلا أسعار) |
| المحفظة/النقص/الشحن | `WalletHold`, شاشات `TopUp*`, `DealFundingCard` | ربط مباشر |
| التوقيع | `DealHoldToSign` | Select + Apply |
| الأوراق | `DealSheetFrame`, `DealReasonSheet`, `ConfirmSheet` | مباشر |
| الصفقة بعد Select | `DealDetailView` + كل أقسامها | إضافات فقط (PC6) |
| المديا كيت / المختصرة | `MediaKitPublic`, `ShortlistScreen` | روابط |
| KYC | `KycScreen` + `brandKycStepScreens` | بوابة الإرسال/Select |
| Strikes | `StrikesScreen` | شارة «شديدة» |
| الإشعارات | `notificationRoute.ts`, `pushPayload.ts` | أنواع `campaign_*` |

---

## PC0 — الأساس (بدون UI)

- **PC0.1 (M · S5)** الأنواع + DTO + mappers: `CAMPAIGN_STATUS` (11) + `APPLICATION_STATUS` (8) + `Campaign` (brand) / `CreatorCampaign` / `Quote` / `Timers` / `SeatFreed` / `Recruiting` / `Funding` / `ApplicantCard` / `CreatorApplication` / `HistoryRow` / `Eligibility`. خرائط `Record<…>` (tone/icon/tab group). اختبارات mappers + خرائط.
- **PC0.2 (M · S5)** `brandCampaignsApi` + `creatorCampaignsApi`: list/detail/history فقط + tags (`Campaign`, `CampaignList`, `CampaignHistory`, `CampaignApplication*`) + `ApiErrorCode` لكل أكواد §8 + hook `useCampaignAction` (409 → toast + refetch، replace cache من `data`). + كشف العلم: `useCampaignsEnabled` (من home/summary) + `feature_disabled` → flag في slice. اختبارات.
- **PC0.3 (S · S5)** الملاحة: حسم القرار 1 → routes في `core/navigation/types.ts` + navigator لكل دور (شاشات placeholder) + deep link `sada://campaigns/{id}` + `PushTarget` campaign.
- **PC0.4 (S · S5)** جنس المؤثر: picker في `PersonalInfoScreen` (`PATCH /influencer/profile`) + خطوة onboarding 2 (اختياري). شرط لـ `gender_required`.

## PC1 — معالج الحملة (البراند · CM1)

- **PC1.0 (M · O)** تصميم: المعالج كاملاً + شاشة «قيد المراجعة» + حالة «طلب تعديلات» + ورقة الاستئناف/التكرار. حسم القرار 3.
- **PC1.1 (M · S5)** محرك المسودة: POST ثم PUT للأقسام المتغيرة فقط، طابور حفظ، `missing[]` → حالة كل خطوة، `campaign_draft_limit`، استئناف + Duplicate (`/duplicate` → المعالج على الخطوة 1).
- **PC1.2 (M · S5)** الأساسيات: العنوان (3–120)، نوع النشاط (`/lookups`)، الغلاف (upload 3 خطوات، صورة واحدة)، الإعلان العام (≤1000).
- **PC1.3 (M · S5)** المطلوب: `CatalogDeliverablePicker` (منصة × خدمة × عدد 1–10 × تعديلات 0–3 + إضافات؛ ≤20 سطر/≤20 وحدة؛ بلا `on_site`) + الاستهداف (جنس، حد متابعين = بوابات؛ مدن ≤ ونيش ≤5 = «للترتيب فقط»).
- **PC1.4 (M · O)** المال والمقاعد والتواريخ: ثابت/مزايدة (التبديل يمسح الآخر)، ميزانية اختيارية، `/quote` حي (debounce)، مقاعد 1–20، موعد التقديم ≤30 يوم، `delivery_days` **أو** `drop_at` (فجوة 120/240 س)، التواريخ المشتقة من `drop`.
- **PC1.5 (M · S5)** الشحن (بدون/هدية/مستردة + ملاحظة الإرجاع) + البريف الخاص (نقل `Brief*` المشتركة + قفل «يُكشف بعد التمويل») + مرفقات ≤5.
- **PC1.6 (M · O)** المراجعة والإرسال: ملخص، تحذير المحفظة (`wallet.shortfall_usd`)، بوابة KYC، الأخطاء (`campaign_not_ready` → أول خطوة ناقصة، `campaign_live_limit`، `kyc_required`) → شاشة «قيد المراجعة». **نهاية مرحلة: بوابات كاملة + docs.**

## PC2 — حملاتي + أوراق النظام (البراند · CM2 + CM4)

- **PC2.0 (M · O)** تصميم: القائمة (4 تبويبات) + التفاصيل + الشرائط (شبح 48س، معلّقة، صفر متقدمين، مقعد محرَّر) + الخط الزمني.
- **PC2.1 (M · S5)** القائمة: تبويب لكل مجموعة `status[]`، عدّاد من `meta.total`، بطاقة (الحالة، `SeatMeter`، الطلبات المفتوحة، العدّاد، «الميزانية مؤمّنة»).
- **PC2.2 (M · S5)** التفاصيل: الهيدر + `review_note` + إحصاءات + `/history` → Timeline (ملاحظات `from==to`، سبب مجهول → `to.label`).
- **PC2.3 (M · O)** إجراءات دورة الحياة: تعديل بعد النشر (قفل `terms_locked_at` + `campaign_field_locked` → تعطيل الحقول)، إضافة مقاعد، تمديد الموعد، إغلاق ↔ إلغاء (حسب المقاعد المشغولة)، حذف مسودة، تكرار.
- **PC2.4 (M · O)** أوراق النظام CM4: `seat_freed` (استبدال/تقليص/إعادة فتح + تاريخ إن `deadline_passed`)، صفر متقدمين (تعديل/+4 أيام/إلغاء)، شريط الشبح، المعلّقة (إعادة فتح بلمسة + عدّاد الإلغاء). **نهاية مرحلة.**

## PC3 — المتقدمون والاختيار (البراند · CM3)

- **PC3.0 (M · O)** تصميم: القائمة، بطاقة المتقدم، المقارنة، ورقة التأكيد، بطاقة «يلزم دفع — 24 س»، سؤال «أكمل التجنيد / أغلق».
- **PC3.1 (M · S5)** القائمة: تبويبات جديد/مختصر/مختار + شارات من `meta.counts`، ترتيب، فلاتر (محافظة، نيش، متابعين، مدعو)، صف بعدّاد 72 س.
- **PC3.2 (S · S5)** تفاصيل المتقدم: المديا كيت (`creator.slug`)، التقييم، الـ pitch، الحسابات + اختصار/رفض (`campaign_application_expired` → تحديث).
- **PC3.3 (S · S5)** المقارنة ≤3.
- **PC3.4 (M · O)** Select: ورقة التأكيد + توقيع مطوّل + `device_id` (+ idempotency حسب القرار 2) → ممول: فتح الصفقة · غير ممول: `missing_usd` → TopUp → العودة للصفقة · `recruiting.prompt_close` · كل أخطاء §3.5.
- **PC3.5 (S · S5)** الدعوات: من المختصرة «ادعُ لحملة» → ورقة اختيار الحملة → تقرير لكل مؤثر (`reason`، الحد 50). **نهاية مرحلة.**

## PC4 — الاكتشاف (المؤثر · CM5) — يمكن البدء بعد PC0

- **PC4.0 (M · O)** تصميم: بطاقة الـ feed، الإعلان، المحفوظات، ورقة التقديم، طلباتي (يغطي PC5 أيضاً).
- **PC4.1 (M · S5)** الـ Feed: بطاقة (الصافي عنواناً، المقاعد، الموعد، الدروب، شارات مدعو/مؤمّنة/شحن)، فلاتر السيرفر، empty state بشروط الأهلية، حفظ متفائل.
- **PC4.2 (M · S5)** الإعلان + المحفوظات: قفل البريف الخاص، `eligibility.reasons` → تعطيل التقديم بالسبب، `gender_required` → البروفايل، فتح الإعلان يعلّم الدعوة مقروءة.

## PC5 — التقديم وطلباتي (المؤثر · CM6)

- **PC5.1 (M · O)** ورقة التقديم: مزايدة (≤ max، ≥ $5) + معاينة صافٍ تقديرية، حساب لكل منصة مطلوبة (`/influencer/platforms`)، pitch ≤500، ملخص الشروط + موافقة «عرض ملزم 72 س»، توقيع مطوّل، كل أخطاء §4.2 (حقول 422 → مكانها، `creator_restricted` → شريط).
- **PC5.2 (M · S5)** طلباتي: مفتوحة/مختارة/مغلقة، `state` (application ↔ deal)، سحب، «لم يتم اختيارك» محايد، فتح الصفقة. **نهاية مرحلة.**

## PC6 — الصفقة المرتبطة (الدوران · CM7)

- **PC6.1 (S · S5)** DTO: `origin`, `campaign {id,title}`, `brief_hidden`, `drop`, `shipping.ship_from`, `cancellation.*.brief_exit_*`, `return_shipment` + mappers + شريحة الحملة في الهيرو و`DealTicket`.
- **PC6.2 (M · O)** كشف البريف + خروج 24 س (شريط + ورقة، `deal_brief_exit_available` → توجيه للخروج) + سحب بلا عقوبة في `awaiting_payment` + زر الشحن معطّل حتى `ship_from`.
- **PC6.3 (M · S5)** الدروب في الصفقة: عدّاد، النشر مقفل حتى `publish_opens_at` (`campaign_drop_not_open`)، شارة التأخر + الإعلانات كصفوف timeline (ميغافون). **نهاية مرحلة.**

## PC7 — الرئيسية (C14)

- **PC7.0 (S · O)** تصميم: سكة «حملاتي النشطة» للبراند + شريط «حملات لك» للمؤثر.
- **PC7.1 (S · S5)** البراند: `active_campaigns` (توجيه حسب `action.key`) + `fund_deals.campaign_count` + شريحة الحملة في `active_deals`.
- **PC7.2 (S · S5)** المؤثر: `campaigns` في الملخص + شارة `new_invites`. **نهاية مرحلة.**

## PC8 — الدروب + أدوات الدفعة (البراند · CM8 + CM9)

- **PC8.0 (M · O)** تصميم: لوحة الدروب + الشحن الجماعي + الإعلانات.
- **PC8.1 (M · S5)** لوحة الدروب: عدّاد، ملخص `totals`، صف لكل مؤثر → الصفقة، سحب للتحديث + تحديث عند push.
- **PC8.2 (M · O)** الشحن الجماعي: كشف العنوان بلمسة («المشاهدة مسجّلة»)، موانع + عدّاد `ship_from`، إرسال الكل → نتيجة لكل صف (الفاشل يبقى قابلاً للتعديل).
- **PC8.3 (S · S5)** الإعلانات: محرر ≤1000 + رابط، «x من 3 اليوم»، `429` → `next_available_at`، السجل. **نهاية مرحلة.**

## PC9 — الإرجاع والقيود (CM10)

- **PC9.0 (S · O)** تصميم: نموذج البوليصة + الشريط العام + أوراق البراند.
- **PC9.1 (M · S5)** المؤثر: نموذج بوليصة الإرجاع + `GET /influencer/restrictions` → شريط عام + معالجة `403 creator_restricted` + شارة «شديدة» في Strikes.
- **PC9.2 (M · S5)** البراند: استلام / بلاغ مشكلة (multipart صور ≤5) / تنازل. **نهاية مرحلة.**

## PC10 — الإشعارات (CM11)

- **PC10.1 (S · S5)** كل أنواع §7 في `notificationRoute` + refetch حسب النوع (invalidate tags) + فلتر الفئات محلياً (`campaign_` / `deal_`). **نهاية الميزة: بوابات كاملة + docs + `/code-review` (O).**

---

## الترتيب

`PC0 → PC1 → PC2 → PC3 → PC6 → PC7 → PC8 → PC9 → PC10`؛ مسار المؤثر `PC4 → PC5` مستقل بعد PC0 (يحتاج PC0.4).
للاختبار على الجهاز: البراند أولاً (حملة منشورة) ثم المؤثر — أو بيانات مزروعة من الباك إند.
