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
3. ~~**PC1.0** تجميع خطوات المعالج~~ ✅ حُسم 2026-10-17: **4 خطوات** — الفكرة · المطلوب · المال والمقاعد · المراجعة. الشحن سؤال واحد بثلاث بطاقات (بلا منتج · مع منتج بلا إعادة=gift · مع منتج مع إعادة=returnable) داخل «المطلوب»؛ البريف الخاص سطر اختياري يفتح ورقة (خارج `missing[]`).

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

- ✅ **PC0.1 (M · S5)** 2026-10-17 — الأنواع + DTO + mappers: `CAMPAIGN_STATUS` (11) + `APPLICATION_STATUS` (8) + `Campaign` (brand) / `CreatorCampaign` / `Quote` / `Timers` / `SeatFreed` / `Recruiting` / `Funding` / `ApplicantCard` / `CreatorApplication` / `HistoryRow` / `Eligibility`. خرائط `Record<…>` (tone/icon/tab group). اختبارات mappers + خرائط.
  - الملفات: `marketplace/types/{campaign,campaignDto}.ts` · `utils/campaignMappers.ts` + `campaignStatus.ts` · `constants/{campaignStatus,campaignStatusIcons}.ts` (+ `CAMPAIGN_TAB_STATUSES` / `APPLICATION_TAB_STATUSES` لفلتر `status[]`) · اختبارات في `utils/__tests__/campaign*.test.ts`.
  - التفاصيل: القائمة = `Campaign`، التفصيل وردود POST = `CampaignDetail` (+ timers/privateBrief/attachments). `Funding` = نفس `DealFunding`. `recruiting.status` يقبل نصاً أو `{key,label}` (العقد غامض). مساعدات `oneOf/toLabeled/toTimestamp*` صارت مُصدَّرة من `dealMappers.ts`.
  - بوابات: tsc + eslint (marketplace) + jest marketplace (518) نظيفة.
- ✅ **PC0.2 (M · S5)** 2026-10-17 — `brandCampaignsApi` + `creatorCampaignsApi`: list/detail/history فقط + tags (`Campaign`, `CampaignList`, `CampaignHistory`, `CampaignApplication*`) + `ApiErrorCode` لكل أكواد §8 + hook `useCampaignAction` (409 → toast + refetch، replace cache من `data`). + كشف العلم: `useCampaignsEnabled` (من home/summary) + `feature_disabled` → flag في slice. اختبارات.
  - الملفات: `marketplace/api/{brandCampaignsApi,creatorCampaignsApi}.ts` · `utils/{campaignQuery,campaignAction,campaignFlag}.ts` · `hooks/{useCampaignAction,useCampaignsEnabled}.ts` · `store/{campaignFlagSlice,campaignFlagSelectors}.ts` (مسجّل في `rootReducer` كـ `campaignFlag`) · `core/api/types.ts` (+31 كود: `feature_disabled`، `creator_restricted`، كل `campaign_*`، `deal_brief_exit_*`، `deal_return_unavailable`) · tags جديدة في `baseApi` · اختبارات + `utils/__fixtures__/campaignDto.ts` (fixtures مشتركة بين اختبارات الحملات).
  - التفاصيل: البراند = `getCampaigns` (infinite، `status[]`) / `getCampaign` / `getCampaignHistory` + mutation `runCampaignAction` (submit/seats/seats-reopen/seats-reduce/deadline/reopen/zero-applicants-extend/cancel/close/duplicate): النجاح يستبدل كاش `getCampaign` بـ `data` (duplicate يخزّن الجديد)، 409 `campaign_*` → toast + refetch، 422/403 تعود للشاشة. المؤثر = `getCampaignFeed` (فلتران فقط) / `getSavedCampaigns` / `getCreatorCampaign` / `getCampaignApplications` / `getCampaignApplication`. `creator_restricted` (403) مُمرَّر من baseQuery. الـ wallet الخاص بـ submit يُقرأ من `meta` أو `data` (العقد غامض). العلم: `campaignsEnabled` جديد في `BrandHome` و`CreatorDealSummary` (= `active_campaigns`/`campaigns` ≠ null)، و`useCampaignsEnabled(role)` يعيد `true|false|null` (null = Home لم يصل) من الكاش بلا طلب جديد؛ slice يسجّل `404 feature_disabled` ويُصفَّر عند Home يقول مفعّل أو عند logout.
  - لم يُنفَّذ (خارج النطاق): تعديل المسودة/رفع الملفات (PC1)، المتقدمون/Select (PC3)، bookmark/apply/withdraw (PC4–5)، `PushTarget` campaign (PC0.3). hooks/APIs غير مُصدَّرة من `index.ts` حتى يظهر مستهلك؛ المُصدَّر فقط `campaignFlagReducer`.
  - بوابات: tsc + eslint (marketplace، core/api، app/store) + jest (marketplace 546، core+app+auth 424) نظيفة.
- ✅ **PC0.3 (S · S5)** 2026-10-17 — الملاحة: حسم القرار 1 → routes في `core/navigation/types.ts` + navigator لكل دور (شاشات placeholder) + deep link `sada://campaigns/{id}` + `PushTarget` campaign.
  - القرار 1 = أ: البراند يبقى `DealsTab` («حملاتي» + مقسّم حملاتي | صفقاتي داخل الشاشة الجذر في PC2.1)؛ المؤثر `OpportunitiesTab` («فرص») بدل placeholder الرسائل.
  - الملفات: `core/navigation/types.ts` (`OpportunitiesStackParamList` + `DealsStackParamList.CampaignDetail` + `OpportunitiesTab` + `OpportunitiesStackScreenProps`) · `marketplace/navigation/OpportunitiesNavigator.tsx` · شاشات placeholder `Brand/CreatorCampaignDetailScreen` + `CreatorOpportunitiesScreen` (على `components/CampaignComingSoon`) · `app/navigation/{MainTabs,tabRoot}` · `core/notification/pushPayload.ts` (`PushTarget` campaign) · `notifications/utils/notificationRoute.ts` + `useNotificationsScreen` · `marketplace/{utils/campaignPush,hooks/useCampaignPushRefresh}` (مربوط في `App.tsx`) · مفاتيح i18n `tabs.opportunities` + `marketplace.campaign.detailTitle` · قاعدة `12-ref-boot-navigation`.
  - التفاصيل: تبويب فرص يظهر للمؤثر إلا إذا أكّد السيرفر أن الحملات مغلقة (`useCampaignsEnabled('creator') === false` → يعود placeholder الرسائل)؛ `null` يُبقيه حتى لا يضيع tap إشعار عند البدء البارد. رابط `sada://campaigns/{id}` فقط (الروابط الفرعية غير موجودة بالعقد §7) → البراند `DealsTab/CampaignDetail`، المؤثر `OpportunitiesTab/CampaignDetail`، دور مجهول → صندوق الإشعارات. أنواع `campaign_*` تُوجَّه بالرابط وحده (type `null`) كالصفقات؛ الـ push يبطل tags الحملة (البراند والمؤثر معاً).
  - لم يُنفَّذ: مقسّم «حملاتي | صفقاتي» (PC2.1)، رابط من شارة الصفقة لحملتها، شارة تبويب فرص (PC4)، أيقونات `campaign_*` في الإنبوكس، إبطال `CampaignApplicationList` عند push الصفقة (`campaign_selected`/`campaign_drop_*` رابطها صفقة، نوعها غير معروف للـ listener) → PC5.2.
  - بوابات: tsc + eslint (app، core، marketplace، notifications) + jest (62 suites، 681) نظيفة.
- ✅ **PC0.4 (S · S5)** جنس المؤثر: picker في `PersonalInfoScreen` (`PATCH /influencer/profile`) + خطوة onboarding 2 (اختياري). شرط لـ `gender_required`. 2026-10-17
  - الملفات: `auth/store/authTypes.ts` (`INFLUENCER_GENDERS`/`InfluencerGender`/`isInfluencerGender` + `gender?` في `InfluencerStep2Request` و`InfluencerProfileResource`) · `auth/hooks/useInfluencerGenderItems` (مُصدَّر من `index.ts`) · `InfluencerSocialsScreen` (قسم «الجنس» اختياري + المسودة MMKV) · `identity/{types/profile,api/accountApi,schemas/personalInfoSchema,utils/profilePatch}` + `PersonalInfoScreen` · مفاتيح i18n `common.gender.*` و`…socials.gender*` و`account.personalInfo.gender*`.
  - التفاصيل: الاختيار اختياري في الخطوتين؛ الـ PATCH يُرسل `gender` فقط عند اختياره/تغييره (لا يوجد «إلغاء» في العقد §4.4 فلا يُرسل فارغاً). قيمة غير معروفة من السيرفر = «غير محدد». مسودة socials القديمة تُقرأ بلا جنس.
  - لم يُنفَّذ: ربط `gender_required` من بطاقة الحملة بشاشة الملف (PC4.2/PC5.1، وهي تفتح `PersonalInfo` هذه)؛ عرض الجنس في صفحة الملف العامة (لا يُعرض).
  - بوابات: tsc + eslint (auth، identity) + jest (auth+identity+app+core: 90 suites، 793) نظيفة.

## PC1 — معالج الحملة (البراند · CM1)

- ✅ **PC1.0 (M · O)** 2026-10-17 — تصميم معتمد (`design-previews/campaign-wizard.html`، محلي): هيدر وستيبس بنمط «طلب خدمة مباشرة» (كبسولة، يطوي الصف العلوي عند التمرير، دوك عائم) · اسم الحملة يحلّ محل عنوان الهيدر · معاينة بطاقة المؤثر في ورقة عبر زر «معاينة» عائم (padding سفلي كافٍ) · «حملة جديدة» تفتح الخطوة 1 مباشرة، وورقة المسودة فقط عند اختيار مسودة سابقة أو إشعار مسودة ناقصة · البطاقة تعرض `net_usd`، والإجمالي والعمولة داخل الخطوة 3 · الدوك بلا «أقصى حجز» حتى الخطوة 3 · ملاحظة الإعادة محذوفة (العقد: `shipping_mode` فقط).
- ✅ **PC1.1 (M · S5)** 2026-10-17 — محرك المسودة (بدون UI): POST بالعنوان ثم PUT لقسم واحد متغيّر لكل طلب، `missing[]` → حالة الخطوات، `campaign_draft_limit`، استئناف + Duplicate (الخطوة الأولى).
  - الملفات: `types/campaignDraft.ts` (`CampaignDraftValues` + أجسام الإرسال + `CAMPAIGN_DRAFT_SECTION` + `CampaignWizardProgress`) · `constants/campaignDraft.ts` (حدود، تأخير الحفظ 800ms، خريطة `missing` → خطوة) · `utils/campaignDraft.ts` (القيم ↔ الأقسام، `dirtyDraftSections`، `campaignWizardProgress`، `draftEntryStep`) · `utils/campaignDraftSync.ts` (الطابور `createCampaignDraftSyncer`) · `hooks/useCampaignDraft.ts` · endpoints `createCampaign` / `updateCampaign` / `deleteCampaign` في `brandCampaignsApi` · اختبارات (draft 20، sync 12، api +4).
  - التفاصيل: الإنشاء بالعنوان فقط (≥3)، وقاعدة المقارنة = ما ردّه السيرفر (القيم الافتراضية لا تُعاد). كل قسم بطلب PUT مستقل بترتيب ثابت (الشحن قبل الجدول، المقاعد قبل التسعير) فلا يعلق قسم صالح خلف قسم مرفوض. 422 على قسم → `refused[قسم]` مع حقوله ويُتخطى حتى يتغيّر؛ `campaign_draft_limit` / 409 `campaign_*` / 404 → يوقف الطابور (`failure` limit/conflict) حتى `retry()`؛ شبكة → يُعاد عند التعديل التالي أو `flush()`. طلب واحد في الجو دائماً؛ التعديل أثناءه يُلتقط بنفس الدورة. التسعير يرسل حقول النموذج المختار فقط، والجدول يرسل `drop_at` أو `delivery_days` والآخر `null`. الاستئناف: البداية `draftEntryStep(...,'resume')` = أول خطوة ناقصة وإلا المراجعة، والتكرار = الخطوة 1 (`useCampaignAction.run('duplicate')` موجود). الخروج من المعالج يحفظ المعلّق ثم يبطل القائمة والـ home مرة واحدة (لا إبطال مع كل حفظ).
  - افتراضات من العقد لم تُختبر مع السيرفر: ردّ `POST`/`PUT` = `CampaignResource` كامل (التفصيل)؛ إرسال `null` لـ `seat_price_usd`/`bid_*`/`teaser`/`activity_type` يمسحها؛ `drop_at` مع `delivery_days: null` لا يطلق `campaign_delivery_with_drop`. أي اختلاف → يُعدَّل في `draftSectionsOf` فقط.
  - لم يُنفَّذ: أي شاشة (PC1.2+)، ورقة المسودة (استئناف/تكرار/حذف) وحوار حد 20 → تستهلك `failure.kind === 'limit'` + `useDeleteCampaignMutation`، `/quote` (PC1.4)، رفع الغلاف والمرفقات (PC1.2/1.5).
  - بوابات: tsc + eslint (marketplace) + jest marketplace (50 suites، 584) نظيفة.
- ✅ **PC1.2 (M · S5)** 2026-10-17 — الأساسيات + هيكل المعالج: الخطوة 1 «الفكرة» (الغلاف، العنوان 3–120، نوع النشاط من `/lookups`، الإعلان العام ≤1000) تحت هيدر الستيبس والدوك المعتمدين في PC1.0.
  - الملفات: `screens/CampaignWizardScreen/` (الشاشة + `hooks/useCampaignWizardScreen` + `hooks/useCampaignCover` + سياق المعالج + `components/`: `CampaignWizardHeader`، `CampaignWizardDock`، `IdeaStep`، `CampaignCoverField`، `ActivityTypeField`، `CampaignField`، `LeaveSheet`، `CampaignStepSoon`) · `components/WizardRail{Header,Stop,Connector}` + `WizardSaveLabel` (الهيدر العام مستخرج من `OfferTicketHeader` الذي صار غلافاً رقيقاً فوقه بنفس المظهر) · `utils/campaignWizard.ts` (ترتيب الخطوات، حالة كل نقطة في الشريط، قاعدة العنوان، رسالة الرفض) · `constants/campaignWizard.ts` + `campaignUploads.ts` · endpoints `requestCampaignFileSlot` / `completeCampaignFile` / `removeCampaignFile` (يحدّثون كاش `getCampaign` بلا إعادة قراءة) · `campaign_activity_types` في `LookupsResponse` · مسار الجذر `CampaignWizard` (براند فقط) · زر «+» في هيدر تبويب الحملات للبراند (يظهر فقط مع `campaignsEnabled`؛ مؤقت حتى PC2.1).
  - السلوك: العنوان ≥3 ينشئ المسودة تلقائياً؛ «التالي» ينتظر `flush()` ولا يتقدّم إن تعذّر الحفظ (`canContinue` جديد في الـ syncer). الغلاف يحتاج مسودة: بلا عنوان صالح → تنبيه وتركيز على العنوان. رفع الغلاف: slot → PUT → complete، يظهر مباشرة بالصورة المحلية مع تقدّم، ويبقى الفاشل قابلاً للإعادة/التجاهل. الشريط: أي خطوة بنقرة بعد وجود المسودة؛ خطوة خلفية ناقصة بلون التحذير، الأمامية محايدة. فشل يوقف الحفظ (حد المسودات / تغيّر الحملة / الشبكة) يظهر شريطاً تحت الهيدر بمخرجه. الإغلاق يحفظ ثم يخرج، وإن تعذّر الحفظ → ورقة «خروج دون حفظ؟». الرجوع (الهاردوير) يمشي بين الخطوات. استئناف ← أول خطوة ناقصة.
  - لم يُنفَّذ: الخطوات 2–4 (placeholder `CampaignStepSoon` يستبدله PC1.3–1.6) · زر «معاينة» العائم وورقة بطاقة المؤثر (بعد PC1.4 حين يوجد السعر) · ورقة المسودة (استئناف/تكرار/حذف) · أي اختبار hooks/شاشات (لا سابقة `renderHook` في المشروع).
  - ملاحظات الباك إند (ردّ المراجعة): `campaign_field_locked` يأتي بـ `meta.fields` لا `errors` (بعد أول تقديم لا يبقى قابلاً للتعديل إلا `title` و`teaser`) → يُعالج في PC2.3؛ `delivery_days` غير null مع `drop_at` مخزَّن ← `campaign_delivery_with_drop` حتى لو لم يُرسل `drop_at` (الجدول يرسل الاثنين معاً دائماً ✔). **تناقض مفتوح للتأكيد:** رد الباك إند يقول إن `budget_usd` يُمسح مع `fixed` وإرساله غير null = `campaign_pricing_conflict`، بينما العقد (§3.2 + مثال المورد) يسمح بميزانية مع الثابت. المحرك الآن يرسل `budget_usd` مع الاثنين؛ يُحسم قبل PC1.4 (إن صحّ كلام الباك إند: الميزانية للمزايدة فقط ويُعدَّل `pricingBody`).
  - بوابات: tsc + eslint (marketplace/app/core) + jest (marketplace 51 suites / 601، core+app 33 / 330) نظيفة. غير مُتحقَّق منه على الجهاز: RTL، الداكن، لوحة المفاتيح، منتقي الصور، رفع فعلي مع S3، حركة الشريط.
- ✅ **PC1.3 (M · S5)** 2026-10-17 — الخطوة 2 «المطلوب»: أسطر المحتوى من الكتالوج + الاستهداف.
  - الملفات: `screens/CampaignWizardScreen/components/`: `RequirementsStep`، `DeliverablesField`، `DeliverableLineCard`، `CatalogServiceSheet` + `CatalogServiceRow`، `TargetingGates`، `TargetingRanking` · `hooks/useCampaignRequirements` (يُركَّب في `useCampaignWizardScreen` كحقل `requirements`) · `utils/campaignDeliverables.ts` (خيارات الكتالوج بلا الخدمات غير المرتبطة بمنصة، إضافة/حذف/عدد/تعديلات/إضافات، الحد 20 وحدة) + `campaignTargeting.ts` · `constants/campaignRequirements.ts` · `CampaignField` صار يقبل `tagTone`.
  - السلوك: ورقة كتالوج (المنصة ثم الخدمات بعلامة اختيار؛ تبقى مفتوحة لإضافة عدة أسطر) · بطاقة لكل سطر: العدد 1–10 وجولات التعديل 0–3 وإضافات الخدمة كما يعرضها الكتالوج · عدّاد وحدات n/20 (الحد الأعلى للعدد = ما تبقّى من الـ20) · كل سطر منصة+خدمة مرة واحدة · الاستهداف: الجنس والحد الأدنى للمتابعين (1K–100K، الضغط ثانية يمسح) كشروط، والمدن والمجالات (≤5) «للترتيب فقط». رفض السيرفر (422) لـ `deliverables`/`targeting` يظهر تحت حقله. الكتالوج من `useGetRateCardCatalogQuery` (كاش MMKV فيعمل دون اتصال).
  - **قرار الباك إند المعتمد (يطبَّق الآن):** `budget_usd` يُرسَل مع المزايدة فقط، و`null` مع الثابت → `pricingBody` عُدِّل، ومقارنة التغييرات تتجاهل الميزانية مع الثابت (اختبارات). PC1.4: حقل الميزانية يظهر مع المزايدة فقط.
  - لم يُنفَّذ: الشحن والبريف الخاص (PC1.5، في نفس الخطوة 2) · اختبارات hook/شاشات · عرض الإضافات بأسعار (الكتالوج هنا بلا أسعار).
  - افتراض: إضافات الخدمة المعروضة = كل ما يعيده الكتالوج للخدمة؛ السيرفر يرفض غير المتاح (`campaign_addon_not_offered`).
  - بوابات: tsc + eslint (marketplace/core) + jest marketplace (52 suites / 612) نظيفة. غير مُتحقَّق منه على الجهاز: RTL، الداكن، الورقة، لوحة المفاتيح.
- ✅ **PC1.4 (M · O)** 2026-10-17 — الخطوة 3 «المال والمقاعد»: التسعير + المقاعد + `/quote` + التواريخ.
  - الملفات: `screens/CampaignWizardScreen/components/`: `MoneyStep`، `PricingField`، `SeatsField`، `CampaignQuoteCard`، `ScheduleField`، `DateFieldButton`، `CampaignDateSheet` + `CampaignCalendar`، `DropTimeline`، `CampaignWizardStepBody` (switch شامل بدل الـ ternary) · `hooks/useCampaignMoney` + `useCampaignSchedule` (حقلا `money` و`schedule` في `useCampaignWizardScreen`) · `utils/campaignPricing.ts` + `campaignSchedule.ts` · `constants/campaignMoney.ts` · `refusalFieldMessage` / `refusalLeftover` في `campaignWizard.ts` · endpoint `getCampaignQuote` (tag `CampaignQuote` جديد في `baseApi`) · الدوك يعرض «أقصى حجز · تقدير» في الخطوتين 3 و4.
  - السلوك: ثابت/مزايدة (التبديل يمسح حقول الآخر؛ الميزانية مع المزايدة فقط) · سعر المقعد مع نطاق $5–$50,000 · المزايدة: أقل عرض (استرشادي) + أعلى عرض (ملزم) + سقف ميزانية اختياري · العمولة وصافي المؤثر تحت السعر من `/quote` فقط، وتُخفى حين لا يطابق الـ quote السعرَ المكتوب (حفظ أحدث في الطريق) · مقاعد 1–20 بشريط 20 خانة · بطاقة الـ quote (داكنة): أقصى حجز (منت، «تقدير»)، أقل تقدير إن اختلف، الرصيد، النقص أو «تغطيه» + تنبيه «لا يُحجز شيء الآن» (تحذير + دعوة للشحن عند النقص) · موعد التقديم: تقويم من اليوم حتى +30 يوماً، يُغلق نهاية اليوم بتوقيت دمشق (مقصوص تحت حد الـ30 بساعة) · «متى يُنشر؟»: مدة تسليم (رقائق 3–90 يوماً + قيمة المسودة إن كانت غيرها) **أو** دروب (تقويم يبدأ من أقرب موعد قانوني + أوقات 12/15/18/20/21/22، تظهر فقط الأوقات المسموحة في ذلك اليوم) · تحذير محلي إن صار الدروب أقرب من الفجوة (120/240 س حسب الشحن) · الجدول الزمني (نهاية التقديم، المسودات، فتح رابط النشر، الدروب) + «أبعد موعد تقديم» من `drop` في ردّ السيرفر فقط، ويُخفى حتى يُحفظ الدروب المعروض. رفض السيرفر يظهر تحت حقله (سعر/عرض/ميزانية/مقاعد/موعد/دروب) والعام مرة واحدة.
  - `/quote` حي بلا طلب لكل ضغطة: يُبطَل بعد نجاح حفظ قسم التسعير أو المقاعد أو الأسطر فقط (تأخير الحفظ 800ms = الـ debounce)، ويُعاد عند فتح الخطوة (الرصيد قد تغيّر).
  - قرارات: التوقيت دمشق ثابت UTC+3 (سوريا بلا توقيت صيفي منذ 2022) في الحساب والعرض، بغض النظر عن منطقة الجهاز · أوقات الدروب قائمة ثابتة (لا منتقي ساعات حر) · الأسبوع في التقويم يبدأ السبت.
  - لم يُنفَّذ: زر «معاينة» العائم وبطاقة المؤثر (PC1.6 أو بعده) · رابط «اشحن الآن» (PC1.6 مع تحذير المحفظة) · لمس شريط المقاعد · تفصيل `/quote` عند لمس إجمالي الدوك (سؤال مفتوح) · اختبارات hooks/شاشات.
  - بوابات: tsc + eslint (marketplace، core/api) + jest (marketplace + core + app: 87 suites / 967) نظيفة. اختبارات جديدة: `campaignSchedule` (14)، `campaignPricing` (7)، refusal (2)، api quote (2). غير مُتحقَّق منه على الجهاز: RTL، الداكن، التقويم داخل الورقة، لوحة المفاتيح فوق حقول المال، شكل الدوك مع الإجمالي، Hermes `Intl` مع `timeZone: 'UTC'`.
- ✅ **PC1.5 (M · S5)** 2026-10-17 — الخطوة 2 تكتمل: الشحن + البريف الخاص + مرفقات ≤5.
  - الملفات: `components/brief/` (جديد، مشترك بين العرض المباشر والحملة): `BriefBlock`، `BriefEntryList`، `BriefEntryAdder`، `BriefTemplates`، `BriefToneChips` (props: `active`/`onToggle`)، `BriefFileTiles` (props: `attachments`/`max`/`caption`/`onAdd`)، `BriefFileSourceSheet` + `BriefFileSourceTile` + `PhotoFanArt` + `DocStackArt` (منقولة من OfferBuilder) · `components/SheetTitle` (منقول) · `utils/briefEntries.ts` (منطق صرف: التطبيع، الدمج حتى 10، القوالب، النغمات، `isBriefLink`) + `utils/briefFiles.ts` (`pickBriefSources` + أنواع صفوف الملفات) · OfferBuilder صار يستهلكها (`useOfferBrief` / `useBriefAttachments` / `BriefStep` / `FileSourceSheet` غلاف رقيق) · في المعالج: `ShippingField` + `ShippingCard`، `PrivateBriefRow`، `PrivateBriefSheet` (على `DealSheetFrame`) + `CampaignBriefList` / `CampaignBriefMeasure` / `CampaignBriefFiles` · `hooks/useCampaignBrief` + `useCampaignAttachments` (حقل `brief` في `useCampaignWizardScreen`) · الشحن داخل `useCampaignRequirements` (`shippingMode`/`chooseShipping`).
  - السلوك: سؤال واحد بثلاث بطاقات (بلا منتج · مع منتج بلا إعادة · مع منتج مع إعادة) والافتراضي «بلا منتج» + سطر الفجوة (10 أيام بدل 5) · تغيير الشحن يغيّر تحذير الدروب المحلي فوراً (`dropGapHours`) · سطر «بريف خاص» اختياري يعرض عدد العناصر والملفات ويفتح ورقة: تنبيه «يُكشف للمؤثر بعد التمويل»، قوالب، نقاط + نغمة، ممنوعات، هاشتاقات/منشن، **روابط مرجعية** (≤10، http/https)، كود خصم + رابط تتبع، مرفقات ≤5 (صور/PDF ≤20MB). كلها تُحفظ مع المسودة (قسم `private_brief`، البريف الفارغ يُرسل `null`). المرفقات: الكاش `getCampaign.attachments` هو المصدر (confirm/delete يحدّثانه)، والمحذوف يُخفى حتى يردّ السيرفر ويعود إن فشل. «التالي» ينتظر انتهاء رفع المرفقات. رفض `private_brief` يظهر في الورقة (ورقة الحقل لكود الخصم/الرابط، والباقي أعلى الورقة) وعلى السطر.
  - لم يُنفَّذ: قفل الحقول بعد أول تقديم (PC2.3) · عرض البريف في المراجعة (PC1.6) · اختبارات hooks/شاشات · لا عدّاد على بطاقة الشحن.
  - افتراضات: مفاتيح الرفض تأتي بشكل `private_brief.promo_code` / `private_brief.tracking_link` (Laravel)؛ غير ذلك يظهر أعلى الورقة. حدود الإدخال نفسها حدود البريف المباشر (10×300، كود 50، رابط 2048) لأن العقد لا يحدّد غيرها.
  - بوابات: tsc + eslint (marketplace، shared) + jest (marketplace + core + app: 88 suites / 974) نظيفة. اختبارات جديدة: `briefEntries` (7). غير مُتحقَّق منه على الجهاز: RTL، الداكن، ورقة المصدر المتداخلة داخل ورقة البريف (Modal داخل Modal على iOS)، منتقي الصور/الملفات، لوحة المفاتيح فوق حقول البريف، أن OfferBuilder (بريف العرض + ورقة الملفات) يعمل كما كان بعد النقل.
- ✅ **PC1.6 (M · O)** 2026-10-17 — الخطوة 4 «المراجعة» + الإرسال + «قيد المراجعة». **نهاية مرحلة PC1.**
  - الملفات: `screens/CampaignWizardScreen/components/`: `ReviewStep`، `ReviewSummaryCard` + `ReviewSummaryRow`، `LockedBriefPreview`، `ReviewNotices`، `ReviewNoteCard`، `SubmitBlockSheet`، `CampaignInReview` + `InReviewTicket` + `InReviewTrack` · `hooks/useCampaignSubmit` (حقل `submission`) + `useCampaignReviewSummary` + `useCampaignInReview` · `utils/campaignReview.ts` (`readCampaignMissing`، `missingByStep`، `campaignKycGate`، `submitBlockOf`، `briefPreviewLines`) · `constants/campaignWizard.ts` (`CAMPAIGN_MISSING_LABEL`، `CAMPAIGN_SUBMIT_BLOCK`) · حُذف `CampaignStepSoon`.
  - السلوك: بطاقة واحدة بسطر لكل جزء (الفكرة/المطلوب/المال والمقاعد من تسميات السيرفر، والبريف اختياري) بعلامة ✓ أو ⚠ أو قفل (ليست لوناً وحده) و«ناقص: …» من `missing[]` + «تعديل/أكمل» يعود للخطوة (البريف يفتح ورقته) · معاينة البريف مقفلة (أسطره ضبابية بظل النص + شارة «يُكشف بعد التمويل») · تنبيهات: ناقص → «الإرسال سينقلك»، وإلا نقص المحفظة من `/quote` (تحذير + «اشحن الآن» إن سمح `top_up_wallet`) + حالة التوثيق من `/me` `kyc_status` · الدوك «إرسال للمراجعة» (أو «إعادة الإرسال» مع `changes_requested`). الإرسال: رفع جارٍ → انتظار · ناقص → يقفز لأول خطوة ناقصة بلا طلب · `flush()` · KYC `pending` → ورقة انتظار، `unverified/rejected` → ورقة «وثّق الآن» (→ `CompanyVerification` بعد إغلاق الورقة) · `POST submit` (بلا مفتاح idempotency؛ ليس مالاً) · 403 `kyc_required` → نفس الورقة · 422 `campaign_live_limit` → ورقة برسالة السيرفر + «حملاتي» · 422 `campaign_not_ready` → إعادة قراءة + القفز لأول خطوة من `meta.missing` + toast · 409 → toast + refetch (من `useCampaignAction`). النجاح: الكاش صار `pending_review` → نفس الشاشة تعرض «قيد المراجعة» (كحلي + GlowOrbs: تذكرة مائلة بالغلاف والتاريخ والمقاعد، «نراجع حملتك»، مسار أُرسلت → قيد المراجعة (نقطة حية) → تُنشر، نقص المحفظة من ردّ submit أو الـ quote، «شحن المحفظة» + «عرض حملاتي»). لا تعديل ولا رجوع بين الخطوات فيها. `changes_requested`: شريط تحت الهيدر «الإدارة طلبت تعديلات» → «اقرأ الملاحظة» يفتح المراجعة حيث بطاقة `review_note`. الخروج من المعالج إلى تبويب (`navigate('Main', …)`) يمر بحالة `exit` حتى لا يعترضه `usePreventRemove`.
  - افتراضات: «أُرسلت · التاريخ» = `updated_at` (لا حقل `submitted_at` في العقد) · KYC من `user.kyc_status` (مجهول → السيرفر يقرّر) · «عادةً خلال 24 ساعة» نص ثابت.
  - لم يُنفَّذ: زر «معاينة» العائم وبطاقة المؤثر · ورقة المسودة (استئناف/تكرار/حذف) + حوار حد 20 (PC2) · تفصيل `/quote` عند لمس إجمالي الدوك · اختبارات hooks/شاشات.
  - بوابات كاملة: `tsc` + `npm run lint` + `npm test` (178 suites / 1689) نظيفة. اختبارات جديدة: `campaignReview` (10). `docs/mobile-architecture.md` (الهيدر، 5.2، 5.3 Journey F2، 7.3) + Change Log (نُقل أقدم صف للأرشيف). غير مُتحقَّق منه على الجهاز: RTL، الداكن، ضبابية ظل النص (iOS/Android)، الطائرة المقلوبة في RTL، GlowOrbs + الصعود في «قيد المراجعة»، الانتقال لشاشة التوثيق/الشحن/حملاتي من فوق المعالج، ردّ submit الحقيقي (`wallet` في `meta` أو `data`).

## PC2 — حملاتي + أوراق النظام (البراند · CM2 + CM4)

- ✅ **PC2.0 (M · O)** 2026-10-17 — تصميم معتمد (`design-previews/my-campaigns.html`، محلي): الجذر عنوانه مقسّم «حملاتي | صفقاتي» + زر «+» · القائمة: شريط «تحتاج قرارك» (معلّقة/مقعد محرَّر/تعديلات مطلوبة فقط — صفوف القائمة بلا `timers`) + 4 تبويبات بعدّاد يظهر بعد تحميل قائمة التبويب نفسه + بطاقة بغلاف ومقاعد (pips) وطلبات مفتوحة وسعر mint و«الميزانية مؤمّنة»؛ المسودات: حلقة جاهزية N/7 من `missing` + بطاقة تعديلات مطلوبة مع مقتطف `review_note`، و⋯ يفتح ورقة (استئناف/تكرار/حذف)؛ المنتهية: صفوف مدمجة بوسم · التفاصيل: غلاف + «جزيرة» واحدة بحلقة عدّ تنازلي وإجراء واحد (شبح 48س، معلّقة، صفر متقدمين، مقعد محرَّر) + مقاعد كبيرة + شروط بوسم قفل (مستنتج محلياً: `seats_occupied > 0` أو وجود طلبات) + خط زمني (عقد انتقال vs نقاط ملاحظات) + دوك · ورقة ⋯: مقاعد، تمديد، تعديل، تكرار، وصف واحد «إغلاق التجنيد» (≥1 مقعد مشغول) أو «إلغاء» (0) · كتلة تنفيذ (يعمل/متأخر/متخلّف) خارج النطاق → CM8.
- ✅ **PC2.1 (M · S5)** 2026-10-17 — القائمة بالتصميم المعتمد: جذر `BrandDealsScreen` صار مبدّلاً «حملاتي | صفقاتي» (الحملات أولاً؛ العلم مطفأ/غير معروف → لوحة الصفقات وحدها كما كانت) · زر «+» انتقل من هيدر الصفقات إلى هيدر الحملات.
  - الملفات: `screens/BrandCampaignsScreen/` (الشاشة + `hooks/useBrandCampaignsScreen`) · `screens/BrandDealsScreen/` (`hooks/useBrandDealsRoot` + `components/BrandDealsBoard`) · `hooks/useCampaignsList` (استعلام لانهائي لكل تبويب، **لا يُقرأ التبويب إلا بعد فتحه** فالعدّاد يظهر على المحمَّل فقط؛ استعلام صغير مستقل لـ `changes_requested` ليصح شريط القرارات قبل فتح المسودات) · `hooks/useCampaignDraftActions` (ورقة ⋯: متابعة/تكرار عبر `duplicate` → المعالج `source: 'duplicate'`/حذف بتأكيد؛ التكرار معطّل عند 20 مسودة) · `constants/campaignList` · `utils/campaignList` (`campaignAttentionKind`، `buildCampaignAttention`، `campaignReadiness` = 7 − `missing`، `waitingApplications` تُخفى مع صفحات إضافية، `campaignTimeLeft`) + اختبارات · مكوّنات: `CampaignCard` `CampaignCover` `CampaignGlassPill` `CampaignDeadlineChip` `SeatPips` `CampaignRibbon` `CampaignDraftCard` `ReadinessRing` `CampaignFinishedRow` `CampaignAttentionRail` `CampaignScopeSwitch` `CampaignsListHeader` `CampaignDraftSheet` `CampaignsSkeleton` · `DealsListHeader`/`DealsBoard` تقبلان `titleSlot` بدل زر «+» · i18n `marketplace.campaign.list.*` (ar+en).
  - انحراف عن المعاينة: عدّاد التبويب نص «المنشورة 5» (مكوّن `SegmentedControl` الموجود) لا شارة منفصلة؛ نبضة النقطة الحيّة على بطاقة المنشورة لم تُبنَ؛ الغلاف المعلّق بلا تدرّج رمادي (RN لا يفلتر الصور).
  - لم يُنفَّذ: ورقة ⋯ للحملات المنشورة (مقاعد/تمديد/إغلاق/إلغاء → PC2.3) · الأزرار على الشرائط تفتح التفاصيل فقط (إجراءات CM4 → PC2.4) · اختبارات hooks/شاشات · لم يُجرَّب على جهاز (RTL، داكن، حركة).
- ✅ **PC2.2 (M · S5)** 2026-10-17 — صفحة الحملة للبراند (`CampaignDetail`) بالتصميم المعتمد: غلاف يمتد خلف الهيدر (حالة + وقت التقديم المتبقي + عنوان + نوع النشاط · نموذج السعر) والجسم ينزلق فوقه · «الجزيرة» (حلقة تنازلية + معنى) للمعلّقة / صفر متقدمين / متقدّم ينتظر بعد تنبيه 48س / مقعد فُرِّغ · بطاقة المقاعد (رقم كبير + دوائر + طلبات مفتوحة + سعر mint + «الميزانية مؤمّنة») أو قائمة جاهزية لمسودة/تعديل مطلوب · ملاحظة الإدارة (`review_note`) للتعديل/الرفض/الإزالة · بطاقة الشروط بوسم القفل (مستنتج محلياً) · سجل `/history` عبر `Timeline` (ملاحظات `from==to`، سبب مجهول → `to.label`) · الدوك للمسودة/تعديل مطلوب يفتح المعالج.
  - الملفات: `screens/BrandCampaignDetailScreen/` (الشاشة + `hooks/useBrandCampaignDetailScreen`) · مكوّنات: `CampaignDetailHero` `CampaignIsland` `CampaignSeatsCard` `CampaignReadinessCard` `CampaignReviewNoteCard` `CampaignTermsCard` `CampaignHistoryCard` `CampaignDetailSkeleton` `CampaignRing` (مستخرج من `ReadinessRing` الذي صار غلافاً رقيقاً) · `SeatPips` يقبل `size="lg"` · `constants/campaignDetail` + `utils/campaignDetail` (`campaignIsland`، `campaignCountdown`، `campaignTermsLocked`، `campaignHistoryEvents`) + اختبارات · i18n `marketplace.campaign.detail.*` (ar+en).
  - انحراف عن المعاينة: لا ⋯ في الهيدر ولا أزرار على الجزيرة (قرارات الجزيرة PC2.4 وقائمة ⋯ PC2.3)؛ الغلاف المعلّق بلا رمادي؛ الاستهداف يعرض حد المتابعين فقط (المدن/الاهتمامات ترتيب لا شرط وقيمها غير مترجمة)؛ الجزيرة بلا زر «راجع المتقدمين» (شاشة المتقدمين PC3)؛ الدوك للمنشورة غائب إلى PC2.3/PC3.
  - لم يُنفَّذ: اختبارات hooks/شاشات · لم يُجرَّب على جهاز (RTL، داكن، حركة، تداخل الجسم مع الغلاف، الهيدر الشفاف فوق الغلاف).
- ✅ **PC2.3 (M · O)** 2026-10-17 — إجراءات دورة الحياة: ⋯ في هيدر صفحة الحملة يفتح ورقة صفوفها حسب الحالة (`utils/campaignLifecycle.ts`): مسودة = أكمل/تكرار/حذف · تعديل مطلوب = أكمل/تكرار/إلغاء · `open`/`suspended` = مقاعد/تمديد/تعديل/تكرار/إنهاء · `filled` = مقاعد/تعديل/تكرار · البقية = تكرار؛ الصف الممتنع يبقى معطلاً بسببه (20 مقعداً، لا موعد أبعد) · صف إنهاء واحد: «إغلاق التجنيد» إن ≥1 مقعد مشغول وإلا «إلغاء» · أوراق: إضافة مقاعد (عدّاد حتى 20 + دوائر المقاعد بعد الإضافة + تقويم موعد جديد إن `deadline_passed`) · تمديد الموعد (تقويم بعد الموعد الحالي حتى 30 يوماً من `published_at` وقبل مهلة `drop`، نهاية اليوم بتوقيت دمشق) · إنهاء بضغط مطوّل (`DealHoldToSign`) مع عدد المقاعد الباقية والطلبات التي تصبح «لم يتم اختيارك» · حذف المسودة (`ConfirmSheet`) يعود للقائمة · التكرار يفتح المعالج على النسخة. الورقة التالية تفتح بعد اختفاء ⋯ (`onDismissed`، مودالان على iOS).
  - تعديل بعد النشر = المعالج بـ`source: 'edit'`: لا حفظ تلقائي (كل تعديل يصل للمؤثرين ويُسجَّل في السجل) → زر «احفظ التعديلات» واحد في الدوك يرسل كل الأجزاء ثم يعود · بلا خطوة مراجعة · المقاعد والموعد خارج الـPUT دائماً (ملاحظة تشير إلى ⋯) · `drop_at` يُرسل فقط إن تغيّر · القفل: مستنتج محلياً عند الفتح أو من `422 campaign_field_locked` عند الحفظ → الأجزاء المقفلة تعود لقيمها، والمعالج يصير خطوة واحدة (العنوان + الغلاف + الإعلان) بلا شريط خطوات مع ملاحظة القفل · الخروج بتعديلات غير محفوظة يسأل «تجاهل تعديلاتك؟».
  - الملفات: `utils/campaignLifecycle.ts` (+ اختبارات) · `liveDraftSectionsOf` + `CAMPAIGN_LOCKED_SECTIONS` في `utils/campaignDraft.ts` · المزامن: `delayMs: null` (حفظ يدوي) + `sectionsOf` + `hasChanges` + `forget` · `useCampaignDraft({ live })` + `saveLive` · `screens/BrandCampaignDetailScreen/{hooks/useCampaignLifecycle, components/CampaignActionsSheet, CampaignAddSeatsSheet, CampaignDeadlineSheet, CampaignEndSheet}` · `CampaignCalendar` انتقل إلى `components/` (مشترك) · `WizardRailHeader` بلا شريط عند خطوة واحدة.
  - انحراف/قرارات: الأوراق الفرعية لم تُصمَّم في PC2.0 (بُنيت بأجزاء الصفقات: `DealSheetFrame` + ضغط مطوّل) · الإلغاء بلا حقل سبب (اختياري في العقد) · لا `Idempotency-Key` على إجراءات الحملة (ليست مالية) · `422 campaign_has_occupied_seats`/`no_occupied_seats` → تُغلق الورقة ويُعاد جلب الحملة.
  - لم يُنفَّذ: اختبارات hooks/شاشات · لم يُجرَّب على جهاز (RTL، داكن، شاشات صغيرة، تتابع المودالات على iOS، الضغط المطوّل) · سلوك الباك إند عند PUT للمقاعد/الموعد على حملة غير مقفلة لم يُختبر (نتجنّبه).
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
