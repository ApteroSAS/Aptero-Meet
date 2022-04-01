const EventEmitter = require("eventemitter3");

export const INIT_OK = "ms-teams-init-ok";
export const REQUEST_AUTH_TOKEN = "ms-teams-request-auth-token";
export const AUTH_TOKEN = "ms-teams-auth-token";
export const CHANGE_USER = "ms-teams-change-selected-user";
export const CHANGE_SETTINGS_URL = "ms-teams-change-settings-url";
export const DECLARE_FRAME_SIZE = "ms-teams-declare-frame-size";
export const REQUEST_USER_INFO = "ms-teams-request-user-info";
export const USER_INFO = "ms-teams-user-info";
export const PROCESS_DEEPLINK = "ms-teams-deep-link";

let url = new URL(window.location.href);
let msmode = !!url.searchParams.get("msteams");

export function sendIframeMessage(type, data) {
  this.eventListener.emit(type, data);
}

let eventListener = new EventEmitter();

export function getMSEvents(){
  return eventListener;
}

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

export function msTeams(){
  return msmode;
}

export function processDeepLink(link){
  if(msTeams()) {
    sendIframeMessage(PROCESS_DEEPLINK,{link});
  }else{
    window.open(link, '_blank');
  }
}

