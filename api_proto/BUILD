load("@io_grpc_grpc_java//:java_grpc_library.bzl", "java_grpc_library")
load("//tools:scala_rules.bzl", "scalapb_proto_library")
load("//tools:grpc_web.bzl", "typescript_proto_library")

proto_library(
    name = "hello_proto",
    srcs = ["hello.proto"],
    deps = ["//api_proto/deep:bye_proto"],
    visibility = ["//visibility:public"]
)

typescript_proto_library(
    name = "hello_ts_proto",
    proto = ":hello_proto",
    visibility = ["//visibility:public"]
)

scalapb_proto_library(
    name = "hello_scala_proto",
    deps = [":hello_proto"],
    with_grpc = True,
    visibility = ["//visibility:public"]
)

java_lite_proto_library(
    name = "hello_java_lite_proto",
    deps = ["//api_proto:hello_proto", "//api_proto/deep:bye_proto"],
    visibility = ["//visibility:public"]
)

java_grpc_library(
    name = "hello_java_lite_grpc",
    srcs = [":hello_proto"],
    deps = [":hello_java_lite_proto"],
    flavor = "lite",
    visibility = ["//visibility:public"]
)