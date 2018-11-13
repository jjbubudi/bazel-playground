android_binary(
    name = "app",
    custom_package = "com.fp",
    manifest = "AndroidManifest.xml",
    deps = ["//android/src/main/kotlin/com/fp:main"],
    proguard_specs = ["proguard-android.txt", "proguard-rules.pro"],
    proguard_generate_mapping = True
)