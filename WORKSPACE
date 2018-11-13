workspace(name = "mono_repo")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

######################
# Protobuf
######################
http_archive(
    name = "net_zlib",
    build_file = "//3rdparty:zlib.BUILD",
    sha256 = "c3e5e9fdd5004dcb542feda5ee4f0ff0744628baf8ed2dd5d66f8ca1197cb1a1",
    strip_prefix = "zlib-1.2.11",
    urls = ["https://zlib.net/zlib-1.2.11.tar.gz"],
)
http_archive(
    name = "com_google_protobuf",
    urls = ["https://github.com/protocolbuffers/protobuf/archive/152c8301cf36c8e94bf7d7be0f775d49b85ff44d.zip"],
    type = "zip",
    strip_prefix = "protobuf-152c8301cf36c8e94bf7d7be0f775d49b85ff44d",
)
http_archive(
    name = "com_google_protobuf_java",
    urls = ["https://github.com/protocolbuffers/protobuf/archive/152c8301cf36c8e94bf7d7be0f775d49b85ff44d.zip"],
    type = "zip",
    strip_prefix = "protobuf-152c8301cf36c8e94bf7d7be0f775d49b85ff44d",
)
http_archive(
    name = "com_google_protobuf_javalite",
    urls = ["https://github.com/protocolbuffers/protobuf/archive/384989534b2246d413dbcd750744faab2607b516.zip"],
    type = "zip",
    strip_prefix = "protobuf-384989534b2246d413dbcd750744faab2607b516",
)
bind(
    name = "zlib",
    actual = "@net_zlib//:zlib",
)

######################
# Grpc
######################
http_archive(
    name = "io_grpc_grpc_java",
    strip_prefix = "grpc-java-1.16.1",
    urls = ["https://github.com/grpc/grpc-java/archive/v1.16.1.tar.gz"],
)
bind(
    name = "guava",
    actual = "@com_google_guava_guava//jar",
)
bind(
    name = "gson",
    actual = "@com_google_code_gson_gson//jar",
)

######################
# Scala
######################
http_archive(
    name = "io_bazel_rules_scala",
    url = "https://github.com/bazelbuild/rules_scala/archive/326b4ce252c36aeff2232e241ff4bfd8d6f6e071.zip",
    type = "zip",
    strip_prefix= "rules_scala-326b4ce252c36aeff2232e241ff4bfd8d6f6e071"
)

load("//tools:scala_rules.bzl", "enable_scala")
enable_scala()

######################
# Kotlin
######################
http_archive(
    name = "io_bazel_rules_kotlin",
    urls = ["https://github.com/bazelbuild/rules_kotlin/archive/cab5eaffc2012dfe46260c03d6419c0d2fa10be0.zip"],
    type = "zip",
    strip_prefix = "rules_kotlin-cab5eaffc2012dfe46260c03d6419c0d2fa10be0"
)

load("@io_bazel_rules_kotlin//kotlin:kotlin.bzl", "kotlin_repositories", "kt_register_toolchains")
kotlin_repositories()
kt_register_toolchains()

######################
# Android
######################
android_sdk_repository(
    name = "androidsdk",
    api_level = 28
)

######################
# Maven
######################
http_archive(
    name = "gmaven_rules",
    url = "https://github.com/bazelbuild/gmaven_rules/archive/20181031-1.tar.gz",
    strip_prefix = "gmaven_rules-20181031-1",
)

load("//tools:gmaven.bzl", "gmaven_rules")
gmaven_rules()

load("//3rdparty:workspace.bzl", "maven_dependencies")
maven_dependencies()

######################
# Go
######################
http_archive(
    name = "io_bazel_rules_go",
    url = "https://github.com/bazelbuild/rules_go/releases/download/0.16.5/rules_go-0.16.5.tar.gz",
    sha256 = "7be7dc01f1e0afdba6c8eb2b43d2fa01c743be1b9273ab1eaf6c233df078d705",
)

load("@io_bazel_rules_go//go:def.bzl", "go_rules_dependencies", "go_register_toolchains")
go_rules_dependencies()
go_register_toolchains()

######################
# NodeJS
######################
http_archive(
    name = "build_bazel_rules_nodejs",
    url = "https://github.com/bazelbuild/rules_nodejs/archive/1f6d878a9ea3a095291f66e3d1a0f6b4641f5159.zip",
    strip_prefix = "rules_nodejs-1f6d878a9ea3a095291f66e3d1a0f6b4641f5159",
)

load("@build_bazel_rules_nodejs//:package.bzl", "rules_nodejs_dependencies")
rules_nodejs_dependencies()

load("@build_bazel_rules_nodejs//:defs.bzl", "node_repositories", "yarn_install")
node_repositories(
    node_version = "10.13.0",
    yarn_version = "1.12.1",
    package_json = ["//:package.json"]
)
yarn_install(
    name = "npm",
    package_json = "//:package.json",
    yarn_lock = "//:yarn.lock"
)

######################
# Typescript
######################
http_archive(
    name = "build_bazel_rules_typescript",
    url = "https://github.com/bazelbuild/rules_typescript/archive/2963b55370b21d545d0ac0f30fca9dc74a0f5538.zip",
    strip_prefix = "rules_typescript-2963b55370b21d545d0ac0f30fca9dc74a0f5538",
)
http_archive(
    name = "ts_protoc_gen",
    url = "https://github.com/improbable-eng/ts-protoc-gen/archive/14d69f6203c291f15017a8c0abbb1d4b52b00b64.zip",
    strip_prefix = "ts-protoc-gen-14d69f6203c291f15017a8c0abbb1d4b52b00b64",
    sha256 = "355bd8e7a3d4889a3fb222366ac3427229acc968455670378f8ffe1b4bfc5a95",
)

load("@build_bazel_rules_typescript//:package.bzl", "rules_typescript_dependencies")
rules_typescript_dependencies()

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace")
ts_setup_workspace()

load("//tools:grpc_web.bzl", "typescript_proto_dependencies")
typescript_proto_dependencies()

######################
# Web
######################
http_archive(
    name = "io_bazel_rules_sass",
    url = "https://github.com/bazelbuild/rules_sass/archive/1.15.2.zip",
    strip_prefix = "rules_sass-1.15.2",
)
http_archive(
    name = "io_bazel_rules_webtesting",
    url = "https://github.com/bazelbuild/rules_webtesting/archive/0.2.2.zip",
    strip_prefix = "rules_webtesting-0.2.2",
)

load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")
sass_repositories()

load("@io_bazel_rules_webtesting//web:repositories.bzl", "browser_repositories", "web_test_repositories")
web_test_repositories()
browser_repositories(
    chromium = True,
    firefox = True,
)

######################
# Angular
######################
http_archive(
    name = "angular",
    url = "https://github.com/angular/angular/archive/7.1.4.zip",
    strip_prefix = "angular-7.1.4"
)
http_archive(
    name = "rxjs",
    url = "https://registry.yarnpkg.com/rxjs/-/rxjs-6.3.3.tgz",
    strip_prefix = "package/src",
    sha256 = "72b0b4e517f43358f554c125e40e39f67688cd2738a8998b4a266981ed32f403",
)

yarn_install(
    name = "webpack_deps",
    package_json = "//tools/webpack:package.json",
    yarn_lock = "//tools/webpack:yarn.lock",
)

load("@angular//:index.bzl", "ng_setup_workspace")
ng_setup_workspace()