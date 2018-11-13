load("@build_bazel_rules_nodejs//:defs.bzl", "nodejs_binary")

nodejs_binary(
    name = "wrap_amd",
    args = ["--node_options=--expose-gc"],
    data = ["run_wrap_amd.js"],
    entry_point = "mono_repo/tools/javascript/run_wrap_amd",
    install_source_map_support = False,
    visibility = ["//visibility:public"]
)