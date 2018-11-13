load("@io_bazel_rules_scala//scala:scala.bzl", "scala_repositories")
load("@io_bazel_rules_scala//scala:toolchains.bzl", "scala_register_toolchains")
load("@io_bazel_rules_scala//scala_proto:scala_proto.bzl", "scala_proto_repositories")
load("@io_bazel_rules_scala//scala:scala_cross_version.bzl",
    "scala_mvn_artifact",
    "extract_major_version"
)
load("@io_bazel_rules_scala//scala:scala.bzl",
    upstream_lib = "scala_library",
    upstream_macro = "scala_macro_library",
    upstream_bin = "scala_binary",
    upstream_test = "scala_test",
    upstream_test_suite = "scala_test_suite"
)
load("@io_bazel_rules_scala//scala_proto:scala_proto.bzl",
    uppstream_proto = "scalapb_proto_library"
)

_scala_version = "2.12.6"
_major_scala_version = extract_major_version(_scala_version)
_scala_compiler_sha = "3023b07cc02f2b0217b2c04f8e636b396130b3a8544a8dfad498a19c3e57a863"
_scala_library_sha = "f81d7144f0ce1b8123335b72ba39003c4be2870767aca15dd0888ba3dab65e98"
_scala_reflect_sha = "ffa70d522fc9f9deec14358aa674e6dd75c9dfa39d4668ef15bb52f002ce99fa"

def enable_scala():
    scala_repositories((_scala_version, {
        "scala_compiler": _scala_compiler_sha,
        "scala_library": _scala_library_sha,
        "scala_reflect": _scala_reflect_sha
    }))
    scala_proto_repositories(_scala_version)
    scala_register_toolchains()
    _install_compiler_plugins()

def _install_compiler_plugins():
    native.maven_jar(
          name = "org_spire_math__kind_projector",
          artifact = scala_mvn_artifact(
              artifact = "org.spire-math:kind-projector:0.9.8",
              major_scala_version = _major_scala_version
          )
        )
    native.maven_jar(
      name = "com_olegpy__better_monadic_for",
      artifact = scala_mvn_artifact(
          artifact = "com.olegpy:better-monadic-for:0.2.4",
          major_scala_version = _major_scala_version
      )
    )

def scala_library(name, srcs = [], deps = [], plugins = [], runtime_deps = [], data = [], resources = [],
    scalacopts = [], jvm_flags = [], main_class = "", exports = [], visibility = None,
    unused_dependency_checker_mode = "error"):
    upstream_lib(name = name, srcs = srcs, deps = deps, plugins = _with_default_plugins(plugins),
    runtime_deps = runtime_deps, resources = resources, scalacopts = _with_default_opts(scalacopts),
    jvm_flags = jvm_flags, main_class = main_class, exports = exports, visibility = visibility,
    unused_dependency_checker_mode = unused_dependency_checker_mode)

def scala_macro_library(name, srcs = [], deps = [], runtime_deps = [], data = [], resources = [],
    scalacopts = [], jvm_flags = [], main_class = "", exports = [], visibility = None):
    upstream_macro(name = name, srcs = srcs, deps = deps, runtime_deps = runtime_deps,
    resources = resources, scalacopts = _with_default_opts(scalacopts),
    jvm_flags = jvm_flags, main_class = main_class, exports = exports, visibility = visibility)

def scala_binary(name, srcs = [], deps = [], plugins = [], runtime_deps = [], data = [], resources = [],
    scalacopts = [], jvm_flags = [], main_class = "", visibility = None,
    unused_dependency_checker_mode = "error"):
    upstream_bin(name = name, srcs = srcs, deps = deps, plugins = _with_default_plugins(plugins),
    runtime_deps = runtime_deps, resources = resources, scalacopts = _with_default_opts(scalacopts),
    jvm_flags = jvm_flags, main_class = main_class, visibility = visibility,
    unused_dependency_checker_mode = unused_dependency_checker_mode)

def scala_test(name, srcs = [], deps = [], plugins = [], runtime_deps = [], data = [], resources = [],
    scalacopts = [], jvm_flags = [], visibility = None, size = None, timeout = None,
    unused_dependency_checker_mode = "error"):
    upstream_test(name = name, srcs = srcs, deps = deps, plugins = _with_default_plugins(plugins),
    runtime_deps = runtime_deps, resources = resources, scalacopts = _with_default_opts(scalacopts),
    jvm_flags = jvm_flags, visibility = visibility, size = size, timeout = timeout,
    unused_dependency_checker_mode = unused_dependency_checker_mode)

def scala_test_suite(name, srcs = [], visibility = None, **kwargs):
    upstream_test_suite(name = name, srcs = srcs, visibility = visibility, kwargs = kwargs)

def scalapb_proto_library(name, deps = [], with_grpc = False, with_java = False,
    with_flat_package = False, with_single_line_to_string = False, visibility = None):
    uppstream_proto(name = name, deps = deps, with_grpc = with_grpc, with_java = with_java,
    with_flat_package = with_flat_package, with_single_line_to_string = with_single_line_to_string,
    visibility = visibility)

_default_scalac_opts = [
    "-unchecked",
    "-deprecation",
    "-feature",
    "-Xfatal-warnings",
    "-Ypartial-unification",
    "-language:implicitConversions",
    "-language:higherKinds",
    "-language:postfixOps"
]

_default_plugins = [
    "@org_spire_math__kind_projector//jar",
    "@com_olegpy__better_monadic_for//jar"
]

def _with_default_opts(opts):
    return opts + _default_scalac_opts

def _with_default_plugins(plugins):
    return plugins + _default_plugins