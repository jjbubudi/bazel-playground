const path = require("path");
const TersePlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

const nodeModulesRoot = TMPL_node_modules_root;
const moduleMappings = TMPL_module_mappings;
const workspaceName = "TMPL_workspace_name";
const rootDir = "TMPL_root_dir";
const fullPath = path.parse(path.join(process.cwd(), "TMPL_output"));

for (const k in moduleMappings) {
  const v = moduleMappings[k].replace(/\.d\.ts$/, "");
  const pp = path.resolve(path.join(rootDir, v));
  moduleMappings[k] = pp;
}
moduleMappings[workspaceName] = path.resolve(rootDir);

module.exports = {
  mode: "TMPL_mode",
  entry: {
    "TMPL_name": "TMPL_entry_point",
  },
  performance: {
    hints: false
  },
  resolve: {
    alias: moduleMappings,
    modules: nodeModulesRoot
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: require.resolve("@angular-devkit/build-optimizer/webpack-loader"),
        options: {
          sourceMap: false
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "ngDevMode": false,
    })
  ],
  optimization: {
    minimizer: [
      new TersePlugin({
        parallel: true,
        cache: true,
        terserOptions: {
          compress: {
            keep_fargs: false,
            passes: 3
          },
          mangle: true,
          output: {
            comments: false
          }
        }
      }),
    ]
  },
  node: false,
  output: {
    path: fullPath.dir,
    filename: fullPath.base
  }
};
