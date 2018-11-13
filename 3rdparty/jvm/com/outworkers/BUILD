load("@io_bazel_rules_scala//scala:scala_import.bzl", "scala_import")
load("@io_bazel_rules_scala//scala:scala.bzl", "scala_library")
scala_import(
    name = "phantom_connectors",
    jars = [
        "//external:jar/com/outworkers/phantom_connectors_2_12"
    ],
    runtime_deps = [
        "//3rdparty/jvm/com/datastax/cassandra:cassandra_driver_core",
        "//3rdparty/jvm/org/scala_lang:scala_library",
        "//3rdparty/jvm/org/slf4j:log4j_over_slf4j"
    ],
    visibility = [
        "//3rdparty/jvm:__subpackages__"
    ]
)



scala_import(
    name = "phantom_dsl",
    jars = [
        "//external:jar/com/outworkers/phantom_dsl_2_12"
    ],
    runtime_deps = [
        "//3rdparty/jvm/com/chuusai:shapeless",
        "//3rdparty/jvm/com/datastax/cassandra:cassandra_driver_core",
        "//3rdparty/jvm/joda_time:joda_time",
        "//3rdparty/jvm/org/joda:joda_convert",
        "//3rdparty/jvm/org/scala_lang:scala_library",
        "//3rdparty/jvm/org/slf4j:log4j_over_slf4j",
        "//3rdparty/jvm/org/typelevel:macro_compat",
        ":phantom_connectors"
    ],
    visibility = [
        "//visibility:public"
    ]
)


