import EventEmitter from "eventemitter3";

export const LOGGED_BASIC_INFO = "ms-auth-basic-info";
export const TOKEN_RECEIVED = "ms-auth-basic-info";
let events = new EventEmitter();

export function getAuthEvents(){
  return events;
}
