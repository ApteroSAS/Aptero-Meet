const EventEmitter = require("eventemitter3");

export const INIT_OK = "ms-teams-init-ok";
export const REQUEST_AUTH_TOKEN = "ms-teams-request-auth-token";
export const AUTH_TOKEN = "ms-teams-auth-token";
export const CHANGE_USER = "ms-teams-change-selected-user";
export const CHANGE_SETTINGS_URL = "ms-teams-change-settings-url";
export const DECLARE_FRAME_SIZE = "ms-teams-declare-frame-size";
export const REQUEST_USER_INFO = "ms-teams-request-user-info";
export const USER_INFO = "ms-teams-user-info";
export const RELOAD = "ms-teams-reload";

let url = new URL(window.location.href);
let msmode = !!url.searchParams.get("msteams");

export function sendIframeMessage(type, data) {
  if (window.parent) {
    window.parent.postMessage(JSON.stringify({ type, data }), "*");
  }
}

let eventListener = new EventEmitter();
window.addEventListener("message", event => {
  try {
    if (event.data) {
      var message = JSON.parse(event.data);
      if (message.type) {
        eventListener.emit(message.type, message.data)
      }
    }
  }catch(err){
    //ignore data
  }
});
eventListener.once(RELOAD,() => {
  window.location.reload();
});


export async function requestAuthToken(callback){
  eventListener.once(AUTH_TOKEN,data => {
    callback(data.token);
  });
  sendIframeMessage(REQUEST_AUTH_TOKEN,{});
}

export async function requestUserInfo(callback){
  eventListener.once(USER_INFO,data => {
    callback(data);
  });
  sendIframeMessage(REQUEST_USER_INFO,{});
}

export async function msTeamsWaitInit(){
  return new Promise((resolve) => {
    eventListener.once(INIT_OK,() => {
      resolve()
    })
  })
}

export function changeSelectedUserByMail(email){
    sendIframeMessage(CHANGE_USER,{email});
}

export function changeSelectedUserByUID(msUserID){
  sendIframeMessage(CHANGE_USER,{uid:msUserID});
}

export function changeUrlSettings(url){
  sendIframeMessage(CHANGE_SETTINGS_URL,{url});
}

export function declareFrameSize(size){
  sendIframeMessage(DECLARE_FRAME_SIZE,{size});
}

export function msTeams(){
  return msmode;
}
