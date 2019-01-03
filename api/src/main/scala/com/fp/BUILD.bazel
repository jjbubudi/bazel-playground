load("//tools:scala_rules.bzl", "scala_library")

scala_library(
    name = "api_lib",
    srcs = glob(["*.scala"]),
    visibility = ["//visibility:public"],
    deps = [
        "//3rdparty/jvm/org/typelevel:cats_effect",
        "//api_proto:hello_scala_proto"
    ]
)