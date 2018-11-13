load("//tools:scala_rules.bzl", "scala_binary", "scala_test_suite")

scala_binary(
    name = "api",
    main_class = "com.fp.Foo",
    resources = glob(["src/main/resources/**"]),
    runtime_deps = [
        "//api/src/main/scala/com/fp:api_lib"
    ]
)
