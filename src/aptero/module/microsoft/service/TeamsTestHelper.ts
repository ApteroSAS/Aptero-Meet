import {msTeams} from "../MsTeams";
export const ERROR_LOG_NOTIFICATION = "ERROR_LOG_NOTIFICATION";
export const WARN_LOG_NOTIFICATION = "WARN_LOG_NOTIFICATION";
export const THROW_NOTIFICATION = "THROW_NOTIFICATION";

//window.postMessage(JSON.stringify({type:"THROW_NOTIFICATION", data:{}}), "*");
function sendIframeMessage(type, data) {
    if (window.parent && window.parent.postMessage) {
        window.parent.postMessage(JSON.stringify({type, data}), "*");
    }
}

if(msTeams()) {
    //if we are in msTeams the app will always be in an iframe this file aims to help the CI in this case
    const oldWarn = console.warn;
    console.warn = (a,...args) => {
        try {
            sendIframeMessage(WARN_LOG_NOTIFICATION, "console warn reporter");
        }catch (e){}
        return oldWarn(a,args);
    }
    const oldError = console.error;
    console.error = (a,...args) => {
        try {
            sendIframeMessage(ERROR_LOG_NOTIFICATION,"console error reporter");
        }catch (e){}
        return oldError(a,args);
    }
    const oldOnerror = window.onerror
    window.onerror = (...args) => {
        try {
            sendIframeMessage(THROW_NOTIFICATION,"console error reporter");
        }catch (e){}
        return oldOnerror(...args);
    }
}