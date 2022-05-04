const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const selfsigned = require("selfsigned");
const webpack = require("webpack");
const cors = require("cors");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const packageLock = require("./webpack-package-lock-info.json");
const versionJson = require("./version.json");
const request = require("request");

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
              },
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

function getModuleDependencies(moduleName) {
  const deps = packageLock.dependencies;
  const arr = [];

  const gatherDeps = name => {
    arr.push(path.join(__dirname, "node_modules", name) + path.sep);

    const moduleDef = deps[name];

    if (moduleDef && moduleDef.requires) {
      for (const requiredModuleName in moduleDef.requires) {
        gatherDeps(requiredModuleName);
      }
    }
  };

  gatherDeps(moduleName);

  return arr;
}

function deepModuleDependencyTest(modulesArr) {
  const deps = [];

  for (const moduleName of modulesArr) {
    const moduleDependencies = getModuleDependencies(moduleName);
    deps.push(...moduleDependencies);
  }

  return module => {
    if (!module.nameForCondition) {
      return false;
    }

    const name = module.nameForCondition();

    return deps.some(depName => name.startsWith(depName));
  };
}

module.exports = async (env, argv) => {
  env = env || {};

  // Load environment variables from .env files.
  // .env takes precedent over .defaults.env
  // Previously defined environment variables are not overwritten
  dotenv.config({ path: ".env" });
  dotenv.config({ path: ".defaults.env" });

  /**
   * Initialize the Webpack build envrionment for the provided environment.
   */

  if (argv.mode !== "production" || env.bundleAnalyzer) {
    if (env.localDev) {
      // Local Dev Environment (npm run local)
      Object.assign(process.env, {
        HOST: "localhost",
        RETICULUM_SOCKET_SERVER: "localhost",
        CORS_PROXY_SERVER: "hubs-proxy.local:4000",
        NON_CORS_PROXY_DOMAINS: "localhost,dev.reticulum.io",
        BASE_ASSETS_PATH: "https://localhost:"+PORT+"/",
        RETICULUM_SERVER: "localhost:4000",
        POSTGREST_SERVER: "",
        ITA_SERVER: ""
      });
    }
  }

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
    node: {
      // need to specify this manually because some random lodash code will try to access
      // Buffer on the global object if it exists, so webpack will polyfill on its behalf
      Buffer: false,
      fs: "empty"
    },
    entry: {
      "microsoft-settings": path.join(__dirname, "src/aptero/module/microsoft/page", "microsoft-settings.tsx"),
      support: path.join(__dirname, "src", "support.js"),
      index: path.join(__dirname, "src", "index.js"),
      hub: path.join(__dirname, "src", "hub.js"),
      scene: path.join(__dirname, "src", "scene.js"),
      link: path.join(__dirname, "src", "link.js"),
      signin: path.join(__dirname, "src", "signin.js"),
      verify: path.join(__dirname, "src", "verify.js"),
    },
    output: {
      filename: "assets/js/[name]-[chunkhash].js",
      publicPath: process.env.BASE_ASSETS_PATH || "/"
    },
    devtool: argv.mode === "production" ? "source-map" : "source-map",
    devServer: {
      https: createHTTPSConfig(),//Comment for ngrok http <port>
      host: "0.0.0.0",
      port: PORT,
      public: `${host}:${PORT}`,
      useLocalIp: true,
      disableHostCheck: true,
      allowedHosts: [host, "localhost"],
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      hot: liveReload,
      inline: liveReload,
      historyApiFallback: {
        rewrites: [
          { from: /^\/signin/, to: "/signin.html" },
          { from: /^\/discord/, to: "/discord.html" },
          { from: /^\/cloud/, to: "/cloud.html" },
          { from: /^\/verify/, to: "/verify.html" },
          { from: /^\/tokens/, to: "/tokens.html" },
          { from: /^\/whats-new/, to: "/whats-new.html" }
        ]
      },
      before: function(app) {
        // Local CORS proxy
        app.all("/cors-proxy/*", (req, res) => {
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
          res.header("Access-Control-Allow-Headers", "Range");
          res.header(
            "Access-Control-Expose-Headers",
            "Accept-Ranges, Content-Encoding, Content-Length, Content-Range, Hub-Name, Hub-Entity-Type"
          );
          res.header("Vary", "Origin");
          res.header("X-Content-Type-Options", "nosniff");

          const redirectLocation = req.header("location");

          if (redirectLocation) {
            res.header("Location", "https://localhost:"+PORT+"/cors-proxy/" + redirectLocation);
          }

          if (req.method === "OPTIONS") {
            res.send();
          } else {
            const url = req.path.replace("/cors-proxy/", "");
            request({ url, method: req.method }, error => {
              if (error) {
                console.error(`cors-proxy: error fetching "${url}"\n`, error);
                return;
              }
            }).pipe(res);
          }
        });

        // be flexible with people accessing via a local reticulum on another port
        app.use(cors({ origin: /hubs\.local(:\d*)?$/ }));
        // networked-aframe makes HEAD requests to the server for time syncing. Respond with an empty body.
        app.head("*", function(req, res, next) {
          if (req.method === "HEAD") {
            res.append("Date", new Date().toGMTString());
            res.send("");
          } else {
            next();
          }
        });
      }
    },
    performance: {
      // Ignore media and sourcemaps when warning about file size.
      assetFilter(assetFilename) {
        return !/\.(map|png|jpg|gif|glb|webm)$/.test(assetFilename);
      }
    },
    resolve: {
      extensions: ['*', '.js', '.jsx', '.tsx', '.ts', ".json"],
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
        // Some JS assets are loaded at runtime and should be coppied unmodified and loaded using file-loader
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
          include: [path.resolve(__dirname, "src")],
          // Exclude JS assets in node_modules because they are already transformed and often big.
          exclude: [path.resolve(__dirname, "node_modules")],
          loader: "babel-loader"
        },
        {
          test: /\.(scss|css)$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            {
              loader: "css-loader",
              options: {
                name: "[path][name]-[hash].[ext]",
                localIdentName: "[name]__[local]__[hash:base64:5]",
                camelCase: true
              }
            },
            "sass-loader"
          ]
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
    // We no not want to minimize our code. //TODO activate for prod => minimize: true
    //minimize: false,
      minimize: argv.mode === "production" ? true : false,
      splitChunks: {
        maxAsyncRequests: 10,
        maxInitialRequests: 10,
        cacheGroups: {
          frontend: {
            test: deepModuleDependencyTest([
              "react",
              "react-dom",
              "prop-types",
              "raven-js",
              "react-intl",
              "classnames",
              "react-router",
              "@fortawesome/fontawesome-svg-core",
              "@fortawesome/free-solid-svg-icons",
              "@fortawesome/react-fontawesome"
            ]),
            name: "frontend",
            chunks: "initial",
            priority: 40
          },
          engine: {
            test: deepModuleDependencyTest(["aframe", "three"]),
            name: "engine",
            chunks: "initial",
            priority: 30
          },
          store: {
            test: deepModuleDependencyTest(["phoenix", "jsonschema", "event-target-shim", "jwt-decode", "js-cookie"]),
            name: "store",
            chunks: "initial",
            priority: 20
          },
          hubVendors: {
            test: /[\\/]node_modules[\\/]/,
            name: "hub-vendors",
            chunks: chunk => chunk.name === "hub",
            priority: 10
          }
        }
      }
    },
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: env && env.bundleAnalyzer ? "server" : "disabled"
      }),
      // Each output page needs a HTMLWebpackPlugin entry
      new HTMLWebpackPlugin({
        filename: "microsoft-settings.html",
        template: path.join(__dirname, "src/aptero/module/microsoft/page", "microsoft-settings.html"),
        chunks: ["microsoft-settings"],
        chunksSortMode: "manual",
        minify: {
          removeComments: false
        }
      }),
      new HTMLWebpackPlugin({
        filename: "index.html",
        template: path.join(__dirname, "src", "index.html"),
        chunks: ["support", "index"],
        chunksSortMode: "manual",
        minify: {
          removeComments: false
        }
      }),
      new HTMLWebpackPlugin({
        filename: "hub.html",
        template: path.join(__dirname, "src", "hub.html"),
        chunks: ["support", "hub"],
        chunksSortMode: "manual",
        inject: "head",
        minify: {
          removeComments: false
        }
      }),
      new HTMLWebpackPlugin({
        filename: "scene.html",
        template: path.join(__dirname, "src", "scene.html"),
        chunks: ["support", "scene"],
        chunksSortMode: "manual",
        inject: "head",
        minify: {
          removeComments: false
        }
      }),
      new HTMLWebpackPlugin({
        filename: "link.html",
        template: path.join(__dirname, "src", "link.html"),
        chunks: ["support", "link"],
        chunksSortMode: "manual",
        minify: {
          removeComments: false
        }
      }),
      new HTMLWebpackPlugin({
        filename: "signin.html",
        template: path.join(__dirname, "src", "signin.html"),
        chunks: ["signin"],
        minify: {
          removeComments: false
        }
      }),
      new CopyWebpackPlugin([
        {
          from: "src/hub.service.js",
          to: "hub.service.js"
        }
      ]),
      new CopyWebpackPlugin([
        {
          from: "src/schema.toml",
          to: "schema.toml"
        }
      ]),
    new CopyWebpackPlugin([
      {
        from: "src/aptero/module/properties/properties.js",
        to: "properties.js"
      }
    ]),
    new CopyWebpackPlugin([
      {
        from: "src/assets/images/favicon.ico",
        to: "favicon.ico"
      }
    ]),
      new CopyWebpackPlugin([
        {
          from: "src/aptero/module/microsoft/page/auth-start.html",
          to: "auth-start.html"
        }
      ]),
      new CopyWebpackPlugin([
        {
          from: "src/aptero/module/microsoft/page/auth-end.html",
          to: "auth-end.html"
        }
      ]),
      new CopyWebpackPlugin([
      {
        from: "src/assets/manifest.webmanifest",
        to: "manifest.webmanifest"
      }
    ]),
    new CopyWebpackPlugin([
      {
        from: "src/assets/static/",
        to: "assets/static/"
      }
    ]),
    new CopyWebpackPlugin([
      {
        from: "src/workers/pdfjs-dist@2.1.266/build/pdf.worker.js",
        to: "workers/pdfjs-dist@2.1.266/build/pdf.worker.js"
      }
    ]),
    // Extract required css and add a content hash.
    new MiniCssExtractPlugin({
      filename: "assets/stylesheets/[name]-[contenthash].css",
      disable: argv.mode !== "production"
      }),
      // Define process.env variables in the browser context.
      new webpack.DefinePlugin({
        "process.env": JSON.stringify({
          /*NODE_ENV: argv.mode,
          SHORTLINK_DOMAIN: process.env.SHORTLINK_DOMAIN,
          RETICULUM_SERVER: process.env.RETICULUM_SERVER,
          RETICULUM_SOCKET_SERVER: process.env.RETICULUM_SOCKET_SERVER,
          THUMBNAIL_SERVER: process.env.THUMBNAIL_SERVER,
          CORS_PROXY_SERVER: process.env.CORS_PROXY_SERVER,
          NON_CORS_PROXY_DOMAINS: process.env.NON_CORS_PROXY_DOMAINS,*/
          BUILD_VERSION: versionJson.version,
          /*SENTRY_DSN: process.env.SENTRY_DSN,
          GA_TRACKING_ID: process.env.GA_TRACKING_ID,
          POSTGREST_SERVER: process.env.POSTGREST_SERVER,
          APP_CONFIG: appConfig*/
        })
      })
    ]
  };
};
