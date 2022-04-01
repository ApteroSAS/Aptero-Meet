import {getMSEvents} from "./MsTeams";

export const INIT_OK = "ms-teams-init-ok";
export const REQUEST_AUTH_TOKEN = "ms-teams-request-auth-token";
export const AUTH_TOKEN = "ms-teams-auth-token";
export const CHANGE_USER = "ms-teams-change-selected-user";
export const CHANGE_SETTINGS_URL = "ms-teams-change-settings-url";
export const DECLARE_FRAME_SIZE = "ms-teams-declare-frame-size";
export const REQUEST_USER_INFO = "ms-teams-request-user-info";
export const USER_INFO = "ms-teams-user-info";
export const PROCESS_DEEPLINK = "ms-teams-deep-link";

export class MeetVsTeamsBridge {

    eventListener = getMSEvents();
    iframe = null;

    setIframe() {
        //this can comes from react and thus beware of spam
        this.iframe = {};
        if (this.iframe) {
            this.sendIframeMessage(INIT_OK, {});
        }
    }

    sendIframeMessage(type, data) {
        this.eventListener.emit(type, data);
    }

}

export const meetVsTeamsBridge = new MeetVsTeamsBridge();



//on auth token
//on auth token request