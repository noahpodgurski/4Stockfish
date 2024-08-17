const path = require("path");
const webpack = require("webpack");
const WebpackNotifierPlugin = require("webpack-notifier");
const { GenerateSW, InjectManifest } = require('workbox-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const HappyPack = require('happypack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

function createConfig(options) {
  const { isMinified } = options;

  const srcDir = path.join(process.cwd(), "src");
  const distDir = path.join(process.cwd(), "dist");
  const distJsDir = path.join(distDir, "js");
  const min = isMinified ? ".min" : "";

  /// PLUGINS ///
  const plugins = [
    new WebpackNotifierPlugin(),
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(isMinified ? 'production' : 'development')
    }),
    new GenerateSW({
      cacheId: 'meleelight',
      swDest: 'service-worker.js',
      runtimeCaching: [{
        urlPattern: /.*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'runtime-cache',
          expiration: {
            maxEntries: 50,
          },
        },
      }],
      skipWaiting: true,
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      exclude: 'node_modules',
      emitError: false,
      emitWarning: true,
    })
  ];

  // Allow dev-only code
  // plugins.push(
  //   new webpack.DefinePlugin({
  //     "process.env": {
  //       "NODE_ENV": '"dev"'
  //     }
  //   })
  // );

  // plugins.push(
  //   new InjectManifest({
  //     swSrc: path.join(srcDir, 'custom-service-worker.js'),
  //     swDest: 'service-worker.js'
  //   })
  // )
  plugins.push(
      new HappyPack({
        // loaders is the only required parameter:
        loaders: [
          {
            loader: 'babel-loader',
            query: {

              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-transform-flow-strip-types', '@babel/plugin-proposal-class-properties']
            }
          }
        ],
        threads:8

      })
  );

  // plugins.push(
  //   new BundleAnalyzerPlugin(),
  // )

  /// MODULE RULES ///
  const rules = [
    {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: 'ts-loader',
    },
    {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: [
        'thread-loader',
        {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/plugin-transform-flow-strip-types',
              '@babel/plugin-proposal-class-properties',
            ],
          },
        }
      ],
    },
  ];

  /// CONFIG ///
  return {
    mode: isMinified ? 'production' : 'development',
    cache: {
      type: 'filesystem',
    },
    devtool: isMinified ? false : 'eval-source-map',
    entry: {
      index: path.join(srcDir, "index.ts"),
      main: path.join(srcDir, "main.ts"),
    },
    output: {
      path: distJsDir,
      filename: `[name]${min}.js`,
      // filename: 'bundle.js',
    },
    resolve: {
      fallback: {
        "url": require.resolve("url/")
      },
      alias: {
        src: path.resolve(__dirname, 'src')
      },
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      modules: [srcDir, "node_modules"],
    },
    module: {
      rules: rules,
    },
    optimization: isMinified ? {
      splitChunks: {
        chunks: 'all'
      },
      minimize: true,
      minimizer: [new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            warnings: false,
          },
          format: {
            comments: false,
          },
        },
        extractComments: false,
      })],
    } : {},
    plugins: plugins,
    devServer: isMinified ? undefined : {
      contentBase: distDir,
      hot: true,
      open: true,
    }
  };
}

module.exports = createConfig;
