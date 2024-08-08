const path = require("path");
const srcPath = path.join(process.cwd(), "src");
const distJsPath = path.join(process.cwd(), "dist/js");

module.exports = {
  cache: true,
  mode: 'production',
  entry: [path.join(srcPath, "animations.js")],
  output: {
    path: distJsPath,
    filename: "animations.js",
  },
  resolve: {
    extensions: ["", ".js"],
    modules: [srcPath],
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
