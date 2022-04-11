const EventEmitter = require("eventemitter3");

export const AUTH_TOKEN = "ms-teams-auth-token";
export const CHANGE_SETTINGS_URL = "ms-teams-change-settings-url";
export const PROCESS_DEEPLINK = "ms-teams-deep-link";
import * as microsoftTeams from "@microsoft/teams-js";

let url = new URL(window.location.href);
let msmode = !!url.searchParams.get("msteams");
let eventListener = new EventEmitter();

export function sendEvent(type, data) {
  eventListener.emit(type, data);
}

export function getMSEvents(){
  return eventListener;
}

export function changeUrlSettings(url){
  sendEvent(CHANGE_SETTINGS_URL,{url});
}

export function sendAuthToken(token){
  sendEvent(AUTH_TOKEN, token);
}

export function msTeams(){
  return msmode;
}

export function getContext(callback){
  // https://docs.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/access-teams-context
  //"frameContext": "The context where tab URL is loaded (for example, content, task, setting, remove, sidePanel)",
  microsoftTeams.getContext(callback);
}

export function processDeepLink(link){
  if(msTeams()) {
    sendEvent(PROCESS_DEEPLINK,{link});
  }else{
    window.open(link, '_blank');
  }
}

