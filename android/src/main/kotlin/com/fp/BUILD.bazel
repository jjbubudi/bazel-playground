load("@io_bazel_rules_kotlin//kotlin:kotlin.bzl", "kt_android_library")

kt_android_library(
    name = "main",
    srcs = ["MainActivity.kt"],
    custom_package = "com.fp",
    manifest = "AndroidManifest.xml",
    resource_files = glob(["res/**"]),
    visibility = ["//visibility:public"],
    deps = [
        "//3rdparty/android:appcompat_v7",
        "//3rdparty/jvm/io/grpc:grpc_core",
        "//3rdparty/jvm/io/grpc:grpc_okhttp",
        "//3rdparty/jvm/io/grpc:grpc_stub",
        "//3rdparty/jvm/com/google/protobuf:protobuf_lite",
        "//api_proto:hello_java_lite_proto",
        "//api_proto:hello_java_lite_grpc"
    ]
)