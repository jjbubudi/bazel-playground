load("@build_bazel_rules_nodejs//:defs.bzl", "yarn_install")

TMP_DIR = "_ts_protoc_gen"

TypescriptProtoLibraryAspect = provider(
    fields = {
        "js_outputs": "The JS output files produced directly from the src protos",
        "dts_outputs": "Ths TS definition files produced directly from the src protos",
        "deps_js": "The transitive JS dependencies",
        "deps_dts": "The transitive dependencies' TS definitions",
    },
)

def _proto_path(proto):
    """
    The proto path is not really a file path
    It's the path to the proto that was seen when the descriptor file was generated.
    """

    path = proto.path
    root = proto.root.path
    ws = proto.owner.workspace_root
    if path.startswith(root):
        path = path[len(root):]
    if path.startswith("/"):
        path = path[1:]
    if path.startswith(ws):
        path = path[len(ws):]
    if path.startswith("/"):
        path = path[1:]
    return path

def append_to_outputs(ctx, file_name, js_outputs, dts_outputs):
    for f in ["_pb.d.ts", "_pb.js", "_pb_service.js", "_pb_service.d.ts"]:
        output = ctx.actions.declare_file("/".join([TMP_DIR, ctx.label.package, file_name + f]))
        if f.endswith(".d.ts"):
            dts_outputs.append(output)
        else:
            js_outputs.append(output)

def typescript_proto_library_aspect_(target, ctx):
    """
    A bazel aspect that is applied on every proto_library rule on the transitive set of dependencies
    of a typescript_proto_library rule.
    Handles running protoc to produce the generated JS and TS files.
    """
    js_outputs = []
    dts_outputs = []
    proto_inputs = []

    for src in target.proto.direct_sources:
        if src.extension != "proto":
            fail("Input must be a proto file")

        file_name = src.basename[:-len(src.extension) - 1]
        normalized_file = _proto_path(src)
        proto_inputs.append(normalized_file)
        append_to_outputs(ctx, file_name, js_outputs, dts_outputs)

    inputs = depset(ctx.files._ts_protoc_gen)
    inputs += target.proto.direct_sources
    inputs += target.proto.transitive_descriptor_sets
    tmpDir = "/".join([ctx.bin_dir.path, ctx.label.package, TMP_DIR])

    args = ctx.actions.args()
    args.add(ctx.files._ts_protoc_gen[1], format = "--plugin=protoc-gen-ts=%s")
    args.add(tmpDir, format = "--ts_out=service=true:%s")
    args.add(tmpDir, format = "--js_out=import_style=commonjs,binary:%s")
    args.add_joined(
        target.proto.transitive_descriptor_sets,
        join_with = ":",
        format_joined = "--descriptor_set_in=%s"
    )
    args.add_all(proto_inputs)

    ctx.actions.run(
        inputs = inputs,
        outputs = dts_outputs + js_outputs,
        progress_message = "Creating Typescript pb files %s" % ctx.label,
        executable = ctx.executable._protoc,
        arguments = [args]
    )

    js_outs = []
    dts_outs = []

    for o in js_outputs:
        js_outs.append(_wrap_amd(ctx, o))

    for o in dts_outputs:
        dts_outs.append(_copy_file(ctx, o))

    deps_js = depset([])
    deps_dts = depset([])

    for dep in ctx.rule.attr.deps:
        aspect_data = dep[TypescriptProtoLibraryAspect]
        deps_dts += aspect_data.dts_outputs + aspect_data.deps_dts
        deps_js += aspect_data.js_outputs + aspect_data.deps_js

    return [TypescriptProtoLibraryAspect(
        dts_outputs = depset(dts_outs),
        js_outputs = depset(js_outs),
        deps_dts = deps_dts,
        deps_js = deps_js,
    )]

typescript_proto_library_aspect = aspect(
    implementation = typescript_proto_library_aspect_,
    attr_aspects = ["deps"],
    attrs = {
        "_ts_protoc_gen": attr.label(
            allow_files = True,
            executable = True,
            cfg = "host",
            default = Label("@ts_protoc_gen//bin:protoc-gen-ts"),
        ),
        "_protoc": attr.label(
            allow_files = True,
            single_file = True,
            executable = True,
            cfg = "host",
            default = Label("@com_google_protobuf//:protoc"),
        ),
        "_wrap_amd": attr.label(
            allow_files = True,
            executable = True,
            cfg = "host",
            default = Label("//tools/grpc_web:wrap_amd")
        )
    },
)

def _wrap_amd(ctx, input):
    output = ctx.actions.declare_file(input.basename)

    args = ctx.actions.args()
    args.add("--binDir", ctx.bin_dir.path)
    args.add("--workspace", ctx.workspace_name)
    args.add("--package", ctx.label.package)
    args.add("--input", input)

    ctx.actions.run(
        inputs = [input],
        outputs = [output],
        progress_message = "Wrapping generated PB files in AMD",
        executable = ctx.executable._wrap_amd,
        arguments = [args]
    )

    return output

def _copy_file(ctx, input):
    output = ctx.actions.declare_file(input.basename)

    ctx.actions.expand_template(
        template = input,
        output = output,
        substitutions = {}
    )

    return output

def _typescript_proto_library_impl(ctx):
    """
    Handles converting the aspect output into a provider compatible with the rules_typescript rules.
    """
    aspect_data = ctx.attr.proto[TypescriptProtoLibraryAspect]
    dts_outputs = aspect_data.dts_outputs
    js_outputs = aspect_data.js_outputs
    outputs = js_outputs + dts_outputs

    return struct(
        typescript = struct(
            declarations = dts_outputs,
            transitive_declarations = dts_outputs + aspect_data.deps_dts,
            type_blacklisted_declarations = depset([]),
            es5_sources = js_outputs + aspect_data.deps_js,
            es6_sources = js_outputs + aspect_data.deps_js,
            transitive_es5_sources = js_outputs + aspect_data.deps_js,
            transitive_es6_sources = js_outputs + aspect_data.deps_js,
        ),
        legacy_info = struct(
            files = outputs,
        ),
        providers = [
            DefaultInfo(files = outputs),
        ],
    )

typescript_proto_library = rule(
    attrs = {
        "proto": attr.label(
            mandatory = True,
            allow_files = True,
            single_file = True,
            providers = ["proto"],
            aspects = [typescript_proto_library_aspect],
        ),
        "_ts_protoc_gen": attr.label(
            allow_files = True,
            executable = True,
            cfg = "host",
            default = Label("@ts_protoc_gen//bin:protoc-gen-ts"),
        ),
        "_protoc": attr.label(
            allow_files = True,
            single_file = True,
            executable = True,
            cfg = "host",
            default = Label("@com_google_protobuf//:protoc"),
        )
    },
    implementation = _typescript_proto_library_impl,
)

def typescript_proto_dependencies():
    """
    Installs ts-proto-gen dependencies.
    Usage:
    # WORKSPACE
    load("@ts_protoc_gen//:defs.bzl", "typescript_proto_dependencies")
    typescript_proto_dependencies()
    """
    yarn_install(
        name = "ts_protoc_gen_deps",
        package_json = "//tools/grpc_web:package.json",
        yarn_lock = "//tools/grpc_web:yarn.lock",
    )