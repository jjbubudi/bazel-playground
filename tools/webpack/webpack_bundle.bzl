# Copyright 2017 The Bazel Authors. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Webpack bundling

The version of Webpack is controlled by the Bazel toolchain.
You do not need to install it into your project.
"""
load("@build_bazel_rules_nodejs//internal/common:collect_es6_sources.bzl", "collect_es6_sources")
load("@build_bazel_rules_nodejs//internal/common:module_mappings.bzl", "get_module_mappings")
load("@build_bazel_rules_nodejs//internal/common:node_module_info.bzl", "NodeModuleInfo", "collect_node_modules_aspect")

_WEBPACK_MODULE_MAPPINGS_ATTR = "webpack_module_mappings"

def _webpack_module_mappings_aspect_impl(target, ctx):
    mappings = get_module_mappings(target.label, ctx.rule.attr)
    return struct(webpack_module_mappings = mappings)

webpack_module_mappings_aspect = aspect(
    _webpack_module_mappings_aspect_impl,
    attr_aspects = ["deps"],
)

def _trim_package_node_modules(package_name):
    # trim a package name down to its path prior to a node_modules
    # segment. 'foo/node_modules/bar' would become 'foo' and
    # 'node_modules/bar' would become ''
    segments = []
    for n in package_name.split("/"):
        if n == "node_modules":
            break
        segments += [n]
    return "/".join(segments)

def write_config(ctx, label, template, output_dir, entry_point, root_dir = None):
    config_file = ctx.actions.declare_file("_%s_webpack.config.js" % label.name)
    if not root_dir:
        build_file_dirname = "/".join(ctx.build_file_path.split("/")[:-1])
        root_dir = "/".join([ctx.bin_dir.path, build_file_dirname, ctx.label.name + ".es6"])

    mappings = dict()
    all_deps = ctx.attr.deps + ctx.attr.srcs
    for dep in all_deps:
        if hasattr(dep, _WEBPACK_MODULE_MAPPINGS_ATTR):
            for k, v in getattr(dep, _WEBPACK_MODULE_MAPPINGS_ATTR).items():
                if k in mappings and mappings[k] != v:
                    fail(("duplicate module mapping at %s: %s maps to both %s and %s" %
                        (dep.label, k, mappings[k], v)), "deps")
                mappings[k] = v

    node_modules_root = None
    for d in ctx.attr.deps:
        if NodeModuleInfo in d:
            possible_root = "/".join(["external", d[NodeModuleInfo].workspace, "node_modules"])
            if not node_modules_root:
                node_modules_root = possible_root
            elif node_modules_root != possible_root:
                fail("All npm dependencies need to come from a single workspace. Found '%s' and '%s'." %
                    (node_modules_root, possible_root))

    ctx.actions.expand_template(
        template = template,
        output = config_file,
        substitutions = {
            "TMPL_entry_point": "/".join([".", root_dir, entry_point]),
            "TMPL_root_dir": "/".join([".", root_dir]),
            "TMPL_workspace_name": ctx.workspace_name,
            "TMPL_module_mappings": str(mappings),
            "TMPL_alias": str(ctx.attr.alias),
            "TMPL_node_modules_root": str([] if not node_modules_root else [node_modules_root]),
            "TMPL_name": label.name,
            "TMPL_output": output_dir.path,
            "TMPL_mode": "production"
        },
    )
    return config_file

def _filter_js_inputs(all_inputs):
    return [
        f
        for f in all_inputs
        if f.path.endswith(".js") or f.path.endswith(".json")
    ]

def run_webpack(ctx, actions, executable, label, sources, output_dir, config):
    webpack_args = actions.args()
    webpack_args.add(["--config", config])
    webpack_args.add(["--silent"])
    webpack_args.add(["--bail"])

    direct_inputs = [config]
    for d in ctx.attr.deps:
        if NodeModuleInfo in d:
            direct_inputs += _filter_js_inputs(d.files.to_list())

    actions.run(
        progress_message = "Webpack bundling %s" % label,
        inputs = depset(direct_inputs, transitive = [sources]),
        outputs = [output_dir],
        executable = executable._webpack,
        arguments = [webpack_args],
    )

def _webpack_bundle(ctx):
    output_dir = ctx.actions.declare_file("bundle.min.js")
    config = write_config(
        ctx,
        ctx.label,
        ctx.file._webpack_config_template,
        output_dir,
        ctx.attr.entry_point)
    run_webpack(
        ctx,
        ctx.actions,
        ctx.executable,
        ctx.label,
        collect_es6_sources(ctx),
        output_dir,
        config)
    return [DefaultInfo(files = depset([output_dir]))]

webpack_bundle = rule(
    implementation = _webpack_bundle,
    attrs = {
        "srcs": attr.label_list(
            doc = "JavaScript source files",
            allow_files = [".js"]),
        "deps": attr.label_list(
            doc = "Other targets that produce JavaScript, e.g. `ts_library`",
            aspects = [webpack_module_mappings_aspect, collect_node_modules_aspect]),
        "alias": attr.string_dict(
            doc = """A dict of alias, for overriding require calls.
            The key should be the module name to override.
            The value should be a path relative to the workspace root.""",
            default = {}),
        "entry_point": attr.string(
            doc = "Entry point JS file, relative to the workspace root",
            mandatory = True),
        "_webpack": attr.label(
            default = Label("//tools/webpack:webpack-cli"),
            executable = True,
            cfg = "host"),
        "_webpack_config_template": attr.label(
            default = Label("//tools/webpack:webpack.config.tmpl.js"),
            allow_single_file = True),
    },
    outputs = {
        "bundle": "%{name}.min.js",
    }
)
