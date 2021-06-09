module.exports = {
  parser: "babel-eslint",
  env: {
    browser: true,
    es6: true,
    node: true
  },
  globals: {
    THREE: true,
    AFRAME: true,
    NAF: true
  },
  plugins: ["prettier", "react"],
  rules: {
    "react/prop-types": "off",
    "prettier/prettier": "warn",
    "prefer-const": "warn",
    "no-use-before-define": "warn",
    "no-var": "warn",
    "no-throw-literal": "warn",
    "no-console": "off"
  },
  extends: ["prettier", "plugin:react/recommended", "eslint:recommended"]
};
