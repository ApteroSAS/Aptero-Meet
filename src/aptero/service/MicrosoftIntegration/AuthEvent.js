import EventEmitter from "eventemitter3";

export const LOGGED_BASIC_INFO = "ms-auth-basic-info";
export const TOKEN_RECEIVED = "ms-auth-basic-info";
export const SIGN_IN_COMPLETE = "ms-auth-sign-in-complete";
let events = new EventEmitter();

events.on(SIGN_IN_COMPLETE,()=>{
  console.log("SIGN_IN_COMPLETE");
});

export function getAuthEvents(){
  return events;
}
