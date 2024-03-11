// Instrument for code coverage in development mode
if (process.env.USE_BABEL_PLUGIN_ISTANBUL) {
  console.log(
    "Detected USE_BABEL_PLUGIN_ISTANBUL. Instrumenting code for coverage."
  );
  plugins.push("babel-plugin-istanbul");
}

module.exports = {
  presets: [
    "@babel/react",
    [
      "@babel/env",
      {
        // targets are defined in .browserslistrc
        useBuiltIns: "entry",
        // This should be kept up to date with thee version in package.json
        corejs: "3.24.1",
        // We care more about perf than exactly conforming to the spec
        loose: true,
        exclude: [
          // These exist since forever but end up being polyfilled anyway because of an obscure issue if length is not writeable
          "es.array.push",
          "es.array.unshift"
        ],
        // Enable to sse resolved targets and polyfills being used
        debug: false
      }
    ],
    "@babel/typescript"
  ],
  plugins: [
    // TODO: When i18n build pipeline is finished move to: [ "react-intl", { "removeDefaultMessage": true } ]
    "react-intl",
    ["@babel/plugin-proposal-decorators", { "legacy": true }],//Aptero used for inversify
    ["@babel/proposal-class-properties", { loose: true }],
    ["@babel/plugin-proposal-private-property-in-object", { loose: true }],
    ["@babel/plugin-proposal-private-methods", { loose: true }],
    "@babel/proposal-object-rest-spread",
    // Samsung Internet on the Oculus Go version is stuck at version 5.2, which is a
    // Chromium 51, as of this writing. It needs babel to transpile async/await.
    "@babel/plugin-transform-async-to-generator",
    "@babel/plugin-proposal-optional-chaining"
  ]
};
