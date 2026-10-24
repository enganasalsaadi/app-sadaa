# صدى (Sada) — دليل التشغيل والبناء

تطبيق React Native (CLI). ثلاث بيئات، كل واحدة لها ملف `.env`:

| البيئة | الملف | `APP_ENV` | اللوغ |
|---|---|---|---|
| Development (الافتراضي) | `.env` | `development` | مفعّل |
| Staging | `.env.staging` | `staging` | مفعّل |
| Production | `.env.production` | `production` | مغلق |

القيم تُدمج في التطبيق وقت **البناء الnative**. تغيير ملف `.env*` يتطلب إعادة بناء، وليس Reload من Metro.
الملفات تحتوي إعدادات عامة فقط. لا أسرار حقيقية فيها. `.env.example` يشرح المفاتيح.

---

## 1) التشغيل أثناء التطوير

```bash
npm install --legacy-peer-deps
cd ios && pod install && cd ..        # بعد إضافة أي حزمة native

# Development
npm run android        # أو: npm run ios

# Staging
ENVFILE=.env.staging npx react-native run-android
ENVFILE=.env.staging npx react-native run-ios

# Production (تجربة فقط)
ENVFILE=.env.production npx react-native run-android
ENVFILE=.env.production npx react-native run-ios
```

بعد نقل ملفات أو إعادة تسميتها: `npx react-native start --reset-cache`.

---

## 2) بناء نسخة Production لـ Google Play (Android)

الناتج: ملف **AAB** موقّع.

### أ) مرة واحدة: مفتاح التوقيع (upload key)

الملف `android/app/release.keystore` (مستثنى من git عبر `*.keystore`).
لتوليده عند الحاجة، من مجلد `android/app`:

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore release.keystore -alias sada \
  -keyalg RSA -keysize 2048 -validity 10000
```

- كلمة مرور المخزن وكلمة مرور المفتاح **نفسها** وطولها 6 أحرف على الأقل.
- الـ alias الحالي: `sada`.
- هذا المفتاح هو **upload key** (Google Play App Signing). **انسخه مع كلمة المرور إلى مكان آمن خارج المشروع.**
  إن ضاع: Play Console ← App integrity ← طلب إعادة ضبط upload key.

التحقق من المفتاح:

```bash
keytool -list -v -keystore android/app/release.keystore -alias sada
```

### ب) مرة واحدة: بيانات التوقيع

`android/app/build.gradle` يقرأ أربع خصائص:

```properties
MYAPP_UPLOAD_STORE_FILE=release.keystore
MYAPP_UPLOAD_KEY_ALIAS=sada
MYAPP_UPLOAD_STORE_PASSWORD=<كلمة المرور>
MYAPP_UPLOAD_KEY_PASSWORD=<كلمة المرور>
```

ضعها في **`~/.gradle/gradle.properties`** (خارج المشروع، آمن).
**لا تضع كلمات المرور الحقيقية في `android/gradle.properties`**، لأنه ملف خاضع لـ git.
الـ alias في الخصائص يجب أن يطابق الـ alias داخل المفتاح، وإلا يفشل البناء.

### ج) قبل كل رفع إلى Play

1. **رقم النسخة:** في `android/app/build.gradle` ارفع `versionCode` (رقم صحيح يزيد مع كل رفع، لا يقبل Play رقماً مكرراً). غيّر `versionName` عند الحاجة.
2. **ملف البيئة:** تأكد من قيم `.env.production`، خصوصاً `API_BASE_URL` و`ENABLE_LOGS=false`.
3. **Firebase:** `android/app/google-services.json` يجب أن يطابق الحزمة `com.getsadaapp`.

### د) أمر البناء

من جذر المشروع:

```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

- نسخة Release تأخذ `.env.production` تلقائياً، عبر `project.ext.envConfigFiles` في `android/app/build.gradle` (`debug` ← `.env`، `release` ← `.env.production`). أوامر `assembleRelease` و`bundleRelease` تطابق `release`.
- `ENVFILE=...` ما زال يتغلب على الإعداد الافتراضي إن حددته (مثلاً `ENVFILE=.env.staging ./gradlew bundleRelease`).
- للتحقق: في ناتج Gradle يجب أن يظهر `Reading env from: .env.production`.
- `clean` ضروري عند التبديل بين البيئات، لأن Gradle يخزن `BuildConfig` المولّد مؤقتاً (`org.gradle.caching=true`)، وقد تبقى قيم البيئة السابقة.
- الناتج:
  `android/app/build/outputs/bundle/release/app-release.aab`
- ارفعه في Play Console ← Testing أو Production ← Create new release.

### هـ) APK للتجربة على جهاز (اختياري)

```bash
cd android
./gradlew clean
./gradlew assembleRelease
# android/app/build/outputs/apk/release/app-release.apk
```

لنسخة Staging نفس الأوامر مع `ENVFILE=.env.staging`.

---

## 3) بناء iOS (App Store / TestFlight)

1. `cd ios && pod install`
2. افتح `ios/Sadaa.xcworkspace` في Xcode.
3. اختر `Any iOS Device` ثم **Product ← Archive**.
4. من Organizer: **Distribute App** ← App Store Connect.
5. ارفع `CFBundleVersion` (Build) قبل كل أرشفة.

### ملف البيئة في iOS (مهم)

بدون ضبط، الأرشفة تدمج `.env` أي **127.0.0.1** (بيئة التطوير). هذا ما حدث في أول build رُفع إلى TestFlight (1.0.0 (1)).

الحل مضبوط داخل الـ Scheme المشترك `Sadaa`
(`ios/Sadaa.xcodeproj/xcshareddata/xcschemes/Sadaa.xcscheme`) ← Build ← Pre-actions، مع "Provide build settings from: Sadaa":

```sh
# /tmp/envfile beats ENVFILE in react-native-config, so an explicit ENVFILE wins here.
if [ -n "$ENVFILE" ]; then
  echo "$ENVFILE" > /tmp/envfile
elif [ "$CONFIGURATION" = "Release" ]; then
  echo ".env.production" > /tmp/envfile
else
  rm -f /tmp/envfile
fi
```

| الحالة | الملف المستخدم |
|---|---|
| `ENVFILE` محدد من الطرفية | هو نفسه |
| Release (Archive) | `.env.production` |
| Debug | `.env` |

- react-native-config على iOS يقرأ بالترتيب: `/tmp/envfile` ثم `ENVFILE` ثم `.env`.
- الـ Archive يستخدم إعداد Release، لذلك يأخذ production تلقائياً.
- لم يُتحقق إن كان `ENVFILE` من الطرفية يصل إلى الـ pre-action عند `run-ios`. إن لم يصل، يُبنى Debug على `.env`. Release لا يتأثر.
- بعد أي تغيير في `.env*`: **Product ← Clean Build Folder** ثم Archive.

### التحقق من الأرشيف قبل الرفع

```bash
APP=$(find ~/Library/Developer/Xcode/Archives -name "Sadaa.app" -path "*Products*" -print0 | xargs -0 ls -td | head -1)
strings "$APP/Sadaa" | grep -E "127\.0\.0\.1|getsadaapp|^(development|staging|production)$"
```

المطلوب: يظهر `production` و`https://api.getsadaapp.com/api`، ولا يظهر `127.0.0.1`.
(مسار الأرشيف قد يحوي مسافة غير عادية، لذلك استُخدم `find` بدل الكتابة اليدوية.)

إن رُفعت نسخة خاطئة: App Store Connect ← TestFlight ← الـ build ← **Expire Build**، ثم ارفع Build أعلى.

نطاق الروابط (`PUBLIC_WEB_HOST`) يُضبط أيضاً كـ Build Setting في Xcode، وليس في `.env*` فقط.

---

## 4) قائمة تحقق قبل أي إصدار

- [ ] `API_BASE_URL` في `.env.production` يشير للخادم الحقيقي (حالياً staging وproduction يشيران لنفس النطاق).
- [ ] `ENABLE_LOGS=false` و`ENABLE_MOCK_DATA=false`.
- [ ] iOS: Clean Build Folder ثم Archive، وفحص `strings` على الأرشيف (لا `127.0.0.1`).
- [ ] Android: ناتج `bundleRelease` يحوي `Reading env from: .env.production`.
- [ ] `versionCode` / Build مرفوع.
- [ ] Firebase: `google-services.json` و`GoogleService-Info.plist` للمشروع الجديد (`com.getsadaapp`).
- [ ] `PUBLIC_WEB_HOST` مضبوط إن كانت روابط الـ App Links مفعّلة.
- [x] رابط App Store: https://apps.apple.com/app/id6825926070 (ثابت في الكود، لا متغير بيئة).
- [ ] نسخة احتياطية من `release.keystore` وكلمة المرور.
- [ ] `npx tsc --noEmit && npm run lint && npm test` تمر.

---

## 5) أوامر مفيدة

```bash
npx tsc --noEmit        # فحص الأنواع
npm run lint            # قواعد المعمارية والأسلوب
npm test                # الاختبارات
```

أعطال شائعة:

| العَرَض | الحل |
|---|---|
| `Keystore was tampered with, or password incorrect` | كلمة المرور خاطئة. تحقق من `~/.gradle/gradle.properties` |
| `Failed to read key ... from store` | الـ alias خاطئ. افحص `keytool -list` |
| قيم البيئة قديمة بعد التبديل | `./gradlew clean` ثم أعد البناء، أو `npx react-native start --reset-cache` |
| Play يرفض الرفع: version code used | ارفع `versionCode` |
| `Could not resolve com.android.tools.lint:lint-gradle:...` / `No route to host` | لا اتصال بالإنترنت من Gradle. أول بناء بعد تغيير نسخة AGP يحتاج تنزيل هذه الحزمة. اتصل بالشبكة (أوقف VPN/Proxy) وأعد المحاولة |
