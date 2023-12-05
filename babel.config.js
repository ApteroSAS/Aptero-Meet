// babel.config.js
const plugins = [
  // TODO: When i18n build pipeline is finished move to: [ "react-intl", { "removeDefaultMessage": true } ]
  "react-intl",
  "transform-react-jsx-img-import",
  ["@babel/plugin-proposal-decorators", { "legacy": true }],//Aptero used for inversify
  ["@babel/proposal-class-properties", { "loose": true }],
  "@babel/proposal-object-rest-spread",
  // Samsung Internet on the Oculus Go version is stuck at version 5.2, which is a
  // Chromium 51, as of this writing. It needs babel to transpile async/await.
  "@babel/plugin-transform-async-to-generator",
  "@babel/plugin-proposal-optional-chaining",
  ["@babel/plugin-transform-typescript",{
    //https://babeljs.io/docs/en/babel-plugin-transform-typescript
    isTSX:true
  }]
];

// Instrument for code coverage in development mode
if (process.env.USE_BABEL_PLUGIN_ISTANBUL) {
  console.log(
    "Detected USE_BABEL_PLUGIN_ISTANBUL. Instrumenting code for coverage."
  );
  plugins.push("babel-plugin-istanbul");
}

module.exports = {
  presets:  [
    "@babel/react",
    "@babel/preset-typescript",
    ["@babel/env",
      {
        "loose": true,
        "exclude": [
          "transform-regenerator"
        ],
        "targets": {
          "browsers": [
            "last 2 major versions",
            "not <= 0.5%",
            "not dead",
            // No WebRTC support (including datachannels)
            "ios_saf > 11",
            "safari > 11",
            "not ie >= 0",
            "not edge >= 0",
            "not ie_mob >= 0",
            "not and_uc >= 0",
            // No WebGL or WebRTC support
            "not op_mini all"
          ]
        },
        // false = do not polyfill stuff unneccessarily
        "useBuiltIns": false
      }
    ]
  ],
  plugins,
};
