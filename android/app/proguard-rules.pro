# Project-specific R8 rules. React Native core rules ship inside react-android.
# Keep only what is reached by reflection or JNI and has no consumer rules of its own.

# react-native-config reads BuildConfig fields by reflection.
-keep class com.getsadaapp.BuildConfig { *; }

# JNI-bound native modules (C++ calls into these classes by name).
-keep class com.shopify.reactnative.skia.** { *; }
-keep class com.margelo.nitro.** { *; }
-keep class com.tencent.mmkv.** { *; }
-keep class com.swmansion.** { *; }

# Modules resolved by name / reflection without bundled rules.
-keep class com.oblador.keychain.** { *; }
-keep class com.dylanvann.fastimage.** { *; }
-keep class com.brentvatne.** { *; }
-keep class com.airbnb.android.react.lottie.** { *; }
-keep class com.reactnativekeyboardcontroller.** { *; }

# Glide (fast-image) generated module.
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep class * extends com.bumptech.glide.module.AppGlideModule { <init>(...); }
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** { **[] $VALUES; public *; }
