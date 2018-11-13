load("@io_bazel_rules_scala//scala:scala_import.bzl", "scala_import")
load("@io_bazel_rules_scala//scala:scala.bzl", "scala_library")
java_library(
    name = "asm",
    exports = [
        "//external:jar/org/ow2/asm/asm"
    ],
    visibility = [
        "//3rdparty/jvm:__subpackages__"
    ]
)



java_library(
    name = "asm_analysis",
    exports = [
        "//external:jar/org/ow2/asm/asm_analysis"
    ],
    runtime_deps = [
        ":asm_tree"
    ],
    visibility = [
        "//3rdparty/jvm:__subpackages__"
    ]
)



java_library(
    name = "asm_commons",
    exports = [
        "//external:jar/org/ow2/asm/asm_commons"
    ],
    runtime_deps = [
        ":asm_tree"
    ],
    visibility = [
        "//3rdparty/jvm:__subpackages__"
    ]
)



java_library(
    name = "asm_tree",
    exports = [
        "//external:jar/org/ow2/asm/asm_tree"
    ],
    runtime_deps = [
        ":asm"
    ],
    visibility = [
        "//3rdparty/jvm:__subpackages__"
    ]
)



java_library(
    name = "asm_util",
    exports = [
        "//external:jar/org/ow2/asm/asm_util"
    ],
    runtime_deps = [
        ":asm_tree"
    ],
    visibility = [
        "//3rdparty/jvm:__subpackages__"
    ]
)


