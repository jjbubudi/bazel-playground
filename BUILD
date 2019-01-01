exports_files([
    "tsconfig.json",
    "tsconfig-test.json"
])

genrule(
    name = "google_protobuf_umd",
    srcs = ["@npm//node_modules/google-protobuf:google-protobuf.js"],
    outs = ["google-protobuf.js"],
    cmd = """echo "define('google-protobuf', function(require, exports, module) {" > $@ \
             && cat $< >> $@ \
             && echo '});' >> $@""",
    visibility = ["//visibility:public"]
)
