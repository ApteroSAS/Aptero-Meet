const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const selfsigned = require("selfsigned");
const webpack = require("webpack");
const HTMLWebpackPlugin = require("html-webpack-plugin");
//const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const versionJson = require("./version.json");

const PORT = 53000;//Teams needs port 53000

function createHTTPSConfig() {
  // Generate certs for the local webpack-dev-server.
  if (fs.existsSync(path.join(__dirname, "certs"))) {
    const key = fs.readFileSync(path.join(__dirname, "certs", "key.pem"));
    const cert = fs.readFileSync(path.join(__dirname, "certs", "cert.pem"));

    return { key, cert };
  } else {
    const pems = selfsigned.generate(
      [
        {
          name: "commonName",
          value: "localhost"
        }
      ],
      {
        days: 365,
        keySize: 2048,
        algorithm: "sha256",
        extensions: [
          {
            name: "subjectAltName",
            altNames: [
              {
                type: 2,
                value: "localhost"
              }
            ]
          }
        ]
      }
    );

    fs.mkdirSync(path.join(__dirname, "certs"));
    fs.writeFileSync(path.join(__dirname, "certs", "cert.pem"), pems.cert);
    fs.writeFileSync(path.join(__dirname, "certs", "key.pem"), pems.private);

    return {
      key: pems.private,
      cert: pems.cert
    };
  }
}

module.exports = async (env, argv) => {
  env = env || {};

  // Load environment variables from .env files.
  // .env takes precedent over .defaults.env
  // Previously defined environment variables are not overwritten
  dotenv.config({ path: ".env" });
  dotenv.config({ path: ".defaults.env" });

  // In production, the environment variables are defined in CI or loaded from ita and
  // the app config is injected into the head of the page by Reticulum.

  const host = process.env.HOST_IP || env.localDev || env.remoteDev ? "localhost" : "localhost";

  const liveReload = !!process.env.LIVE_RELOAD || false;

  const legacyBabelConfig = {
    presets: ["@babel/react", ["@babel/env", { targets: { ie: 11 } }]],
    plugins: [
      "@babel/proposal-class-properties",
      "@babel/proposal-object-rest-spread",
      "@babel/plugin-transform-async-to-generator",
      "@babel/plugin-proposal-optional-chaining"
    ]
  };
  return {
    mode: "production",
    /*node: {
      // need to specify this manually because some random lodash code will try to access
      // Buffer on the global object if it exists, so webpack will polyfill on its behalf
      Buffer: false,
      fs: "empty"
    },*/
    entry: {
      support: path.join(__dirname, "src", "support.js"),
      index: path.join(__dirname, "src", "index.async.ts"),
      hub: path.join(__dirname, "src", "hub.async.ts"),
      scene: path.join(__dirname, "src", "scene.js"),
      link: path.join(__dirname, "src", "link.js"),
      signin: path.join(__dirname, "src", "signin.async.ts"),
      verify: path.join(__dirname, "src", "verify.async.ts")
    },
    output: {
      filename: "assets/js/[name]-[chunkhash].js",
      publicPath: process.env.BASE_ASSETS_PATH || "/"
    },
    devtool: "source-map",
    devServer: {
      https: createHTTPSConfig(),//Comment for ngrok http <port>
      host: "0.0.0.0",
      port: PORT,
      allowedHosts: [host, "localhost"],
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      hot:false,
      liveReload: liveReload,
      historyApiFallback: {
        rewrites: [
          { from: /^\/signin/, to: "/signin.html" },
          { from: /^\/discord/, to: "/discord.html" },
          { from: /^\/cloud/, to: "/cloud.html" },
          { from: /^\/verify/, to: "/verify.html" },
          { from: /^\/tokens/, to: "/tokens.html" },
          { from: /^\/whats-new/, to: "/whats-new.html" }
        ]
      }
    },
    performance: {
      //maxEntrypointSize: 500 * 1000,//500kb
      maxAssetSize: 2 * 1000 * 1000,//2mb
      // Ignore media and sourcemaps when warning about file size.
      assetFilter(assetFilename) {
        return !/\.(map|png|jpg|gif|glb|webm)$/.test(assetFilename);
      }
    },
    resolve: {
      fallback: {
        //https://gist.github.com/ef4/d2cf5672a93cf241fd47c020b9b3066a
        "stream": require.resolve('stream-browserify'), // for react-dom dep
        'fs': false, // for ammo.js dep
        'path': require.resolve('path-browserify'), // for ammo.js dep
        'process': require.resolve("process/browser"),
        'zlib': require.resolve('browserify-zlib'),
        'util': require.resolve('util/'),
        'events': require.resolve('events/')
      },
      extensions: ["*", ".js", ".jsx", ".tsx", ".ts", ".json"]
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          loader: "html-loader",
          options: {
            // <a-asset-item>'s src property is overwritten with the correct transformed asset url.
            attrs: ["img:src", "a-asset-item:src", "audio:src", "source:src"]
          }
        },
        {
          test: /\.worker\.js$/,
          loader: "worker-loader",
          options: {
            name: "assets/js/[name]-[hash].js",
            publicPath: "/",
            inline: true
          }
        },
        {
          test: [
            path.resolve(__dirname, "src", "utils", "configs.js"),
            path.resolve(__dirname, "src", "utils", "i18n.js"),
            path.resolve(__dirname, "src", "support.js")
          ],
          loader: "babel-loader",
          options: legacyBabelConfig
        },
        // Some JS assets are loaded at runtime and should be copied unmodified and loaded using file-loader
        {
          test: [
            path.resolve(__dirname, "node_modules", "three", "examples", "js", "libs", "basis", "basis_transcoder.js")
          ],
          loader: "file-loader",
          options: {
            outputPath: "assets/raw-js",
            name: "[name]-[hash].[ext]"
          }
        },
        {
          test: /\.(js|jsx|tsx|ts)$/,
          // Exclude JS assets in node_modules because they are already transformed and often big.
          exclude: /node_modules/,
          loader: "babel-loader"
        },
        {
          test: /\.(scss|css)$/,
          use: [
            // Creates `style` nodes from JS strings
            "style-loader",
            // Translates CSS into CommonJS
            {
              //https://stackoverflow.com/questions/59147277/styles-is-undefined-with-webpack-and-typescript
              loader: "css-loader",
              options: {
                modules: {
                  exportLocalsConvention:"camelCase"
                }
              }
            },
            // Compiles Sass to CSS
            "sass-loader",
          ],
        },
        {
          test: /\.svg$/,
          include: [path.resolve(__dirname, "src", "react-components")],
          use: [
            {
              loader: "@svgr/webpack",
              options: {
                titleProp: true,
                replaceAttrValues: { "#000": "{props.color}" },
                template: require("./src/react-components/icons/IconTemplate"),
                svgoConfig: {
                  plugins: {
                    removeViewBox: false,
                    mergePaths: false,
                    convertShapeToPath: false,
                    removeHiddenElems: false
                  }
                }
              }
            },
            "url-loader"
          ]
        },
        {
          test: /\.(png|jpg|gif|glb|ogg|mp3|mp4|wav|woff2|svg|webm)$/,
          use: {
            loader: "file-loader",
            options: {
              // move required assets to output dir and add a hash for cache busting
              name: "[path][name]-[hash].[ext]",
              // Make asset paths relative to /src
              context: path.join(__dirname, "src")
            }
          }
        },
        {
          test: /\.(wasm)$/,
          type: "javascript/auto",
          use: {
            loader: "file-loader",
            options: {
              outputPath: "assets/wasm",
              name: "[name]-[hash].[ext]"
            }
          }
        },
        {
          test: /\.(glsl|frag|vert)$/,
          use: { loader: "raw-loader" }
        }
      ]
    },

    optimization: {
      //https://webpack.js.org/plugins/split-chunks-plugin/
      //minimize: argv.mode === "production",
      minimize: false,
      /*splitChunks: {
        chunks: 'all',
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
      },*/
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',//for debug.js
      }),
      // Each output page needs a HTMLWebpackPlugin entry
      new HTMLWebpackPlugin({
        filename: "index.html",
        template: path.join(__dirname, "src", "index.html"),
        chunks: ["support", "index"],
        minify: { removeComments: false }
      }),
      new HTMLWebpackPlugin({
        filename: "hub.html",
        template: path.join(__dirname, "src", "hub.html"),
        chunks: ["support", "hub"],
        inject: "head",
      }),
      new HTMLWebpackPlugin({
        filename: "scene.html",
        template: path.join(__dirname, "src", "scene.html"),
        chunks: ["support", "scene"],
        inject: "head",
        minify: { removeComments: false }
      }),
      new HTMLWebpackPlugin({
        filename: "link.html",
        template: path.join(__dirname, "src", "link.html"),
        chunks: ["support", "link"],
        minify: { removeComments: false }
      }),
      new HTMLWebpackPlugin({
        filename: "signin.html",
        template: path.join(__dirname, "src", "signin.html"),
        chunks: ["signin"],
        minify: { removeComments: false }
      }),
      new HTMLWebpackPlugin({
        filename: "verify.html",
        template: path.join(__dirname, "src", "verify.html"),
        chunks: ["verify"],
        minify: { removeComments: false }
      }),
      new CopyWebpackPlugin({
        patterns: [{ from: "src/hub.service.js", to: "hub.service.js" },
          { from: "src/schema.toml", to: "schema.toml" },
          { from: "src/aptero/module/properties/properties.js", to: "properties.js" },
          { from: "src/assets/images/favicon.ico", to: "favicon.ico" },
          { from: "src/assets/manifest.webmanifest", to: "manifest.webmanifest" },
          { from: "src/assets/static/", to: "assets/static/" },
          {
            from: "src/workers/pdfjs-dist@2.1.266/build/pdf.worker.js",
            to: "workers/pdfjs-dist@2.1.266/build/pdf.worker.js"
          }]
      }),
      // Extract required css and add a content hash.
      /*new MiniCssExtractPlugin({
        filename: "assets/stylesheets/[name]-[contenthash].css",
        //disable: argv.mode !== "production"
      }),*/
      // Define process.env variables in the browser context.
      new webpack.DefinePlugin({
        "process.env": JSON.stringify({
          BUILD_VERSION: versionJson.version
        })
      })
    ]
  };
};
