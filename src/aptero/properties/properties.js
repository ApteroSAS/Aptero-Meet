window.APP_PROPS = {
  // To override these variables, create a .env file containing the overrides.

  // The Reticulum backend to connect to. Used for storing information about active hubs.
  // change this in default.conf also
  PROTOCOL: "https://",

  SHORTLINK_DOMAIN:"alphahub.aptero.co",

  RETICULUM_SERVER: "alphahub.aptero.co",

  // CORS proxy.
  CORS_PROXY_SERVER: "corsproxy.aptero.co",

  // The thumbnailing backend to connect to.
  // See here for the server code: https://github.com/MozillaReality/farspark or https://github.com/MozillaReality/nearspark
  THUMBNAIL_SERVER: "",

  // Comma-separated list of domains which are known to not need CORS proxying
  NON_CORS_PROXY_DOMAINS: "alphahub.aptero.co",

  // A comma-separated list of environment URLs to make available in the picker, besides the defaults.
  // These URLs are expected to be relative to ASSET_BUNDLE_SERVER.
  EXTRA_ENVIRONMENTS: "",

  // The root URL under which Hubs expects static assets to be served.
  BASE_ASSETS_PATH: "/",

  DEFAULT_SCENE_SID: "h8xwUAc",

  AVAILABLE_INTEGRATIONS:{"objects":true, "videos360":true, "videos2d":true, "scenes":true, "avatars":true,"tenor":false,"poly":false, "sketchfab":false,"bing_videos":false},

  REMOTE_VM_SERVICE:{ url:"meet.aptero.co"},
  WEBRTC_BRIDGE_URL:"http://localhost:8195",

  APP_CONFIG: {
    MICROSOFT_APP_ID: "caafb04c-8c13-4044-92a4-3648f79dc7e3",
    MICROSOFT_APP_AUTHORITY: "https://login.microsoftonline.com/apteroco.onmicrosoft.com",
    GLOBAL_ASSETS_PATH: "https://hub.aptero.co/data/global/",
    LOGGER:{
      URL:"https://aptero.co/tracking",
      ACTIVATED:false,
      ORIGIN:"meet-frontend-localhost"
    },
    adapterParams: {
      adapter: "dialog-io",//dialog,dialog-io,janus,twilio,agora,default,none,socketio
    },
    turn:{
      twilio:{
        SID:"AC2b4884e41acc8b8ed9f7ee795969d76b",
        auth:"U0tjYzMxZDM0N2YxOGVlYmM3MjNiMDgzNTc0ZTE2MWJjMDp6bFM1TjNmbGhWMEdOc0ZLcG1vbFBucW1TcWdMbEliNQ=="
      }
    },
    features: {
      hide_powered_by: true,
      show_feedback_ui: false,
      disable_room_creation: true,
      staticObjectManipulator: true //warning bug if set to false
    },
    links:{
      privacy_notice:"https://aptero.co/privacy.html",
      terms_of_use:"https://aptero.co/terms.html",
    },
    theme: {
      "dark-theme": false
    }
  }

};

window.getPreferences = function(key) {
  return (window.APP.override && window.APP.override.preferences[key]) || window.APP.store.state.preferences[key];
};
