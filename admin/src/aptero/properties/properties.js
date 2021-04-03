window.APP_PROPS = {

  HOST: "localhost",
  CORS_PROXY_SERVER: "alphahub.aptero.co",
  BASE_ASSETS_PATH: "https://localhost:8080/",

  // Services we should configure in this UI.
  CONFIGURABLE_SERVICES: "janus-gateway,reticulum,hubs,spoke",

  // The Ita service, for configuration schemas and updates. (In the future this
  // will probably be proxied through Reticulum.)
  ITA_SERVER: "",

  // The Reticulum backend to connect to. Used for storing information about active hubs.
  // See here for the server code: https://github.com/mozilla/reticulum
  RETICULUM_SERVER: "alphahub.aptero.co",
  NON_CORS_PROXY_DOMAINS: "alphahub.aptero.co,hub.aptero.co",
  RETICULUM_SOCKET_SERVER: "alphahub.aptero.co",

  // PostgREST server configured to allow administrative access to the db.
  //POSTGREST_SERVER: "https://alphahub.aptero.co/postgrest",
  POSTGREST_SERVER: "",

  APP_CONFIG: {}

};

window.getPreferences = function(key) {
  return (window.APP.override && window.APP.override.preferences[key]) || window.APP.store.state.preferences[key];
};
