const path = require("path");
const srcPath = path.join(process.cwd(), "src");
const distJsPath = path.join(process.cwd(), "dist/js");
const distAnimationsPath = path.join(process.cwd(), "dist/animations");
const TerserPlugin = require('terser-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  cache: {
    type: 'filesystem'
  },
  mode: 'production',
  // entry: [path.join(srcPath, "animations.ts")],
  entry: {
    marth: path.join(srcPath, "animations/marth/index.js"),
    falco: path.join(srcPath, "animations/falco/index.js"),
    fox: path.join(srcPath, "animations/fox/index.js"),
    falcon: path.join(srcPath, "animations/falcon/index.js"),
    puff: path.join(srcPath, "animations/puff/index.js"),
  },
  output: {
    path: distAnimationsPath,
    filename: "[name].animations.js",
  },
  resolve: {
    extensions: [".js", ".ts"],
    modules: [srcPath],
  },
  module: {   
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
  plugins: [
    // new BundleAnalyzerPlugin()
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            // Configure compress options if needed
          },
          mangle: false,
          output: {
            comments: false, // Remove comments
          },
        },
        parallel: true, // Enable parallel processing
      }),
    ],
  },
};



// module.exports = {
//   cache: {
//     type: 'filesystem',
//   },
//   mode: 'production',
//   entry: path.join(srcPath, "animations.js"),
//   output: {
//     path: distJsPath,
//     filename: "animations.js",
//   },
//   resolve: {
//     extensions: [".js"],
//     modules: [srcPath, 'node_modules'],
//   },
// };
