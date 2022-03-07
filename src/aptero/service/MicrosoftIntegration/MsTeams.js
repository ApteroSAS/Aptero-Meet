let url = new URL(window.location.href);
let msmode = !!url.searchParams.get("msteams");
const EventEmitter = require("eventemitter3");

let eventListener = new EventEmitter();
export const INIT_OK = "ms-teams-init-ok";
export const REQUEST_AUTH_TOKEN = "ms-teams-request-auth-token";
export const AUTH_TOKEN = "ms-teams-auth-token";
export const CHANGE_USER = "ms-teams-change-selected-user";

export function sendIframeMessage(type, data) {
  if (window.parent) {
    window.parent.postMessage(JSON.stringify({ type, data }), "*");
  }
}

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



export async function requestAuthToken(callback){
  eventListener.once(AUTH_TOKEN,data => {
    callback(data.token);
  });
  sendIframeMessage(REQUEST_AUTH_TOKEN,{});
}

export async function msTeamsInitOkRequestAuthToken(callback){
  eventListener.once(INIT_OK,() => {
    requestAuthToken(callback)
  })
}

export function changeSelectedUser(email){
    sendIframeMessage(CHANGE_USER,{email});
}

export function msTeams(){
  return msmode;
}
