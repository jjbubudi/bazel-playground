const path = require("path");
const TersePlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

const nodeModulesRoot = TMPL_node_modules_root;
const moduleMappings = TMPL_module_mappings;
const alias = TMPL_alias;
const workspaceName = "TMPL_workspace_name";
const rootDir = "TMPL_root_dir";
const fullPath = path.parse(path.join(process.cwd(), "TMPL_output"));

const allAliases = {...moduleMappings, ...alias};
for (const moduleName in allAliases) {
  const relativePath = allAliases[moduleName].replace(/\.d\.ts$/, "");
  allAliases[moduleName] = path.resolve(path.join(rootDir, relativePath));
}
allAliases[workspaceName] = path.resolve(rootDir);

module.exports = {
  mode: "TMPL_mode",
  entry: {
    "TMPL_name": "TMPL_entry_point",
  },
  performance: {
    hints: false
  },
  resolve: {
    alias: allAliases,
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
            pure_getters: true,
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
