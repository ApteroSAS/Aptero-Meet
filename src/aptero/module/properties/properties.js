window.APP_PROPS = {
  // To override these variables, create a .env file containing the overrides.

  // The Reticulum backend to connect to. Used for storing information about active hubs.
  // change this in default.conf also
  PROTOCOL: "https://",

  SHORTLINK_DOMAIN:"local.aptero.co",
  RETICULUM_SERVER: "local.aptero.co",

  // The thumbnailing backend to connect to.
  THUMBNAIL_SERVER: "",

  // Comma-separated list of domains which are known to not need CORS proxying
  NON_CORS_PROXY_DOMAINS: "aptero.co, digitaloceanspaces.com",
  // CORS proxy.
  //CORS_PROXY_SERVER: "corsproxy.aptero.co",
  CORS_PROXY_SERVER: "local.aptero.co",

  // A comma-separated list of environment URLs to make available in the picker, besides the defaults.
  // These URLs are expected to be relative to ASSET_BUNDLE_SERVER.
  EXTRA_ENVIRONMENTS: "",

  // The root URL under which Hubs expects static assets to be served.
  BASE_ASSETS_PATH: "/",

  //default
  DEFAULT_SCENE_SID:"hKCV8nS",

  AVAILABLE_INTEGRATIONS:{"objects":true, "videos360":true, "videos2d":true, "scenes":true, "avatars":true,"tenor":false,"poly":false, "sketchfab":false,"bing_videos":false},

  REMOTE_VM_SERVICE:{ url:"local.aptero.co"},

  GA_TRACKING_ID:"",

  APP_CONFIG: {
    MICROSOFT_APP_ID:"",
    MICROSOFT_APP_AUTHORITY:"",
    GLOBAL_ASSETS_PATH:"https://local.aptero.co/data/global/",
    LOGGER:{
      URL:"",
      ACTIVATED:false,
      ORIGIN:"meet-frontend-beelink"
    },
    adapterParams: {
      adapter: "none",//dialog,dialog-io,janus,twilio,agora
      transport: "WebSocketIOTransport",
      //url:"https://meet.aptero.co/service/agora"
      //url:"https://meet.aptero.co/service/twilio/token"
    },
    turn:{
      twilio:{
        SID:"",
        auth:""
      }
    },
    features: {
      //keeps this object even if no features are present
      fast_room_switching: true,
      hide_powered_by: true,
      show_feedback_ui : false,
      disable_room_creation : true
    },
    links:{
      privacy_notice:"https://local.aptero.co/privacy.html",
      terms_of_use:"https://local.aptero.co/terms.html",
    },
    theme:{
      "dark-theme":false,
      "action-color":"#F59C26",
      "action-color-highlight":"#F59C26",
      "action-text-color":"#F59C26",
      "action-subtitle-color":"#F59C26",
      "action-label-color":"#F59C26",
      "notice-background-color":"#F59C26",
      "notice-text-color":"#F59C26",
      "notice-widget-color":"#F59C26",
      "favorited-color":"#F59C26",
      /*
      DOCUMENTATION
      theme.dark-theme = { category = "theme", type = "boolean", name = "Dark Mode", description = "Use dark UI styling." }
      theme.action-color = { category = "theme", type = "color", name = "Primary Color", description = "Call to action button color." }
      theme.action-color-highlight = { category = "theme", type = "color", name = "Highlighted Primary Color", description = "Highlighted call to action color." }
      theme.action-color-disabled = { category = "theme", type = "color", name = "Disabled Primary Color", description = "Disabled call to action color." }
      theme.action-text-color = { category = "theme", type = "color", name = "Primary Text Color", description = "Call to action button text color." }
      theme.action-subtitle-color = { category = "theme", type = "color", name = "Primary Subtitle Color", description = "Call to action button subtitle text color." }
      theme.action-label-color = { category = "theme", type = "color", name = "Primary Label Color", description = "Call to action label color." }
      theme.notice-background-color = { category = "theme", type = "color", name = "Secondary Color", description = "Notice and indicator color." }
      theme.notice-text-color = { category = "theme", type = "color", name = "Secondary Text Color", description = "Notice and indicator text color." }
      theme.notice-widget-color = { category = "theme", type = "color", name = "Secondary Widget Color", description = "Notice and indicator UI widget color." }
      theme.favorited-color = { category = "theme", type = "color", name = "Favorited Color", description = "Favorited Color" }
      */
    }
  }

};

window.getPreferences = function(key) {
  return (window.APP.override && window.APP.override.preferences[key]) || window.APP.store.state.preferences[key];
};