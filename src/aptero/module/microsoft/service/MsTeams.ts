import { msTeams as msTeams2} from "../MsTeams";//TODO cleaning

const EventEmitter = require("eventemitter3");

export const CHANGE_SETTINGS_URL = "ms-teams-change-settings-url";
export const PROCESS_DEEPLINK = "ms-teams-deep-link";
import * as microsoftTeams from "@microsoft/teams-js";

let eventListener = new EventEmitter();

export function sendEvent(type, data) {
  eventListener.emit(type, data);
}

export function getMSEvents(){
  return eventListener;
}

export function msTeams(){
  return msTeams2();
}

export function changeUrlSettings(url){
  sendEvent(CHANGE_SETTINGS_URL,{url});
}

export async function getContext(callback){
  try {
    await microsoftTeams.initialize();
    // https://docs.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/access-teams-context
    //"frameContext": "The context where tab URL is loaded (for example, content, task, setting, remove, sidePanel)",
    microsoftTeams.getContext(callback);
  }catch (e) {
    console.error(e);
  }
}

export function processDeepLink(link){
  if(msTeams()) {
    sendEvent(PROCESS_DEEPLINK,{link});
  }else{
    window.open(link, '_blank');
  }
}

